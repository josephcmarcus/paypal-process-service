const database = require('../database')

module.exports = async function (context) {
    return await database.getRecords();
};