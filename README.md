# PayPal Process Service

This Azure Durable Function retrieves and processes a daily batch of recurring payments with billing agreement IDs using the PayPal API. The process is outlined as follows:

1. getRecords: Checks database to see if any records are available to process for the day.
    * If valid records exist, return them to the activityPayload object and move to next step.
    * If no valid records exist, end the process after execution.

2. getAccessToken: Queries the PayPal API to obtain a bearer token and return it to the activityPayload object.
    * This step is necessary because PayPal requires an active bearer token to be passed for each API query.

3. processRecords: Queries the PayPal API for each record stored in the records array in the activityPayload object.
    * Insert current date/time into database for each record after processing.
    * If errors occur, store them in the errors array in the results object (which is eventually returned to the activityPayload object) and move to next step.
    * If no errors occur, end the process after execution.

4. writeErrors: Writes errors from the errors array in the activityPayload object to the database.

## Setup

* Rename ".env.placeholder" to ".env" and update placeholder values with your own.
* Depending on your database table structure, you may need to adjust the database functions in the database.js file as well as the database function invocations and table references in getRecords, processRecords, and writeErrors.
* If you are a first-timer to Microsoft durable functions, it is highly recommended to reference Microsoft's durable function documentation to better understand how they work: <https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview?tabs=javascript>

## Key Dependencies

* axios to send API queries: <https://github.com/axios/axios>
* dotenv to load environment variables from a .env file: <https://github.com/motdotla/dotenv>
* durable-functions to work with Microsoft durable functions in Node.js: <https://github.com/Azure/azure-functions-durable-js>
* mysql2 to communicate with a MySQL database housed in Microsoft Azure: <https://github.com/sidorares/node-mysql2>
* uuid to generate unique strings to populate the PayPal-Request-Id header: <https://github.com/uuidjs/uuid>