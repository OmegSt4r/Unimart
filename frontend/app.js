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
                <img src="images/${product.image}" alt="${product.product_name}">
                <p>Description: <b>${product.tag_name}</b> ${product.p_description}</p>
                <p><b>Item:</b> ${product.product_name} | <b>Price:</b> $${product.price} | <b>Seller:</b> ${product.seller_id} | <b> Inventory:</b> ${product.inventory} </p>
                <p>★★★★</p>
                <button onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.price})">Add to Cart</button>
            `;
            productContainer.appendChild(productElement);
        });
    }
    
    // Add to Cart (Stores in Local Storage, Prevents Duplicates)
    function addToCart(id, name, price) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
        // Check if item already exists
        let existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
    
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${name} added to cart!`);
    }
    
    // Load Cart Items & Display on Cart Page
    function loadCart() {
        
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const cartList = document.getElementById("cart-items");
        if (!cartList) return; // Prevent errors if not on cart page
    
        cartList.innerHTML = ""; // Clear previous items
    
        cart.forEach((item, index) => {
            const li = document.createElement("tr");
            li.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>${item.quantity}</td>
                <td><button onclick="removeFromCart(${index})">❌</button></td>
            `;
            cartList.appendChild(li);
        });
    
        updateSubtotal();
    }
    
    // Remove Items from Cart
    function removeFromCart(index) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
    }
    
    // Update Subtotal in Cart
    function updateSubtotal() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const subtotalElement = document.getElementById("subtotal-price");
        if (subtotalElement) {
            subtotalElement.textContent = `$${total.toFixed(2)}`;
        }
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
        