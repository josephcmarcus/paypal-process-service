const database = require('../database')

/* In either this file or elsewhere, need to refine the the way we're grabbing records
from the database. As it stands right now, we'd be grabbing every record from the table.
Instead, we need to only grab relevant records to process – might need to add another
column to the database table or create an advanced query to only pull relevant records. */

module.exports = async function (context) {
    const { instanceId } = context.bindingData.args;

    try {
        context.log(`Starting getRecords database query for instance = '${instanceId}'.`);

        const table = process.env.DB_TEST_TABLE;
        const records = await database.getRecords(table);

        context.log(`getRecords succeeded for ID = '${instanceId}'.`);
        return records;
    } catch (err) {
        context.log(`getRecords failed for ID = '${instanceId}'. ${err}`);
        return null;
    }
};