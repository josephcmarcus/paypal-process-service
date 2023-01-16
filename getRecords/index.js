const database = require('../database')

module.exports = async function (context) {
    const { instanceId } = context.bindingData.args;

    try {
        const table = process.env.DB_TEST_TABLE;
        const records = await database.getRecords(table);

        context.log(`getRecords succeeded for ID = '${instanceId}'. Records received: ${records.length}.`);
        return records;
    } catch (err) {
        context.log(`getRecords failed for ID = '${instanceId}'. ${err}`);
        return null;
    }
};