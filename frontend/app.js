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
            body: JSON.stringify({ user_id, product_id, quantity }),
        })
        .then(response => response.json())
        .then(data => {
            alert(`${product_name} added to cart!`);
        })
        .catch(error => console.error("Error adding item to cart:", error));
    }
    
    // Load Cart Items & Display on Cart Page
    function loadCart() {
        const user_id = localStorage.getItem("userId"); // Retrieve user ID from local storage
        if (!user_id) {
            console.error("User not logged in!");
            return;
        }
        fetch(`http://localhost:5001/carts/${user_id}`)
            .then(response => response.json())
            .then(data => displayCartItems(data))
            .catch(error => console.error("Error fetching cart items:", error));
    }
    
    function displayCartItems(cartItems) {
        const cartItemsContainer = document.getElementById("cart-items");
        cartItemsContainer.innerHTML = ""; // Clear previous cart items
    
        cartItems.forEach(item => {
            const cartItemElement = document.createElement("tr");
            cartItemElement.innerHTML = `
                <td>${item.product_name}</td>
                <td>$${item.price}</td>
                <td>${item.quantity}</td>
                <td><button onclick="removeFromCart(${item.user_id}, ${item.item_id})">❌</button></td>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }
    
    function removeFromCart(userId, itemId) {
        fetch(`http://localhost:5001/carts/${userId}/${itemId}`, {
            method: "DELETE"
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            loadCart(); // Reload the cart after removing an item
        })
        .catch(error => console.error("Error removing item from cart:", error));
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
        