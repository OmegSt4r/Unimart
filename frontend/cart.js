document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    if (!userId) {
        alert("Please log in to view your cart.");
        window.location.href = "login.html";
        return;
    }

    fetch(`http://localhost:5001/carts/${userId}`)
        .then(response => response.json())
        .then(cartItems => {
            const cartItemsDiv = document.getElementById("cart-items");
            cartItemsDiv.innerHTML = "";
            cartItems.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "cart-item";
                itemDiv.innerHTML = `
                    <p>${item.product_name}</p>
                    <p>Price: $${item.price}</p>
                    <p>Quantity: <input type="number" value="${item.quantity}" data-cart-id="${item.cart_id}" class="quantity-input"></p>
                    <button class="remove-item" data-cart-id="${item.cart_id}">Remove</button>
                `;
                cartItemsDiv.appendChild(itemDiv);
            });

            // Add event listeners for quantity changes
            document.querySelectorAll(".quantity-input").forEach(input => {
                input.addEventListener("change", function(event) {
                    const cartId = event.target.getAttribute("data-cart-id");
                    const quantity = event.target.value;
                    fetch(`http://localhost:5001/carts/${cartId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ quantity }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                    })
                    .catch(error => console.error("Error updating cart item:", error));
                });
            });

            // Add event listeners for removing items
            document.querySelectorAll(".remove-item").forEach(button => {
                button.addEventListener("click", function(event) {
                    const cartId = event.target.getAttribute("data-cart-id");
                    fetch(`http://localhost:5001/carts/${cartId}`, {
                        method: "DELETE",
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        // Remove the item from the DOM
                        event.target.parentElement.remove();
                    })
                    .catch(error => console.error("Error removing cart item:", error));
                });
            });
        })
        .catch(error => console.error("Error fetching cart items:", error));
});