
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
        fetchProducts(); // Fetch all products if user is not logged in
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
    document.addEventListener("DOMContentLoaded", function () {
        const productContainer = document.querySelector(".products");
    
        productContainer.addEventListener("click", async function (event) {
            if (event.target.classList.contains("view-reviews-button")) {
                // Prevent the click event from propagating to the parent element
                event.stopPropagation();
                event.preventDefault();
                const productId = event.target.getAttribute("data-product-id");
    
                try {
                    const response = await fetch(`http://localhost:5001/products/${productId}/reviews`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch reviews");
                    }
    
                    const reviews = await response.json();
                    displayReviews(reviews, productId);
                } catch (error) {
                    console.error("Error fetching reviews:", error);
                }
            }
            if (event.target.classList.contains("close-reviews-button")) {
                const reviewsContainer = event.target.parentElement;
                reviewsContainer.style.display = "none"; // Hide the reviews container
            }
        });
        function generateStars(rating) {
            rating = Math.round(rating); // Round to the nearest whole number
            return "★".repeat(rating) + "☆".repeat(5 - rating);
        }
        function displayReviews(reviews, productId) {
            const reviewsContainer = document.getElementById(`reviews-container-${productId}`);
            reviewsContainer.innerHTML = ""; // Clear existing reviews
            const closeButton = document.createElement("button");
            closeButton.textContent = "Close Reviews";
            closeButton.classList.add("close-reviews-button");
            reviewsContainer.appendChild(closeButton);
        
            if (reviews.length === 0) {
                reviewsContainer.innerHTML = "<p>No reviews available for this product.</p>";
            } else {
                reviews.forEach((review) => {
                    const reviewElement = document.createElement("div");
                    reviewElement.classList.add("review");
                    reviewElement.innerHTML = `
                        <p><strong>${review.reviewer}</strong> <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div></p>
                        <p>${review.comment}</p>
                        <hr>
                    `;
                    reviewsContainer.appendChild(reviewElement);
                });
            }
    
            reviewsContainer.style.display = "block"; // Show the reviews container
        }
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
            productElement.innerHTML += `
                <img src="images/${product.p_image}" alt="${product.product_name}" class="product-image">
               <div class="product-details"> 
               <p><b>Description:</b>${product.p_description}</p> 
               <p><b>Item:</b> ${product.product_name}</p>
               <p><b>Price:</b> $${product.price}|<b> Inventory:</b> ${product.inventory} </p>
                <b>Seller:</b> ${product.seller_name}<p>★★★★</p>
                <a href="chat.html?receiverId=${product.seller_id}"><button class="chat-seller">Chat Seller</button></a>
                <button class="add-cart" onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.price})">Add to Cart</button>
                 <button class="view-reviews-button" data-product-id="${product.product_id}">View Reviews</button>
                    <div class="reviews-container" id="reviews-container-${product.product_id}" style="display: none;">
                        <!-- Reviews will be dynamically loaded here -->
                    </div>
            </div>
           
         `;
            productContainer.appendChild(productElement);
            productElement.addEventListener("click", function (event) {
                if (event.target.classList.contains("view-reviews-button")) {
                    return; // Ignore clicks on the "View Reviews" button
                }
            
                // Toggle product card details
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
    function purchaseProduct(productId, quantity) {
        const userId = localStorage.getItem("userId");
    
        if (!userId) {
            alert("Please log in to make a purchase.");
            return;
        }
    
        fetch(`http://localhost:5001/users/${userId}/purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    // Optionally, update the wallet balance and inventory on the page
                    fetchProducts(); // Refresh product list
                } else {
                    alert(data.error || "Failed to complete purchase.");
                }
            })
            .catch(error => console.error("Error purchasing product:", error));
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
    function fetchTrendingProducts() {
        fetch("http://localhost:5001/products/trending?limit=8")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch trending products");
                }
                return response.json();
            })
            .then(products => {
                displayTrendingSlides(products);
            })
            .catch(error => console.error("Error fetching trending products:", error));
    }
    
    function displayTrendingSlides(products) {
        const slidesContainer = document.querySelector(".trending-slides");
        if (!slidesContainer) {
            console.error("Trending slides container not found.");
            return;
        }
    
        slidesContainer.innerHTML = ""; // Clear existing slides
    
        // Group products into sets of three
        for (let i = 0; i < products.length; i += 3) {
            const slide = document.createElement("div");
            slide.classList.add("trending-slide"); // Each slide contains up to 3 products
            slide.style.display = "flex"; // Flex container for products
            slide.style.justifyContent = "space-between"; // Space between products
    
            const productGroup = products.slice(i, i + 3); // Get a group of 3 products
            productGroup.forEach(function (product) {
                const productElement = document.createElement("div");
                productElement.classList.add("product");
                productElement.style.flex = "1"; // Ensure products are evenly spaced
                productElement.style.margin = "0 10px"; // Add some spacing between products
    
                productElement.innerHTML += `<div class="trending-product">
                    <img class="trending-product-img" src="images/${product.p_image}" alt="${product.product_name}">

                    <p>${product.product_name}</p>
                    <p>$${product.price}</p>
                    <button class="add-cart" onclick="addToCart(${product.product_id}, '${product.product_name}', ${product.price})">Add to Cart</button>
                    </div>
                    
                `;
                slide.appendChild(productElement);
            });
    
            slidesContainer.appendChild(slide);
        }
    
        initializeSlideNavigation(products.length / 3); // Pass the number of slides
    }
    
    function initializeSlideNavigation(totalSlides) {
        const slidesContainer = document.querySelector(".trending-slides");
        if (!slidesContainer) {
            console.error("Trending slides container not found.");
            return;
        }
    
        const slideWidth = slidesContainer.parentElement.offsetWidth; // Get the width of the parent container
    let currentIndex = 0;
    
        function updateSlidePosition() {
            slidesContainer.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
    
        document.querySelector(".prev").addEventListener("click", function () {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlidePosition();
        });
    
        document.querySelector(".next").addEventListener("click", function () {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlidePosition();
        });
    
        // Auto-slide every 5 seconds
        setInterval(function () {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlidePosition();
        }, 10000);
        window.addEventListener("resize", function () {
            updateSlidePosition();
        });
    }
    
    // Fetch and display trending products on page load
    document.addEventListener("DOMContentLoaded", fetchTrendingProducts);
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
            console.error("User ID not found in localStorage.");
            return;
        }
    
        // Fetch notifications
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
                    console.log("Fetched notifications:", notifications);
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
                .catch(error => console.error("Error fetching notifications:", error));
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
                .catch(error => console.error("Error fetching notification count:", error));
        }
        // Fetch unread notification count
        //Fetch unread notification count
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
                .catch(error => console.error("Error fetching notification count:", error));
        }
    
        // Mark a notification as read
        notificationsContainer.addEventListener("click", function (event) {
            const notificationItem = event.target.closest(".notification-item");
    
            if (notificationItem && notificationItem.classList.contains("unread")) {
                const notificationId = notificationItem.dataset.notificationId;
    
                if (!userId || !notificationId) {
                    console.error("Missing userId or notificationId.");
                    return;
                }
    
                console.log(`Marking notification as read: userId=${userId}, notificationId=${notificationId}`);
    
                fetch(`http://localhost:5001/users/${userId}/notifications/mark-read/${notificationId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                })
                .then(response => {
                    console.log("Full Response:", response);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status} ${response.statusText}`);
                    }
                    return response.text(); // Read raw response first
                })
                .then(text => {
                    console.log("Server Response Text:", text);
                    return JSON.parse(text); // Try parsing JSON
                })
                .then(data => {
                    console.log("Parsed JSON Response:", data);
                })
                .catch(error => console.error("Error marking notification as read:", error));
            }
        });
        // Load notifications and unread count on page load
        fetchNotifications();
        fetchUnreadCount();
        updateNotificationBadge();

    });
    document.addEventListener("DOMContentLoaded", function () {
        const userId = localStorage.getItem("userId");
        const BASE_URL = "http://localhost:5001";
    
        if (!userId) {
            console.error("User ID is not set in localStorage.");
            return;
        }
    
        // Fetch user data to get the profile picture
        fetch(`${BASE_URL}/users/${userId}`)
            .then(response => response.json())
            .then(user => {
                const profilePicElements = document.querySelectorAll(".profile-pic");
    
                // Update all profile picture elements on the page
                profilePicElements.forEach(profilePic => {
                    profilePic.src = user.profile_pic
                        ? `${BASE_URL}/${user.profile_pic}?t=${Date.now()}` // Cache-busting query
                        : "images/default-profile.jpg";
                });
            })
            .catch(error => console.error("Error fetching user data:", error));
    });
    window.alert = function(message) {
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