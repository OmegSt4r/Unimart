const express = require("express");
const router = express.Router();
const db = require("../db");

// Fetch all cart items for a specific user
router.get("/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT c.cart_id, c.user_id, c.item_id AS product_id, p.product_name, p.price, c.quantity
        FROM carts c
        JOIN products p ON c.item_id = p.product_id
        WHERE c.user_id = ?
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching cart items:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});

// Add item to cart
router.post("/", (req, res) => {
    const { user_id, item_id, quantity } = req.body;
    const sql = "INSERT INTO carts (user_id, item_id, quantity) VALUES (?, ?, ?)";
    
    db.query(sql, [user_id, item_id, quantity], (err, result) => {
        if (err) {
            console.error("Error adding to cart:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.status(201).json({ message: "Item added to cart", id: result.insertId });
        }
    });
});

// Update cart item quantity
router.put("/:cartId", (req, res) => {
    const cartId = req.params.cartId;
    const { quantity } = req.body;
    const sql = "UPDATE carts SET quantity = ? WHERE cart_id = ?";
    
    db.query(sql, [quantity, cartId], (err, result) => {
        if (err) {
            console.error("Error updating cart item:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json({ message: "Cart item updated" });
        }
    });
});

// Delete item from cart
router.delete("/:cartId", (req, res) => {
    const cartId = req.params.cartId;
    const sql = "DELETE FROM carts WHERE cart_id = ?";
    
    db.query(sql, [cartId], (err, result) => {
        if (err) {
            console.error("Error deleting cart item:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json({ message: "Cart item deleted" });
        }
    });
});
router.post("/", (req, res) => {
  console.log("Received cart request:", req.body);  // Log incoming data

  const { user_id, item_id, quantity } = req.body;

  if (!user_id || !item_id || !quantity) {
      console.log("Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = "INSERT INTO carts (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?";
  db.query(sql, [user_id, item_id, quantity, quantity], (err, result) => {
      if (err) {
          console.error("Error adding to cart:", err);
          return res.status(500).json({ error: "Database error" });
      }
      console.log("Item added to cart:", result);
      res.status(201).json({ message: "Item added to cart", cart_id: result.insertId });
  });
});
module.exports = router;