const df = require("durable-functions");

module.exports = df.orchestrator(function* (context) {
  const paypalToken = yield context.df.callActivity("obtainAccessToken", null)

  return paypalToken;
});
