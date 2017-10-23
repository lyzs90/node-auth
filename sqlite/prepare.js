const sqlite3 = require("sqlite3").verbose();

const connection = new sqlite3.Database("./sqlite/dev.db");

connection.run(`CREATE TABLE IF NOT EXISTS users
  (
    id	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    username	TEXT NOT NULL UNIQUE,
    email	TEXT NOT NULL UNIQUE,
    password	TEXT NOT NULL UNIQUE
  );
`);

connection.close();
