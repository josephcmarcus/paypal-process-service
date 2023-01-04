﻿const database = require('../database');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv').config();

const table = process.env.DB_TEST_TABLE; // change this back to the production table

module.exports = async function (context) {
  // Return await database.updateRecord(table, 'Processed', 'Billing_Agreement', [1, 'B-456TEST']);

  // Obtain the paypalToken, records, and instanceId from the context argument
  const { paypalToken, records, instanceId } = context.bindingData.args;
  // Set recordsReceived to the number of records in the records array
  const recordsReceived = records.length;
  // Set recordsProcessed counter to 0 to increment as records are processed
  let recordsProcessed = 0;

  context.log(
    `Starting processRecords Paypal API query loop for instance = '${instanceId}'.`
  );

  // Loop through records array and process each against the Paypal API
  for (const record of records) {
    try {
      context.log(
        `Executing processRecords for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'.`
      );
      // Generate uuid string to pass to PayPal-Request-Id header
      const paypalRequestId = uuidv4();
      // Send capture call to Paypal API
      const response = await axios({
        method: 'post',
        url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${paypalToken}`,
          'PayPal-Request-Id': paypalRequestId,
          Prefer: 'return=representation',
        },
        data: {
          intent: 'CAPTURE',
          payment_source: {
            token: {
              type: 'BILLING_AGREEMENT',
              id: `${record.Billing_Agreement}`,
            },
          },
          purchase_units: [
            {
              invoice_id: `${record.PPStagingID}`,
              amount: {
                currency_code: 'USD',
                value: `${record.Amount}`,
              },
              payee: {
                email_address: 'info@sidroth.org',
              },
            },
          ],
          application_context: {
            return_url: 'https://sidroth.org/contact-us/',
            cancel_url: 'https://sidroth.org/contact-us/',
          },
        },
      });
      context.log(
        `Response from Paypal for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = ${instanceId}: ${response.status}`
      );
      try {
        // update the processed column with a timestamp for each record in the database
        const date = new Date()
          .toISOString()
          .replace(/T/, ' ')
          .replace(/\..+/, '');
        await database.updateRecord(table, 'Processed_Date', 'Billing_Agreement', 'PPStagingID', [
          date,
          record.Billing_Agreement,
          record.PPStagingID,
        ]);
      } catch (err) {
        context.log(
          `processRecords failed to update database for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'. ${err}`
        );
      }
      // increment the number of records processed for logging purposes
      recordsProcessed++;

      context.log(
        `processRecords succeeded to update database for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'. ${err}`
      );
    } catch (err) {
      context.log(
        `processRecords failed for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'. ${err}`
      );
    }
  }
  const results = `processRecords succeeded. Records received: ${recordsReceived}. Records processed: ${recordsProcessed}`;
  return results;
};
