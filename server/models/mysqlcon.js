require("dotenv").config();
const mysql = require("mysql2/promise");
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;
const pool = mysql.createPool({
  host: DB_HOST,
  password: DB_PASSWORD,
  user: DB_USERNAME,
  database: DB_DATABASE,
});

// connection.connect(function (err) {
//   if (err) {
//     console.log("can't connect to DB" + err.stack);
//   } else {
//     console.log("connect to DB successfully");
//   }
// });
module.exports = {
  mysql,
  pool,
};
