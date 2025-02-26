document.addEventListener("DOMContentLoaded", async () => {
    const cartContainer = document.getElementById("cart-items");

    // Fetch cart items
    try {
        const response = await fetch("http://localhost:5001/carts");
        const cartItems = await response.json();

        cartContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <p>${item.name} - $${item.price} (Qty: ${item.quantity})</p>
                <button class="remove-from-cart" data-id="${item.id}">Remove</button>
            </div>
        `).join("");

        // Handle item removal
        document.querySelectorAll(".remove-from-cart").forEach(button => {
            button.addEventListener("click", async () => {
                const itemId = button.getAttribute("data-id");

                await fetch(`http://localhost:5001/carts/${itemId}`, {
                    method: "DELETE"
                });

                location.reload(); // Refresh the cart page
            });
        });

    } catch (error) {
        console.error("Error fetching cart items:", error);
    }
});
