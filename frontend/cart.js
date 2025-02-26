
document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem("userId");
   
    if (userId) {
        fetch(`http://localhost:5001/users/${userId}`)
            .then(response => response.json())
            .then(user => {
                // Display user-specific content
                const walletAmount = document.getElementById("wallet-amount");
                walletAmount.textContent = `$${user.wallet_balance}`;

                const userProfile = document.querySelector(".user-actions .logo img");
                userProfile.src = "images/profile.jpg"; // Update with user's profile picture if available

                const userName = document.createElement("p");
                userName.textContent = `Welcome, ${user.username}!`;
                document.querySelector(".user-actions").appendChild(userName);
            })
            .catch(error => console.error("Error fetching user data:", error));
    } else {
        // Handle case where user is not logged in
        const contentDiv = document.getElementById("content");
        contentDiv.innerHTML = `
            <h1>Welcome to UniMart!</h1>
            <p>Please <a href="login.html">log in</a> to access your account.</p>
        `;
    }
});
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    if (!userId) {
        alert("Please log in to view your cart.");
        window.location.href = "login.html";
        return;
    }
    const cartItemsDiv = document.getElementById("cart-items");
    const subtotalPriceElement = document.getElementById("subtotal-price");
    const checkoutButton = document.getElementById("checkout");
    fetch(`http://localhost:5001/carts/${userId}`)
        .then(response => response.json())
        .then(cartItems => {
            
            cartItemsDiv.innerHTML = "";
            let subtotal = 0;
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
                subtotal += item.price * item.quantity;
            });
            subtotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;

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
                        updateSubtotal();
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
                        updateSubtotal();
                    })
                    .catch(error => console.error("Error removing cart item:", error));
                });
            });
        })
        .catch(error => console.error("Error fetching cart items:", error));
    function updateSubtotal() {
            let subtotal = 0;
            document.querySelectorAll(".cart-item").forEach(itemDiv => {
                const price = parseFloat(itemDiv.querySelector("p:nth-child(2)").textContent.replace("Price: $", ""));
                const quantity = parseInt(itemDiv.querySelector(".quantity-input").value);
                subtotal += price * quantity;
            });
            subtotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;
        }
        checkoutButton.addEventListener("click", function() {
            const subtotal = parseFloat(subtotalPriceElement.textContent.replace("$", ""));
            fetch(`http://localhost:5001/users/${userId}/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ subtotal }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Checkout successful!");
                    cartItemsDiv.innerHTML = "";
                    subtotalPriceElement.textContent = "$0.00";
                    document.getElementById("wallet-amount").textContent = `$${data.newWalletBalance.toFixed(2)}`;
                } else {
                    alert("Checkout failed: " + data.message);
                }
            })
            .catch(error => console.error("Error during checkout:", error));
        });
    });