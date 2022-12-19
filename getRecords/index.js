const database = require('../database')

module.exports = async function (context) {
    const response = await database.getRecords();
    return response.map((x) => {
        const records = {};
        records['billingAgreement'] = x.Billing_Agreement;
        records['amount'] = x.Amount
        return records;
    });
};