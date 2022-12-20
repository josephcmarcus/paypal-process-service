const database = require('../database');
const axios = require('axios');

const table = process.env.DB_TEST_TABLE; // change this back to the production table

module.exports = async function (context) {
  // return await database.updateRecord(table, 'Processed', 'Billing_Agreement', [1, 'B-456TEST']);
  const paypalToken = context.bindings.args[0];
  const records = context.bindings.args[1];
  const recordsReceived = records.length;
  let recordsProcessed = 0;

  // loop through records array and process each against the Paypal API
  for (const record of records) {
    try {
      // send capture call to Paypal API
      const response = await axios({
        method: 'post',
        url: 'http://localhost:3000/paypal', // change this back to Paypal's API url
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${paypalToken}`,
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
        },
      });
      context.log(`Response from Paypal for ${record.Billing_Agreement} / ${record.PPStagingID}: ${response.status}`);
      try {
        // update the processed column with a timestamp for each record in the database
        await database.updateRecord(table, 'Processed', 'Billing_Agreement', [
          new Date().toISOString(),
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
