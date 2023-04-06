import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import config from './.config.json';

const logFilePath = `${__dirname}/logs/upload-log.json`;
if (!fs.existsSync(`${__dirname}/logs`)) fs.mkdirSync(`${__dirname}/logs`, { recursive: true });

type log = {
  file: string,
  surname?: string,
  status: string,
  errorMessage?: string,
  at: string
}

const CHUNK_SIZE = 1024 * 1024 * Number(config.chunkSize); // 64MB chunk size

cron.schedule(config.at, async () => {
  console.log('Uploading file to Google Cloud Storage...');
  try {
    if (!config.projectId || !config.gcloudBucketName || !config.absoluteUploadFilePath) throw new Error("Configs not set!!!");

    console.log(`Log entry written to ${logFilePath}.`);

    const logFileContents = await fs.promises.readFile(logFilePath, { flag: 'a+', encoding: 'utf-8' });
    const logEntries = logFileContents ? JSON.parse(logFileContents) : [];

    let logEntry: log = {
      file: config.absoluteUploadFilePath,
      surname: config.uploadFileSurname ?? path.basename(config.absoluteUploadFilePath),
      status: 'initialized',
      at: new Date().toISOString()
    };

    logEntries.push(logEntry);

    await fs.promises.writeFile(logFilePath, JSON.stringify(logEntries, null, 2));

    const fileSize = fs.statSync(config.absoluteUploadFilePath).size;

    const storage = new Storage({ projectId: config.secrets.project_id, credentials: config.secrets });
    const bucket = storage.bucket(config.gcloudBucketName);
    const bucketFile = bucket.file(`${config.uploadFileSurname ?? storage.bucket(config.gcloudBucketName)}_${uuidv4()}`);

    const fileStream = fs.createReadStream(config.absoluteUploadFilePath, {
      highWaterMark: CHUNK_SIZE,
      autoClose: true
    });

    const uploadStream = fileStream.pipe(
      bucketFile.createWriteStream({
        metadata: {
          contentType: 'application/octet-stream',
        },
      })
    );

    uploadStream.on('error', async (err) => {
      console.error(`Error uploading file: ${err.message}`);

      logEntry = {
        file: config.absoluteUploadFilePath,
        surname: config.uploadFileSurname ?? path.basename(config.absoluteUploadFilePath),
        status: 'error',
        errorMessage: err.message,
        at: new Date().toISOString()
      };

      logEntries.push(logEntry);

      await fs.promises.writeFile(logFilePath, JSON.stringify(logEntries, null, 2));
    });

    uploadStream.on('finish', async () => {
      console.log(`File ${config.absoluteUploadFilePath} uploaded to ${config.gcloudBucketName}.`);
      logEntry = {
        file: config.absoluteUploadFilePath,
        surname: config.uploadFileSurname ?? path.basename(config.absoluteUploadFilePath),
        status: 'success',
        at: new Date().toISOString()
      };

      logEntries.push(logEntry);

      await fs.promises.writeFile(logFilePath, JSON.stringify(logEntries, null, 2));
    });

    uploadStream.on('progress', (progress) => {
      const percentComplete = Math.round((progress.bytesWritten / fileSize) * 100);
      console.log(`Uploading ${config.absoluteUploadFilePath}: ${percentComplete}% complete.`);
    });

  } catch (err: any) {
    console.error('ERROR:', err);

    let logEntry: log = {
      file: config.absoluteUploadFilePath,
      surname: config.uploadFileSurname ?? path.basename(config.absoluteUploadFilePath),
      status: 'error',
      errorMessage: err.message,
      at: new Date().toISOString()
    };

    const logFileContents = await fs.promises.readFile(logFilePath, { flag: 'a+', encoding: 'utf-8' });
    const logEntries = logFileContents ? JSON.parse(logFileContents) : [];
    logEntries.push(logEntry);

    await fs.promises.writeFile(logFilePath, JSON.stringify(logEntries, null, 2));

    console.log(`Log entry written to ${logFilePath}.`);
  }
});

console.log('Scheduled script to run every day at 3am.');
