document.addEventListener("DOMContentLoaded", function () {
    // Retrieve userId from localStorage or fallback to URL parameters
    let userId = localStorage.getItem("userId");
    if (!userId) {
        const urlParams = new URLSearchParams(window.location.search);
        userId = urlParams.get("userId");
    }

    // Redirect to login page if userId is not found
    if (!userId) {
        alert("Please log in to view your cart.");
        window.location.href = "login.html";
        return;
    }
   
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
        

    const cartItemsDiv = document.getElementById("cart-items"); 
    const confirmSubtotalPriceElement = document.getElementById("confirm-subtotal-price");
    const subtotalPriceElement = document.getElementById("subtotal-price");
    const checkoutButton = document.getElementById("checkout");
   
    let subtotal = 0;
    let discount = 0;
    fetch(`http://localhost:5001/carts/${userId}`)
        .then(response => response.json())
        .then(cartItems => {
            
            cartItemsDiv.innerHTML = "";
            subtotal = 0;
            
            cartItems.forEach(item => {
                const itemRow = document.createElement("tr");
                itemRow.className = "cart-item";
                itemRow.innerHTML = `
                    <td>${item.product_name}</td>
                    <td>$${item.price}</td>
                    <td>
                        <select class="quantity" data-cart-id="${item.cart_id}">
                            ${[1, 2, 3, 4, 5].map(q => `<option value="${q}" ${q === item.quantity ? "selected" : ""}>${q}</option>`).join("")}
                        </select>
                    </td>
                    <td><button class="remove-item" data-cart-id="${item.cart_id}">🗑️</button></td>
                `;
                cartItemsDiv.appendChild(itemRow);
                subtotal += item.price * item.quantity;
            });
            subtotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;
            updateSubtotal();
            // Add event listeners for quantity changes
            document.querySelectorAll(".quantity").forEach(input => {
                input.addEventListener("change", function(event) {
                    const cartId = event.target.getAttribute("data-cart-id");
                    const quantity = parseInt( event.target.value);
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
                        event.target.closest("tr").remove();
                        updateSubtotal();
                       
                    }) 
                    .catch(error => console.error("Error removing cart item:", error));
                });
            });
        })
        .catch(error => console.error("Error fetching cart items:", error));
        
    function updateSubtotal() {
            let subtotal = 0;
            document.querySelectorAll(".cart-item").forEach(itemRow => {
                const price = parseFloat(itemRow.querySelector("td:nth-child(2)").textContent.replace("$", ""));
                const quantity = parseInt(itemRow.querySelector(".quantity").value);
                subtotal += price * quantity;
            });
            subtotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;
            applyDiscount();
        }
        function applyDiscount() {
            const discountType = document.querySelector('input[name="discount"]:checked').value;
            if (discountType === "premium") {
                discount = subtotal * 0.10; // 10% discount
            } else {
                discount = 0;
            }
            const discountedSubtotal = subtotal - discount;
            subtotalPriceElement.textContent = `$${discountedSubtotal.toFixed(2)}`;
            confirmSubtotalPriceElement.textContent = `$${discountedSubtotal.toFixed(2)}`;
        }
        document.querySelectorAll('input[name="discount"]').forEach(radio => {
            radio.addEventListener("change", applyDiscount);
        });
        
        checkoutButton.addEventListener("click", function() {
            const finalSubtotal = parseFloat(subtotalPriceElement.textContent.replace("$", ""));
            
            fetch(`http://localhost:5001/users/${userId}/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ subtotal: finalSubtotal }),
            })
            
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Checkout successful!");
                    cartItemsDiv.innerHTML = "";
                subtotalPriceElement.textContent = "$0.00";
                confirmSubtotalPriceElement.textContent = "$0.00";
                document.getElementById("wallet-amount").textContent = `$${data.newWalletBalance.toFixed(2)}`;
                window.location.href = "history.html";
                } else {
                    alert("Checkout failed: " + data.message);
                }
            })
            .catch(error => console.error("Error during checkout:", error));
        });});
       // Handle step navigation
    document.getElementById("step1").addEventListener("click", function() {
        setActiveStep("step1", "subtotal-step");
    });

    document.getElementById("step2").addEventListener("click", function() {
        setActiveStep("step2", "discount-step");
    });

    document.getElementById("step3").addEventListener("click", function() {
        setActiveStep("step3", "confirm-step");
    });

    function setActiveStep(buttonId, stepId) {
        // Remove active class from all buttons
        document.querySelectorAll(".checkout-steps button").forEach(button => {
            button.classList.remove("active");
        });
        // Add active class to the clicked button
        document.getElementById(buttonId).classList.add("active");

        // Hide all steps
        document.querySelectorAll(".checkout-step").forEach(step => {
            step.style.display = "none";
        });
        // Show the selected step
        document.getElementById(stepId).style.display = "block";
    }
document.addEventListener("DOMContentLoaded", function () {
    const profilePic = localStorage.getItem("profilePic");
    if (profilePic) {
        updateProfilePictures(profilePic);
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const hamburgerMenuContent = document.getElementById("hamburger-menu-content");

    hamburgerMenu.addEventListener("click", function () {
        const isVisible = hamburgerMenuContent.style.display === "block";
        hamburgerMenuContent.style.display = isVisible ? "none" : "block";
    });

    // Close the menu when clicking outside
    document.addEventListener("click", function (event) {
        if (!hamburgerMenu.contains(event.target) && !hamburgerMenuContent.contains(event.target)) {
            hamburgerMenuContent.style.display = "none";
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const hamburgerMenuContent = document.getElementById("hamburger-menu-content");

    hamburgerMenu.addEventListener("click", function () {
        const isVisible = hamburgerMenuContent.style.display === "block";
        hamburgerMenuContent.style.display = isVisible ? "none" : "block";
    });

    // Close the menu when clicking outside
    document.addEventListener("click", function (event) {
        if (!hamburgerMenu.contains(event.target) && !hamburgerMenuContent.contains(event.target)) {
            hamburgerMenuContent.style.display = "none";
        }
    });
}); window.alert = function(message) {
    if (typeof showUniMartToast === "function") {
      showUniMartToast(message);
    } else {
      console.log("Toast fallback:", message);
    }
  };
  function showUniMartToast(message) {
    const toast = document.getElementById("unimart-toast");
    const msgSpan = document.getElementById("unimart-toast-message");
  
    msgSpan.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");
  
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 300); // for fade-out effect
    }, 3000);
  }