const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
    const sql = "SELECT * FROM unimart.products";
    db.query(sql, (err, results) => {
        if (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Database error"});
        }else{
        res.json(results);
            }
        });
    });
    router.post("/", (req, res) => {
        const {name, price, description, tags, images, seller} = req.body;
        const sql = "INSERT INTO products (name, price, description, tags, image, seller) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [name, price, description, tags, images, seller], (err, result) => {
            if (err) {
                console.error("Error adding product:", err);
                res.status(500).json({ error: "Database error"});
            }else{
            res.status(201).json({message: "Product added successfully", id: result.insertId});
        }
        });
    });

    router.delete("/:id", (req, res) => {
        const productId = req.params.id;
        const sql = "DELETE FROM products WHERE id = ?";
        db.query(sql, [productId], (err, result) => {
            if (err) {
                console.error("Error deleting product:", err);
                res.status(500).json({ error: "Database error"});
            }else{
            res.status(200).json({ message: "Product deleted successfully"});
        }
        });
    });

    module.exports = router;