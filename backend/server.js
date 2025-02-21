const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});


db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the MySQL database.");
});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"../frontend/index.html"));
});

const productRoutes = require("./routes/products"); 
const cartRoutes = require("./routes/cart");
//const userRoutes = require("./routes/users");

app.use("/products", productRoutes);
app.use("/cart", cartRoutes);   
//app.use("/users", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
module.exports = app;