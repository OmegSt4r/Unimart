const express = require("express");
const router = express.Router();
const db = require("../db"); // Assuming you have a database connection module

// Get purchase history for a user
router.get("/:userId/history", (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT hi.history_items_id, hi.quantity, hi.price, 
               p.product_name, p.p_description, p.p_image
        FROM history_itmes hi
        JOIN products p ON hi.item_id = p.product_id
        WHERE hi.user_id = ?
        ORDER BY hi.history_items_id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching purchase history:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});
router.post("/:userId/checkout", (req, res) => {
    const userId = req.params.userId;
    const purchaseId = req.body.purchaseId; // Generate or pass a purchase ID

    const insertHistorySQL = `
        INSERT INTO history_itmes (user_id, item_id, quantity, price, purchase_id)
        SELECT c.user_id, c.item_id, c.quantity, p.price * c.quantity, ?
        FROM carts c
        JOIN products p ON c.item_id = p.product_id
        WHERE c.user_id = ?
    `;

    const clearCartSQL = "DELETE FROM carts WHERE user_id = ?";

    const updateProductQuantitySQL = `
        UPDATE products
        SET quantity = inventory - (
            SELECT c.quantity
            FROM carts c
            WHERE c.item_id = products.product_id AND c.user_id = ?
        )
        WHERE product_id IN (
            SELECT item_id
            FROM carts
            WHERE user_id = ?
        )
    `;

    const notifySellerSQL = `
        INSERT INTO notifications (user_id, message)
        SELECT p.seller_id, CONCAT('Your item "', p.product_name, '" has been sold!')
        FROM carts c
        JOIN products p ON c.item_id = p.product_id
        WHERE c.user_id = ?
    `;

    db.query(insertHistorySQL, [purchaseId, userId], (err) => {
        if (err) {
            console.error("Error during checkout:", err);
            return res.status(500).json({ error: "Failed to complete purchase" });
        }
        db.query(updateProductQuantitySQL, [userId, userId], (err) => {
            if (err) {
                console.error("Error updating product quantities:", err);
                return res.status(500).json({ error: "Failed to update product quantities" });
            }

            db.query(notifySellerSQL, [userId], (err) => {
                if (err) {
                    console.error("Error notifying seller:", err);
                    return res.status(500).json({ error: "Failed to notify seller" });
                }
            

        db.query(clearCartSQL, [userId], (err) => {
            if (err) {
                console.error("Error clearing cart:", err);
                return res.status(500).json({ error: "Failed to clear cart" });
            }
            res.status(200).json({ message: "Purchase completed successfully!" });
        });
    });
});
    });
});
module.exports = router;