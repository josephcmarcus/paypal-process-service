const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
  const inputs = [];
  const outputs = [];

  const paypalToken = yield context.df.callActivity('getAccessToken', null);
  const records = yield context.df.callActivity('getRecords', null);
  inputs.push(paypalToken, records);
  const results = yield context.df.callActivity('processRecords', inputs);

  outputs.push(records, results);
  return outputs;
});
