const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
  const activityPayload = {
    instanceId: context.df.instanceId,
    paypalToken: '',
    records: [],
  };
  const outputs = [];

  const paypalToken = yield context.df.callActivity('getAccessToken', activityPayload);
  if (paypalToken === null) {
    const message = `Could not process records for ID = '${activityPayload.instanceId}'. An error occurred in the getAccessToken function.`;
    context.log(message)
    return message;
  }
  activityPayload.paypalToken = paypalToken;

  const records = yield context.df.callActivity('getRecords', activityPayload);
  if (records === null) {
    const message = `Could not process records for ID = '${activityPayload.instanceId}'. An error occurred in the getRecords function.`;
    context.log(message);
    return message;
  } else if (records.length === 0) {
      const message = `No valid records to process for ID = '${activityPayload.instanceId}'. Exiting function.`;
      context.log(message);
      return message;
  }
  activityPayload.records = records;

  // change processRecordsTest back to processRecords when finished testing
  const results = yield context.df.callActivity('processRecordsTest', activityPayload);

  outputs.push(records, results);
  return outputs;
});


// update getRecords with new SQL logic to only pull records without a process date
// update processRecords to write new SQL date value for each record processed
// add better context logging to processRecords