const database = require('../database');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv').config();

const table = process.env.DB_TEST_TABLE; // change this back to the production table

module.exports = async function (context) {
  // return await database.updateRecord(table, 'Processed', 'Billing_Agreement', [1, 'B-456TEST']);
  const paypalToken = context.bindings.args[0];
  const records = context.bindings.args[1];
  const recordsReceived = records.length;
  let recordsProcessed = 0;
  console.log('Here is the paypalToken:', paypalToken);

  // loop through records array and process each against the Paypal API
  for (const record of records) {
    try {
      // generate uuid string to pass to PayPal-Request-Id header
      const paypalRequestId = uuidv4();
      // send capture call to Paypal API
      const response = await axios({
        method: 'post',
        url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${paypalToken}`,
          'PayPal-Request-Id': paypalRequestId,
          Prefer: 'return=representation'
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
              reference_id: `${record.PPStagingID}`,
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
        `Response from Paypal for ${record.Billing_Agreement} / ${record.PPStagingID}: ${response.status}`
      );
      try {
        // update the processed column with a timestamp for each record in the database
        const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        await database.updateRecord(table, 'Processed', 'Billing_Agreement', [
          date,
          record.Billing_Agreement,
        ]);
      } catch (err) {
        context.log(
          `Error updating database record ${record.Billing_Agreement} / ${record.PPStagingID}: ${err}`
        );
      }
      // increment the number of records processed for logging purposes
      recordsProcessed++;
    } catch (err) {
      context.log(
        `Error from Paypal for record ${record.Billing_Agreement} / ${record.PPStagingID}: ${err}`
      );
    }
  }
  const results = `Records received: ${recordsReceived}. Records processed: ${recordsProcessed}`;
  context.log(results);
  return results;
};
