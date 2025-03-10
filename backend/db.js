const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
console.log("Connecting to MySQL with the following details:");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Database:", process.env.DB_NAME);
console.log("Port:", process.env.DB_PORT);

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
   
  }else{
  console.log("Connected to the MySQL database.");}
});

module.exports = db;