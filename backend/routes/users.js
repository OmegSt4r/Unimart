const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username) VALUES (?)";
    db.query(sql, [username], (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const userId = result.insertId;
      const sqlInfo = "INSERT INTO user_info (user_id, u_password, email) VALUES (?, ?, ?)";
      db.query(sqlInfo, [userId, hashedPassword, email], (err) => {
        if (err) {
          console.error("Error registering user info:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT u.user_id, u.username, ui.u_password, ui.email, ui.wallet_balance 
    FROM users u 
    JOIN user_info ui ON u.user_id = ui.user_id 
    WHERE u.username = ?
  `;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const storedPassword = user.u_password;

    // Check if password is stored in plain text (bcrypt hashes start with "$2b$")
    const isHashed = storedPassword.startsWith("$2b$");

    if (!isHashed) {
      if (password === storedPassword) {
        // If plain text password matches, hash it and update in database
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateSQL = "UPDATE user_info SET u_password = ? WHERE user_id = ?";

        db.query(updateSQL, [hashedPassword, user.user_id], (updateErr) => {
          if (updateErr) {
            console.error("Error updating password:", updateErr);
          } else {
            console.log("Password securely hashed for user:", user.username);
          }
        });

        // Continue with login
        const token = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({ message: "Login successful", token, user: { id: user.user_id, username: user.username, email: user.email, wallet_balance: user.wallet_balance } });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    // If password is already hashed, verify it using bcrypt
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Successful login
    const token = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login successful", token, user: { id: user.user_id, username: user.username, email: user.email, wallet_balance: user.wallet_balance } });
  });
});

// Get user information
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT u.user_id, u.username, ui.email, ui.wallet_balance
    FROM users u
    JOIN user_info ui ON u.user_id = ui.user_id
    WHERE u.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user information:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sql = "UPDATE user_info SET u_password = ? WHERE email = ?";
    db.query(sql, [hashedPassword, email], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Password reset successfully" });
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;