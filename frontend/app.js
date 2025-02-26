
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

// Search Bar Functionality
document.getElementById("searchBar").addEventListener("keyup", function(event) {
    let query = event.target.value.toLowerCase();
    let products = document.querySelectorAll(".product");

    products.forEach(product => {
        let description = product.textContent.toLowerCase();
        if (description.includes(query)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem("userId");
    if (userId) {
        const cartLink = document.getElementById("cart-link");
        cartLink.href = `cart.html?userId=${userId}`;
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const filterBtn = document.querySelector(".filter-btn");
    const filterContainer = document.querySelector(".filter-container");

    filterBtn.addEventListener("click", function() {
        filterContainer.classList.toggle("active");
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const checkboxes = document.querySelectorAll(".filter-tag");
    const sortSelect = document.getElementById("sortPrice");
    const productsContainer = document.querySelector(".products");
    const products = Array.from(document.querySelectorAll(".product"));

    function filterAndSort() {
        let selectedTags = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        let sortedProducts = products.filter(product => {
            let productTags = product.getAttribute("data-tags").split(",");
            return selectedTags.length === 0 || selectedTags.some(tag => productTags.includes(tag));
        });
        let sortOrder = sortSelect.value;
        if (sortOrder === "low") {
            sortedProducts.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
        } else if (sortOrder === "high") {
            sortedProducts.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
        }
        if (selectedTags.length === 0 && sortOrder === "") {
            sortedProducts = products;
        }

        productsContainer.innerHTML = "";
        sortedProducts.forEach(product => productsContainer.appendChild(product));
    }

    checkboxes.forEach(checkbox => checkbox.addEventListener("change", filterAndSort));
    sortSelect.addEventListener("change", filterAndSort);   });
    


    document.addEventListener("DOMContentLoaded", () => {
        fetchProducts();  // Fetch product data from the backend
        loadCart();       // Load the cart on page load
    });
    
    // Fetch Products from Backend
    function fetchProducts() {
        fetch("http://localhost:5001/products") // Fetch from Node.js backend
            .then(response => response.json())
            .then(data => displayProducts(data))
            .catch(error => console.error("Error fetching products:", error));
    }
    
    // Display Products Dynamically
    function displayProducts(products) {
        const productContainer = document.querySelector(".products");
        productContainer.innerHTML = ""; // Clear previous products
    
        products.forEach(product => {
            const productElement = document.createElement("div");
            productElement.classList.add("product");
            productElement.setAttribute("data-id", product.product_id);
            productElement.innerHTML = `
                <img src="images/${product.p_image}" alt="${product.product_name}">
                <p>Description: <b>${product.tag_name}</b> ${product.p_description}</p>
                <p><b>Item:</b> ${product.product_name} | <b>Price:</b> $${product.price} | <b>Seller:</b> ${product.seller_id} | <b> Inventory:</b> ${product.inventory} </p>
                <p>★★★★</p>
                <button onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.price})">Add to Cart</button>
            `;
            productContainer.appendChild(productElement);
        });
    }
    
    // Add to Cart (Stores in Local Storage, Prevents Duplicates)
    function addToCart(product_id, product_name, price) {
        const user_id = localStorage.getItem("userId"); // Retrieve user ID from local storage
        if (!user_id) {
            alert("User not logged in!");
            return;
        }
        const quantity = 1; // Default quantity
        fetch("http://localhost:5001/carts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id, item_id: product_id, quantity }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(`${product_name} added to cart!`);
            } else {
                alert("Failed to add item to cart.");
            }
        })
        .catch(error => console.error("Error adding item to cart:", error));
    }
    

    // Checkout Logic: Confirm Purchase & Deduct from Wallet
    function confirmPurchase() {
        let walletAmount = parseFloat(localStorage.getItem("wallet")) || 50.00;
        let subtotal = parseFloat(document.getElementById("subtotal-price").textContent.replace("$", ""));
    
        if (walletAmount >= subtotal) {
            walletAmount -= subtotal;
            localStorage.setItem("wallet", walletAmount.toFixed(2));
            document.getElementById("wallet-amount").textContent = `$${walletAmount.toFixed(2)}`;
            localStorage.removeItem("cart"); // Empty Cart
            loadCart();
            alert("Purchase Confirmed!");
        } else {
            alert("Insufficient funds!");
        }
    }    
        