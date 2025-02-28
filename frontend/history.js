document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in to view your purchase history.");
        window.location.href = "login.html";
        return;
    }

    const purchaseHistoryItemsDiv = document.getElementById("purchase-history-items");

    fetch(`http://localhost:5001/users/${userId}/purchase-history`)
        .then(response => response.json())
        .then(purchaseHistory => {
            purchaseHistoryItemsDiv.innerHTML = "";
            if (purchaseHistory.length === 0) {
                purchaseHistoryItemsDiv.innerHTML = "<p>No purchase history available.</p>";
            } else {
                purchaseHistory.forEach(item => {
                    const productDiv = document.createElement("div");
                    productDiv.className = "product";
                    productDiv.innerHTML = `
                        <img src="${item.image_url}" alt="${item.product_name}">
                        <h3>${item.product_name}</h3>
                        <p>Price: $${item.price.toFixed(2)}</p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Date: ${new Date(item.date).toLocaleDateString()}</p>
                    `;
                    purchaseHistoryItemsDiv.appendChild(productDiv);
                });
            }
        })
        .catch(error => console.error("Error fetching purchase history:", error));
});