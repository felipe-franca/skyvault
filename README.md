> This service was generated in NodeJS in version 16.18.1

# Node.js and Service Installation Instructions

## Node.js Installation

1. Visit the Node.js website: https://nodejs.org
2. Download the version indicated for your operating system.
3. Follow the installation instructions for your operating system.
4. Verify that Node.js is installed by opening a terminal window and typing `node -v`. You should see the version number printed to the console.

## Service Installation

1. Clone the repository containing the Node.js service to your local machine.
2. Navigate to the directory containing the service code.
3. Install the necessary dependencies by running `npm install` in the terminal.
4. Create a configuration file with the name `.config.json` in the root directory of the project.
5. Populate the `.config.json` file with the following keys and values:

```json
{
    "projectId": "your_project_id_here",
    "secrets": {
        "type": "service_account",
        "project_id": "gcp project id",
        "private_key_id": "gcp private key id",
        "private_key": "gcp key",
        "client_email": "gcp client email",
        "client_id": "gcp client id",
        "auth_uri": "gcp auth uri",
        "token_uri": "gcp token uri",
        "auth_provider_x509_cert_url": "gcp provier x509 cer url",
        "client_x509_cert_url": "gcp client x509 cert url"
    },
    "gcloudBucketName": "your_gcloud_bucket_name_here",
    "absoluteUploadFilePath": "absolute_path_to_file_to_upload_here",
    "uploadFileSurname": "filename_for_uploaded_file_here",
    "at": "google_access_token_here",
    "chunkSize": "chunk_size_in_bytes_here"
}
```
6. Replace the values with your own values.
7. Start the service by running `node app.js` in the terminal.

That's it! Your service should be up and running, ready to upload files to your Google Cloud bucket. If you run into any issues, make sure to check the console output and the configuration file for errors.

