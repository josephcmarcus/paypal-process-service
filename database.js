require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");

module.exports.getRecords = async function () {
  // create the connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
      ca: fs.readFileSync(__dirname + process.env.CRT),
    },
  });

  const table = process.env.DB_TABLE;

  // query the database
  const [rows] = await connection.execute(`SELECT * FROM ${table}`);
  return rows;
};