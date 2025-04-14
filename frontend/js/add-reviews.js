document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("review-form");
    const statusMessage = document.getElementById("status-message");
    const userId = localStorage.getItem("userId");
    console.log("Logged-in User ID:", userId);

    // Get sellerId and productId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const sellerId = urlParams.get("sellerId");
    const productId = urlParams.get("productId");

    // Debugging: Log the retrieved parameters
    console.log("Seller ID:", sellerId);
    console.log("Product ID:", productId);

    // Pre-fill the Review Subject field with the sellerId or productId
    const reviewSubjectField = document.getElementById("review-subject");
    const productIdField = document.getElementById("product-id"); // Hidden field for productId

    if (sellerId && productId) {
        reviewSubjectField.value = `Seller ID: ${sellerId}, Product ID: ${productId}`;
        productIdField.value = productId; // Populate the hidden field
    } else if (sellerId) {
        reviewSubjectField.value = `Seller ID: ${sellerId}`;
    } else if (productId) {
        reviewSubjectField.value = `Product ID: ${productId}`;
        productIdField.value = productId; // Populate the hidden field
    } else {
        reviewSubjectField.value = "Unknown";
    }

    // Handle form submission
    reviewForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const reviewType = document.getElementById("review-type").value; // "seller" or "product"
        const rating = document.getElementById("rating").value;
        const reviewText = document.getElementById("review-text").value.trim();
        const productId = document.getElementById("product-id").value; // Get productId from hidden field

        // Validate fields
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            statusMessage.textContent = "Please provide a valid rating between 1 and 5.";
            statusMessage.style.color = "red";
            return;
        }

        if (!userId) {
            statusMessage.textContent = "You must be logged in to submit a review.";
            statusMessage.style.color = "red";
            return;
        }

        // Prepare review data
        const reviewData = {
            comment: reviewText,
            rating: parseInt(rating, 10),
            review_source: parseInt(userId, 10), // The logged-in user leaving the review
            product_id: parseInt(productId, 10), // Product ID from hidden field
        };

        if (reviewType === "seller") {
            reviewData.review_subject = parseInt(sellerId, 10); // Seller ID
        } else {
            reviewData.review_subject = parseInt(productId, 10); // Product ID
        }

        // Determine the endpoint based on the review type
        const endpoint =
            reviewType === "seller"
                ? `/users/${sellerId}/seller-reviews`
                : `/users/${productId}/user-reviews`;

        try {
            const response = await fetch(`http://localhost:5001${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response from server:", errorData);
                statusMessage.textContent = "Error submitting review. Please try again.";
                statusMessage.style.color = "red";
                return;
            }

            statusMessage.textContent = "Review submitted successfully!";
            statusMessage.style.color = "green";
            setTimeout(() => {
                window.location.href = "history.html"; // Redirect to purchase history
            }, 1000);
        } catch (error) {
            console.error("Error submitting review:", error);
            statusMessage.textContent = "Error submitting review.";
            statusMessage.style.color = "red";
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