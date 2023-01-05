const database = require('../database');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv').config();
const getDateTime = require('../utils/getDateTime');

const table = process.env.DB_TEST_TABLE; // change this back to the production table

module.exports = async function (context) {
  const { paypalToken, records, instanceId } = context.bindingData.args;

  const results = {
    recordsReceived: records.length,
    recordsProcessed: 0,
    errors: [],
  };

  for (const record of records) {
    try {
      context.log(
        `Executing processRecords for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'.`
      );

      // Generate uuid string to pass to PayPal-Request-Id header as this is required by the API
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
        `processRecords succeeded for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = ${instanceId}: ${response.status}`
      );
      try {
        // update the processed column in the mysql db with a timestamp
        const date = getDateTime();
        
        await database.updateRecord(
          table,
          'Processed_Date',
          'Billing_Agreement',
          'PPStagingID',
          [date, record.Billing_Agreement, record.PPStagingID]
        );
        context.log(
          `processRecords succeeded to update database for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'.`
        );
      } catch (err) {
        context.log(
          `processRecords failed to update database for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'. ${err}`
        );
      }

      results.recordsProcessed++;

      context.log(
        `processRecords succeeded to update database for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'. ${err}`
      );
    } catch (err) {
      const error = {
        Billing_Agreement: record.Billing_Agreement,
        PPStagingID: record.PPStagingID,
        instanceId: instanceId,
        error: err,
      }
      results.errors.push(error);
      context.log(
        `processRecords failed for ${record.Billing_Agreement} / ${record.PPStagingID} of instance = '${instanceId}'. ${err}`
      );
    }
  }
  context.log(
    `processRecords finished. Records received: ${results.recordsReceived}. Records processed: ${results.recordsProcessed}. Errors: ${results.errors.length}`
  );

  return results;
};
