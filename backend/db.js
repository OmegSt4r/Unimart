const mysql = require("mysql2");
require("dotenv").config();
const isProduction = process.env.NODE_ENV === 'production';
const db = mysql.createConnection({
  host: isProduction ? process.env.DB_HOST : 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: isProduction ? process.env.DB_PORT: 5000,
  ssl: isProduction ? { rejectUnauthorized: true } : false,
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