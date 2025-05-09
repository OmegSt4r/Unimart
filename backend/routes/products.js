const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
    const tag = req.query.tag;
    let sql = `
        SELECT p.*, s.company_name AS seller_name 
        FROM products p
        JOIN sellers s ON p.seller_id = s.seller_id
    `;
    const params = [];
    if (tag) {
        sql += `
            JOIN tags_list tl ON p.product_id = tl.linked_item 
            JOIN tags t ON tl.linked_tag = t.tag_id 
            WHERE t.tag_name = ?
        `;
        params.push(tag);
    }
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            // Debugging
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
    router.post("/users/:userId/add-product", (req, res) => {
        const { userId } = req.params;
        const { name, price, description, tags } = req.body;
    
        const sql = "INSERT INTO products (name, price, description, seller_id) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, price, description, userId], (err, result) => {
            if (err) {
                console.error("Error adding product:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                const productId = result.insertId;
                console.log("Product added with ID:", productId); // Debugging
    
                if (tags && tags.length > 0) {
                    const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
                    const tagValues = parsedTags.map(tag => [tag, productId]);
                    console.log("Tag values to insert:", tagValues); // Debugging
                
                    const tagSql = "INSERT INTO tags_list (linked_tag, linked_item) VALUES ?";
                    db.query(tagSql, [tagValues], (tagErr) => {
                        if (tagErr) {
                            console.error("Error associating tags:", tagErr);
                            res.status(500).json({ error: "Database error" });
                        } else {
                            console.log("Tags associated successfully:", tagValues); // Debugging
                            res.status(201).json({ success: true });
                        }
                    });
                } else {
                    console.log("No tags provided for the product."); // Debugging
                    res.status(201).json({ success: true });
                }
            }
        });
    });
    router.put("/users/:userId/update-product/:productId", (req, res) => {
        const { userId, productId } = req.params;
        const { name, price, description, inventory, tags } = req.body;
        const sql = "UPDATE products SET name = ?, price = ?, description = ?, inventory = ? WHERE product_id = ? AND seller_id = ?";
        db.query(sql, [name, price, description, inventory, productId, userId], (err, result) => {
            if (err) {
                console.error("Error updating product:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                // Delete existing tags
                const deleteTagSql = "DELETE FROM tags_list WHERE linked_item = ?";
                db.query(deleteTagSql, [productId], (deleteErr) => {
                    if (deleteErr) {
                        console.error("Error deleting existing tags:", deleteErr);
                        res.status(500).json({ error: "Database error" });
                    } else {
                        // Insert new tags
                        if (tags && tags.length > 0) {
                            const tagValues = JSON.parse(tags).map(tag => [tag, productId]);
                            const insertTagSql = "INSERT INTO tags_list (linked_tag, linked_item) VALUES ?";
                            db.query(insertTagSql, [tagValues], (insertErr) => {
                                if (insertErr) {
                                    console.error("Error associating tags:", insertErr);
                                    res.status(500).json({ error: "Database error" });
                                } else {
                                    res.status(200).json({ success: true });
                                }
                            });
                        } else {
                            res.status(200).json({ success: true });
                        }
                    }
                });
            }
        });
    });
    router.get("/users/:userId/my-products", (req, res) => {
        const { userId } = req.params;
        const sql = `
            SELECT p.*, GROUP_CONCAT(t.tag_id) AS tags
            FROM products p
            LEFT JOIN tags_list tl ON p.product_id = tl.linked_item
            LEFT JOIN tags t ON tl.linked_tag = t.tag_id
            WHERE p.seller_id = ?
            GROUP BY p.product_id
        `;
        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error("Error fetching user's products:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                results.forEach(product => {
                    product.tags = product.tags ? product.tags.split(',').map(Number) : [];
                });
                res.json(results);
            }
        });
    });
    router.get("/trending", (req, res) => {
        const limit = parseInt(req.query.limit, 10) || 9; // Default to 9 products if no limit is provided
        const sql = `
            SELECT 
                p.product_id, 
                p.product_name, 
                p.price, 
                p.p_image, 
                COALESCE(SUM(oi.quantity), 0) AS total_purchases,
                p.views
            FROM products p
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY p.product_id
            ORDER BY total_purchases DESC, p.views DESC
            LIMIT ?
        `;
    
        db.query(sql, [limit], (err, results) => {
            if (err) {
                console.error("Error fetching trending products:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                res.json(results);
            }
        });
    });
    router.post("/:productId/view", (req, res) => {
        const { productId } = req.params;
        const sql = "UPDATE products SET views = views + 1 WHERE product_id = ?";
    
        db.query(sql, [productId], (err, result) => {
            if (err) {
                console.error("Error updating product views:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                res.status(200).json({ success: true, message: "Product view updated" });
            }
        });
    });
    router.get("/:productId/reviews", (req, res) => {
        const { productId } = req.params;

        const sql = `
            SELECT ur.comment, ur.rating, u.username AS reviewer
            FROM user_reviews ur
            JOIN users u ON ur.comment_source = u.user_id
            WHERE ur.product_id = ?
            UNION ALL
            SELECT sr.comment, sr.rating, u.username AS reviewer
            FROM seller_reviews sr
            JOIN users u ON sr.review_source = u.user_id
            WHERE sr.product_id = ?
            ORDER BY rating DESC
        `;
    
        db.query(sql, [productId, productId], (err, results) => {
            if (err) {
                console.error("Error fetching reviews:", err);
                return res.status(500).json({ error: "Database error" });
            }
    
            res.json(results);
        });
    });
    router.get("/average-ratings", (req, res) => {
        const sql = `
            SELECT p.product_id, p.product_name, 
                   COALESCE(AVG(ur.rating), 0) AS average_rating
            FROM products p
            LEFT JOIN user_reviews ur ON p.product_id = ur.product_id
            GROUP BY p.product_id
        `;
    
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching average ratings:", err);
                return res.status(500).json({ error: "Database error while fetching average ratings." });
            }
    
            res.json(results);
        });
    });
    module.exports = router;