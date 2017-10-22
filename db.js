let connection;

if (process.env.NODE_ENV === "production") {
  const mysql = require("mysql");
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  connection.connect();
} else {
  const sqlite3 = require("sqlite3").verbose();
  connection = new sqlite3.Database("./sqlite/dev.db");

  connection.all("SELECT 1 AS success", (err, rows) => {
    if (err) throw err;
    console.log(`Connected to sqlite: ${rows[0].success}`);
  });
}

module.exports = connection;
