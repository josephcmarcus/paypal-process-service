const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
  const activityPayload = {
    instanceId: context.df.instanceId,
    paypalToken: '',
    records: [],
    errors: [],
  };
  const outputs = [];
  let errors;

  const paypalToken = yield context.df.callActivity('getAccessToken', activityPayload);
  if (paypalToken === null) {
    const message = `Could not process records for ID = '${activityPayload.instanceId}'. An error occurred in the getAccessToken function.`;
    context.log(message)
    return message;
  };

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
  };
  
  activityPayload.records = records;

  // change processRecordsTest back to processRecords when finished testing
  const results = yield context.df.callActivity('processRecords', activityPayload);
  if (results.errors.length !== 0) {
    activityPayload.errors = results.errors
    errors = yield context.df.callActivity('writeErrors', activityPayload);
  };

  outputs.push(records, results, errors);

  return outputs;
});