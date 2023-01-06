require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');

// create the connection to the database without using pool
// const connection = await mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PW,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   ssl: {
//     ca: fs.readFileSync(__dirname + process.env.CRT),
//   },
// });

// query the database using single connection
// const [rows] = await connection.execute(`SELECT * FROM ${table}`);
// return rows;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(__dirname + process.env.CRT),
  },
  connectionLimit: 100,
  queueLimit: 0,
});

const promisePool = pool.promise();

module.exports.getRecords = async function (table) {
  // query the database using pooled connection
  const [rows] = await promisePool.query(
    `SELECT * FROM ${table} where Processed_Date is null`
  );
  return rows;
};

module.exports.updateRecord = async function (
  table,
  column,
  billingAgreement,
  stagingId,
  values
) {
  const sql = `UPDATE ${table} SET ${column} = ? WHERE ${billingAgreement} = ? AND ${stagingId} = ?`;
  const response = await promisePool.execute(
    sql,
    values,
    function (err, results, fields) {
      if (err) {
        context.log('There was an error updating the database record:', err);
        return err;
      }
      return results;
    }
  );
  return response;
};

module.exports.writeErrors = async function (table, columns, values) {
  const sql = `INSERT INTO ${table} (${columns}) VALUES ?`;
  const response = await promisePool.execute(
    sql,
    [values],
    function (err, results, fields) {
      if (err) {
        context.log('There was an error logging errors to the database:', err);
        return err;
      }
      return results;
    }
  );
  return response;
};
