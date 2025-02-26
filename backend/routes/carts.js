const express = require("express");
const router = express.Router();
const db = require("../db");

// Fetch all cart items
router.get("/", (req, res) => {
    const sql = "SELECT * FROM unimart.carts";
    db.query(sql, (err, results) => {
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
    const { product_id, name, price, quantity } = req.body;
    const sql = "INSERT INTO cart (product_id, name, price, quantity) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [product_id, name, price, quantity], (err, result) => {
        if (err) {
            console.error("Error adding to cart:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.status(201).json({ message: "Item added to cart", id: result.insertId });
        }
    });
});

// Delete item from cart
router.delete("/:id", (req, res) => {
    const cartItemId = req.params.id;
    const sql = "DELETE FROM cart WHERE id = ?";
    
    db.query(sql, [cartItemId], (err, result) => {
        if (err) {
            console.error("Error deleting cart item:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.status(200).json({ message: "Item removed from cart" });
        }
    });
});

module.exports = router;
