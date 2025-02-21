const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all items in the cart for a specific user
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM cart WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching cart items:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// Add an item to the cart
router.post("/", (req, res) => {
  const { user_id, item_id, quantity } = req.body;
  const sql = "INSERT INTO cart (user_id, item_id, quantity) VALUES (?, ?, ?)";
  db.query(sql, [user_id, item_id, quantity], (err, result) => {
    if (err) {
      console.error("Error adding item to cart:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.status(201).json({ message: "Item added to cart", id: result.insertId });
    }
  });
});

// Remove an item from the cart
router.delete("/:userId/:itemId", (req, res) => {
  const { userId, itemId } = req.params;
  const sql = "DELETE FROM cart WHERE user_id = ? AND item_id = ?";
  db.query(sql, [userId, itemId], (err, result) => {
    if (err) {
      console.error("Error removing item from cart:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.status(200).json({ message: "Item removed from cart" });
    }
  });
});

module.exports = router;