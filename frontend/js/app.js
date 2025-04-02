
document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem("userId");
   
    if (userId) {
        fetch(`http://localhost:5001/users/${userId}`)
            .then(response => response.json())
            .then(user => {
                // Display user-specific content
                const walletAmount = document.getElementById("wallet-amount");
                walletAmount.textContent = `$${user.wallet_balance}`;

                const userProfile = document.querySelector(".user-actions .user-profile img");
                userProfile.src = "images/profile.jpg"; // Update with user's profile picture if available

                const userName = document.createElement("p");
                userName.textContent = `Welcome, ${user.username}`;
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
 // Dropdown category functionality
 const categoryDropdown = document.getElementById("category-dropdown");
 const categoryMenu = document.getElementById("category-menu");
 const searchBar = document.getElementById("searchBar");

 categoryMenu.addEventListener("click", function (event) {
     if (event.target.tagName === "LI") {
         const selectedCategory = event.target.textContent.trim();
         searchBar.value = `${selectedCategory} - `;
         fetchProducts(selectedCategory); // Fetch products based on the selected category
     }
 });

// Search Bar Functionality
searchBar.addEventListener("keyup", function(event) {
    const query = event.target.value.toLowerCase();
    const products = document.querySelectorAll(".product");

    products.forEach(product => {
        const description = product.textContent.toLowerCase();
        if (description.includes(query)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
});
fetchProducts();
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
    const filterBtn = document.querySelector(".filter-btn");
    const sortSelect = document.getElementById("sortPrice");
    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");
   
    let products = [];

    // Fetch products from the backend
    fetch("http://localhost:5001/products")
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts(products);
        })
        .catch(error => console.error("Error fetching products:", error));

    function filterAndSort() {
        let minPrice = parseFloat(minPriceInput.value) || 0;
        let maxPrice = parseFloat(maxPriceInput.value) || Infinity;
        let sortOrder = sortSelect.value;

        let filteredProducts = products.filter(product => {
            return product.price >= minPrice && product.price <= maxPrice;
        });

        if (sortOrder === "low") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "high") {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        displayProducts(filteredProducts);
    }
    filterBtn.addEventListener("click", filterAndSort);
    sortSelect.addEventListener("change", filterAndSort);
    minPriceInput.addEventListener("input", filterAndSort);
    maxPriceInput.addEventListener("input", filterAndSort);

    checkboxes.forEach(checkbox => checkbox.addEventListener("change", filterAndSort));
    sortSelect.addEventListener("change", filterAndSort);   });
    


    document.addEventListener("DOMContentLoaded", () => {
        fetchProducts();  // Fetch product data from the backend
        loadCart();       // Load the cart on page load
    });
    document.addEventListener("DOMContentLoaded", function() {
        fetchProducts();
    
        // Add event listeners for category buttons
        document.querySelectorAll("aside ul button").forEach(button => {
            button.addEventListener("click", function() {
                const tag = this.textContent.trim();
                fetchProducts(tag);
            });
        });
    });
    
    // Fetch Products from Backend
    function fetchProducts(tag = "") {
        let url = "http://localhost:5001/products";
    if (tag) {
        url += `?tag=${tag}`;
    }
    fetch(url) // Fetch from Node.js backend
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
                <img src="images/${product.p_image}" alt="${product.product_name}" class="product-image">
               <div class="product-details"> 
               <p><b>Description:</b>${product.p_description}</p> 
               <p><b>Item:</b> ${product.product_name}</p>
               <p><b>Price:</b> $${product.price}|<b> Inventory:</b> ${product.inventory} </p>
                <b>Seller:</b> ${product.seller_name}<p>★★★★</p>
                <a href="chat.html?receiverId=${product.seller_id}"><button class="chat-seller">Chat Seller</button></a>
                <button class="add-cart" onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.price})">Add to Cart</button>
            </div>
           
         `;
            productContainer.appendChild(productElement);
            productElement.addEventListener("click", function() {
                const image = productElement.querySelector(".product-image");
                const details = productElement.querySelector(".product-details");
                productElement.classList.toggle("expanded");
                
            });
            
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
    document.getElementById("add-product-button").addEventListener("click", function() {
        const userId = localStorage.getItem("userId");
    
        if (!userId) {
            alert("Please log in to add a product.");
            window.location.href = "login.html";
            return;
        }
    
        window.location.href = `add-product.html?userId=${userId}`;
    });
    document.addEventListener("DOMContentLoaded", function () {
        const profilePic = localStorage.getItem("profilePic");
        if (profilePic) {
            updateProfilePictures(profilePic);
        }
    });
    function logout() {
        // Clear localStorage
        localStorage.removeItem("userId");
        localStorage.removeItem("profilePic"); // If you store profile pictures
        localStorage.removeItem("authToken"); // If using JWT tokens
        
        // Redirect to login page
        window.location.href = "login.html";
    }
    document.addEventListener("DOMContentLoaded", function () {
        const logoutButton = document.getElementById("logout-button");
        
        if (logoutButton) {
            logoutButton.addEventListener("click", logout);
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
        let slides = document.querySelectorAll(".trending-slide");
        let currentSlide = 0;
        
        function showSlide(index) {
            slides[currentSlide].classList.remove("active");
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add("active");
        }
    
        document.querySelector(".prev").addEventListener("click", () => showSlide(currentSlide - 1));
        document.querySelector(".next").addEventListener("click", () => showSlide(currentSlide + 1));
    
        setInterval(() => showSlide(currentSlide + 1), 100000); // Auto-slide every 5 sec
    });
    function fetchMessages(senderId, receiverId) {
        fetch(`http://localhost:5001/users/${senderId}/chat/messages?userId2=${receiverId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(messages => {
                console.log("Fetched messages:", messages); // Debugging
    
                const chatContainer = document.getElementById("chat-container");
                if (!chatContainer) {
                    console.error("Chat container not found in the DOM.");
                    return;
                }
    
                chatContainer.innerHTML = ""; // Clear previous messages
    
                if (!messages || messages.length === 0) {
                    chatContainer.innerHTML = "<p>No messages yet.</p>";
                    return;
                }
    
                messages.forEach(message => {
                    const messageDiv = document.createElement("div");
                    const isSent = parseInt(message.sender_id) === parseInt(senderId);
                    
                    messageDiv.classList.add(isSent ? "sent-message" : "received-message");
                    messageDiv.textContent = message.message || "No content";
    
                    chatContainer.appendChild(messageDiv);
                });
    
                // Scroll to the latest message
                chatContainer.scrollTop = chatContainer.scrollHeight;
            })
            .catch(error => {
                console.error("Error fetching messages:", error);
            });
    }
    function sendMessage(senderId, receiverId, message) {
        fetch(`http://localhost:5001/users/${senderId}/chat/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                senderId: parseInt(senderId),  // Ensure correct format
                receiverId: parseInt(receiverId),
                message: message.trim()
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to send message. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Message sent successfully:", data);
            fetchMessages(senderId, receiverId); // Refresh chat after sending
        })
        .catch(error => {
            console.error("Error sending message:", error);
        });
    }
    document.addEventListener("DOMContentLoaded", function () {
        const userId = localStorage.getItem("userId"); // Retrieve user ID
        const notificationsContainer = document.getElementById("notifications-list");
        const notificationBadge = document.getElementById("notification-count");
    
        if (!userId) {
            console.error("❌ User ID not found in localStorage.");
            return;
        }
    
        // ✅ Fetch notifications
        function fetchNotifications() {
            const userId = localStorage.getItem("userId");
    if (!userId) {
        console.error("User ID is missing.");
        return;
    } function showTemporaryNotification(message) {
            const notificationElement = document.getElementById("temporary-notification");
        
            if (!notificationElement) {
                console.error("Notification container not found in the DOM.");
                return;
            }
        
            // Set the message and make the notification visible
            notificationElement.textContent = message;
            notificationElement.style.display = "block";
        
            // Hide the notification after 2 seconds
            setTimeout(() => {
                notificationElement.style.display = "none";
            }, 2000); // 2000ms = 2 seconds
        }
            fetch(`http://localhost:5001/users/${userId}/notifications`)
                .then(response => response.json())
                .then(notifications => {
                    console.log("📩 Fetched notifications:", notifications);
                    notificationsContainer.innerHTML = ""; // Clear old notifications
    
                    if (notifications.length > 0) {
                        const latestNotification = notifications[0]; // Assuming the latest notification is the first one
                        if (!latestNotification.is_read) {
                            showTemporaryNotification(latestNotification.message);
                        }}
    
                    notifications.forEach(notification => {
                        const notificationDiv = document.createElement("div");
                        notificationDiv.classList.add("notification-item");
                        notificationDiv.dataset.notificationId = notification.notification_id;
    
                        if (!notification.is_read) {
                            notificationDiv.classList.add("unread");
                        } 
    
                        notificationDiv.innerHTML = `
                            <p>${notification.message}</p>
                            <time>${new Date(notification.created_at).toLocaleString()}</time>
                        `;
    
                        notificationsContainer.appendChild(notificationDiv);
                    });
                })
                .catch(error => console.error("❌ Error fetching notifications:", error));
        }
       
        function updateNotificationBadge() {
            const userId = localStorage.getItem("userId");
            if (!userId) return;
        
            fetch(`http://localhost:5001/users/${userId}/notifications/count`)
                .then(response => response.json())
                .then(data => {
                    if (notificationBadge) {
                        notificationBadge.textContent = data.unread_count > 0 ? data.unread_count : "";
                        notificationBadge.style.display = data.unread_count > 0 ? "inline-block" : "none";
                    }
                })
                .catch(error => console.error("❌ Error fetching notification count:", error));
        }
        // ✅ Fetch unread notification count
        function fetchUnreadCount() {
            fetch(`http://localhost:5001/users/${userId}/notifications/count`)
                .then(response => response.json())
                .then(data => {
                    console.log("🔔 Notification count:", data.unread_count);
                    if (notificationBadge) {
                        if (data.unread_count > 0) {
                            notificationBadge.textContent = data.unread_count;
                            notificationBadge.style.display = "inline-block";
                        } else {
                            notificationBadge.style.display = "none";
                        }
                    }
                })
                .catch(error => console.error("❌ Error fetching notification count:", error));
        }
    
        // ✅ Mark a notification as read
        notificationsContainer.addEventListener("click", function (event) {
            const notificationItem = event.target.closest(".notification-item");
    
            if (notificationItem && notificationItem.classList.contains("unread")) {
                const notificationId = notificationItem.dataset.notificationId;
    
                if (!userId || !notificationId) {
                    console.error("❌ Missing userId or notificationId.");
                    return;
                }
    
                console.log(`📩 Marking notification as read: userId=${userId}, notificationId=${notificationId}`);
    
                fetch(`http://localhost:5001/users/${userId}/notifications/mark-read/${notificationId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                })
                .then(response => {
                    console.log("🔍 Full Response:", response);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status} ${response.statusText}`);
                    }
                    return response.text(); // Read raw response first
                })
                .then(text => {
                    console.log("📜 Server Response Text:", text);
                    return JSON.parse(text); // Try parsing JSON
                })
                .then(data => {
                    console.log("✅ Parsed JSON Response:", data);
                })
                .catch(error => console.error("❌ Error marking notification as read:", error));
            }
        });
        // ✅ Load notifications and unread count on page load
        fetchNotifications();
        fetchUnreadCount();
        updateNotificationBadge();

    });
    