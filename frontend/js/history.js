document.addEventListener("DOMContentLoaded", async function () {
    const purchaseHistoryContainer = document.getElementById("purchase-history-container");
    const userId = localStorage.getItem("userId"); // Assuming the user ID is stored in localStorage

    if (!userId) {
        purchaseHistoryContainer.innerHTML = "<p>Please log in to view your purchase history.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/users/${userId}/history`);
        if (!response.ok) {
            throw new Error("Failed to fetch purchase history");
        }

        const purchaseHistory = await response.json();

        if (purchaseHistory.length === 0) {
            purchaseHistoryContainer.innerHTML = "<p>You have no purchase history.</p>";
            return;
        }

        purchaseHistoryContainer.innerHTML = ""; // Clear the loading message

        purchaseHistory.forEach((item) => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("purchase-item");
            itemElement.innerHTML = `
                <div class="purchase-card">
                    <img src="${item.p_image || 'images/placeholder.jpg'}" alt="${item.product_name}" class="purchase-image">
                    <div class="purchase-details">
                        <h3>${item.product_name}</h3>
                        <p>${item.p_description}</p>
                        <p><strong>Quantity:</strong> ${item.quantity}</p>
                        <p><strong>Price:</strong> $${parseFloat(item.price).toFixed(2)}</p>
                        
                        <button class="add-review-button" onclick="redirectToAddReview(${item.seller_id}, ${item.product_id})">+ Add Review</button>
                    </div>
                </div>
            `;
            purchaseHistoryContainer.appendChild(itemElement);
        });
    } catch (error) {
        console.error("Error loading purchase history:", error);
        purchaseHistoryContainer.innerHTML = "<p>Failed to load your purchase history. Please try again later.</p>";
    }
});
function redirectToAddReview(sellerId, productId) {
    window.location.href = `add-reviews.html?sellerId=${sellerId}&productId=${productId}`;
}
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