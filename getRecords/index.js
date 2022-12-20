const database = require('../database')

module.exports = async function (context) {
    const table = process.env.DB_TEST_TABLE;
    return await database.getRecords(table);
};