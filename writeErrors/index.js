const database = require('../database');

module.exports = async function (context) {
  const { errors, instanceId } = context.bindingData.args;
  const errorValues = [];
  const table = process.env.DB_ERROR_TABLE;
  const columns = `Billing_Agreement, PPStagingID, InstanceID, Error, Trace, Date`;

  for (error of errors) {
    errorValues.push(Object.values(error));
  }

  try {
    await database.writeErrors(table, columns, errorValues);
    context.log(`writeErrors succeeded to update database for instance = '${instanceId}'.`);
  } catch (err) {
    context.log(`writeErrors failed to update database for instance = '${instanceId}'. ${err}`);
  }
  
  return errorValues;
};
