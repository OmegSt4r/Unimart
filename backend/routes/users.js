const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// User registration
router.post("/register", async (req, res) => {
  const { username, password, email, userType } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (username, password, email, userType) VALUES (?, ?, ?, ?)";
  db.query(sql, [username, hashedPassword, email, userType], (err, result) => {
    if (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.status(201).json({ message: "User registered successfully", id: result.insertId });
    }
  });
});

// User login
router.post("/login", (req, res) => {
  const { username, password, userType } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND userType = ?";
  db.query(sql, [username, userType], async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Database error" });
    } else if (results.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid credentials" });
      } else {
        const token = jwt.sign({ id: user.id, username: user.username, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token, user });
      }
    }
  });
});

// Get user information
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const sql = "SELECT id, username, email, userType FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user information:", err);
      res.status(500).json({ error: "Database error" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json(results[0]);
    }
  });
});

module.exports = router;