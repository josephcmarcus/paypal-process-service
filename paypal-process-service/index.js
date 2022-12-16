﻿const df = require("durable-functions");

module.exports = df.orchestrator(function* (context) {
  const outputs = [];

  const paypalToken = yield context.df.callActivity("getAccessToken", null);
  const records = yield context.df.callActivity("getRecords", null);

  outputs.push(paypalToken, records);
  return outputs;

});
