import fs from 'fs';
const fileSystem = fs;
const fsPromise = fs.promises;
import path from 'path'
import process from 'process'
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis'

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
          try {
                    const content = await fsPromise.readFile(TOKEN_PATH);
                    const credentials = JSON.parse(content);
                    return google.auth.fromJSON(credentials);
          } catch (err) {
                    return null;
          }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
          const content = await fsPromise.readFile(CREDENTIALS_PATH);
          const keys = JSON.parse(content);
          const key = keys.installed || keys.web;
          const payload = JSON.stringify({
                    type: 'authorized_user',
                    client_id: key.client_id,
                    client_secret: key.client_secret,
                    refresh_token: client.credentials.refresh_token,
          });
          await fsPromise.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
const authorize = async function () {
          let client = await loadSavedCredentialsIfExist();
          if (client) {
                    return client;
          }
          client = await authenticate({
                    scopes: SCOPES,
                    keyfilePath: CREDENTIALS_PATH,
          });
          if (client.credentials) {
                    await saveCredentials(client);
          }
          return client;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
const uploadFile = async function (authClient, fileName) {
          const drive = google.drive({ version: 'v3', auth: authClient });
          const filesMetaData = {
                    'name': fileName
          };
          const media = {
                    mimeType: '*/*',
                    body: fileSystem.createReadStream(`./${fileName}`)
          }
          drive.files.create({
                    auth: authClient,
                    resource: filesMetaData,
                    media: media

          }, async (err) => {
                    try {
                              if (err) {
                                        console.log(err);
                                        fileSystem.unlink(`./${fileName}`, function (err) {
                                                  if (err) throw err;
                                                  // if no error, file has been deleted successfully
                                                  console.log(fileName + 'deleted!');
                                        });

                              }
                              else {
                                        console.log(fileName + 'uploaded');
                                        fileSystem.unlink(`./${fileName}`, function (err) {
                                                  if (err) throw err;
                                                  // if no error, file has been deleted successfully
                                                  console.log(fileName + 'deleted!');
                                        });
                              }
                    }
                    catch (err) {
                              throw (err)
                    }
          })
}

export { authorize, uploadFile };
