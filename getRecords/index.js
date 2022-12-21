const database = require('../database')

module.exports = async function (context) {
    try {
        context.log('Attempting to obtain records from database')
        const table = process.env.DB_TEST_TABLE;
        context.log('Received records from database')
        return await database.getRecords(table);
    } catch (err) {
        context.log(`Error obtained records from database: ${err}`)
    }
    const table = process.env.DB_TEST_TABLE;
    return await database.getRecords(table);
};