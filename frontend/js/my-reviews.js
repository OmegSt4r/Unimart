document.addEventListener("DOMContentLoaded", async function () {
    const sellerReviewsList = document.getElementById("seller-reviews-list");
    const userReviewsList = document.getElementById("user-reviews-list");
    const sellerRatingContainer = document.getElementById("seller-rating");
    const customerRatingContainer = document.getElementById("customer-rating");
    const userId = parseInt(localStorage.getItem("userId"), 10);
if (isNaN(userId)) {
    alert("Invalid user ID. Please log in again.");
    window.location.href = "login.html";
    return;
}

    function generateStars(rating) {
        rating = Math.round(rating); // Round to the nearest whole number
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    }

    try {
        // Fetch all reviews
        const response = await fetch(`http://localhost:5001/users/${userId}/reviews`);
        if (!response.ok) {
            throw new Error("Failed to fetch reviews");
        }

        const { sellerReviews, userReviews } = await response.json();

        // Calculate average seller rating
        const sellerRatings = sellerReviews.map(review => review.rating); // Extract ratings
        console.log("Seller Ratings:", sellerRatings);

        const averageSellerRating = sellerRatings.length
            ? (sellerRatings.reduce((sum, rating) => sum + rating, 0) / sellerRatings.length).toFixed(1)
            : 0;

        // Calculate average user rating
        const userRatings = userReviews.map(review => review.rating); // Extract ratings
        console.log("User Ratings:", userRatings);

        const averageUserRating = userRatings.length
            ? (userRatings.reduce((sum, rating) => sum + rating, 0) / userRatings.length).toFixed(1)
            : 0;

        // Display average ratings as stars
        sellerRatingContainer.innerHTML = generateStars(averageSellerRating);
        customerRatingContainer.innerHTML = generateStars(averageUserRating);
        
            // Display seller reviews
            sellerReviews.forEach((review) => {
                const reviewElement = document.createElement("div");
                reviewElement.classList.add("review");
                reviewElement.innerHTML = `
                    <div class="review-card">
                        <p><strong>Reviewer:</strong> ${review.reviewer}</p>
                        <p><strong>Reviewed Seller:</strong> ${review.seller}</p>
                        <p><strong>Comment:</strong>${review.comment}</p>
                        <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
                        <button class="rply-btn">Reply</button>
                    </div>`;
                sellerReviewsList.appendChild(reviewElement);
            });
    
            // Display user reviews
            userReviews.forEach((review) => {
                const reviewElement = document.createElement("div");
                reviewElement.classList.add("review");
                reviewElement.innerHTML = `
                    <div class="review-card" data-review-id="${review.review_id}">
        <p><strong>Reviewer:</strong> ${review.reviewer}</p>
        <p><strong>Reviewed Seller:</strong> ${review.seller}</p>
        <p><strong>Comment:</strong>${review.comment}</p>
        <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
        <button class="rply-btn">Reply</button>
    </div>`;
                userReviewsList.appendChild(reviewElement);
                
            });
        
            
            
        } catch (error) {
            console.error("Error loading reviews:", error);
            sellerReviewsList.innerHTML = "<p>Failed to load seller reviews. Please try again later.</p>";
            userReviewsList.innerHTML = "<p>Failed to load user reviews. Please try again later.</p>";
           
        sellerRatingContainer.innerHTML = "<p>Failed to load seller rating.</p>";
        customerRatingContainer.innerHTML = "<p>Failed to load customer rating.</p>";
         }
         
    });
    document.addEventListener("DOMContentLoaded", function () {
        const userId = localStorage.getItem("userId");
        const BASE_URL = "http://localhost:5001";
        const reviewsContainer = document.getElementById("reviews-container");
    
        if (!userId) {
            reviewsContainer.innerHTML = "<p>You must be logged in to view your reviews.</p>";
            return;
        }
    
        // Fetch reviews made by the user
        fetch(`${BASE_URL}/users/${userId}/my-reviews`)
            .then(response => response.json())
            .then(data => {
                const { userReviews, sellerReviews } = data;
    
                reviewsContainer.innerHTML = "<h2>Your Reviews</h2>";
    
                // Display user reviews
                if (userReviews.length > 0) {
                    const userReviewsSection = document.createElement("div");
                    userReviewsSection.innerHTML = "<h3>Product Reviews</h3>";
                    userReviews.forEach(review => {
                        const reviewElement = document.createElement("div");
                        reviewElement.className = "review";
                        reviewElement.innerHTML = `
                            <p><strong>Product:</strong> ${review.product_name || "Unknown"}</p>
                            <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
                            <p><strong>Comment:</strong> ${review.comment}</p>
                            <button class="delete-review" data-review-id="${review.review_id}">Delete</button>

                        `;
                        userReviewsSection.appendChild(reviewElement);
                    });
                    reviewsContainer.appendChild(userReviewsSection);
                } else {
                    reviewsContainer.innerHTML += "<p>No product reviews found.</p>";
                }
    
                // Display seller reviews
                if (sellerReviews.length > 0) {
                    const sellerReviewsSection = document.createElement("div");
                    sellerReviewsSection.innerHTML = "<h3>Seller Reviews</h3>";
                    sellerReviews.forEach(review => {
                        const reviewElement = document.createElement("div");
                        reviewElement.className = "review";
                        reviewElement.innerHTML = `
                            <p><strong>Seller:</strong> ${review.company_name || "Unknown"}</p>
                            <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
                            <p><strong>Comment:</strong> ${review.comment}</p>
                            <button class="delete-review" data-review-id="${review.review_id}">Delete</button>

                        `;
                        sellerReviewsSection.appendChild(reviewElement);
                    });
                    reviewsContainer.appendChild(sellerReviewsSection);
                } else {
                    reviewsContainer.innerHTML += "<p>No seller reviews found.</p>";
                }
                document.querySelectorAll(".delete-review").forEach(button => {
                    button.addEventListener("click", function () {
                        const reviewId = this.getAttribute("data-review-id");
                        const isSellerReview = this.closest(".review").parentElement.innerHTML.includes("Seller Reviews");
    
                        const deleteUrl = isSellerReview
                            ? `${BASE_URL}/users/${userId}/seller-reviews/${reviewId}`
                            : `${BASE_URL}/users/${userId}/reviews/${reviewId}`;
    
                        if (confirm("Are you sure you want to delete this review?")) {
                            fetch(deleteUrl, {
                                method: "DELETE",
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert("Review deleted successfully!");
                                        this.closest(".review").remove(); // Remove the review from the DOM
                                    } else {
                                        alert("Failed to delete review: " + data.error);
                                    }
                                })
                                .catch(error => console.error("Error deleting review:", error));
                        }
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching reviews:", error);
                reviewsContainer.innerHTML = "<p>Error fetching your reviews. Please try again later.</p>";
            });
    });
    document.querySelectorAll(".rply-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            const reviewCard = this.closest(".review-card");
            const reviewId = reviewCard.getAttribute("data-review-id");
            const replyContent = prompt("Enter your reply:");
    
            if (replyContent) {
                fetch(`http://localhost:5001/users/${userId}/reviews/${reviewId}/reply`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reply: replyContent }),
                })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        if (data.success) {
                            alert("Reply added successfully!");
                            // Optionally, append the reply to the review card
                            const replyElement = document.createElement("p");
                            replyElement.innerHTML = `<strong>Your Reply:</strong> ${replyContent}`;
                            reviewCard.appendChild(replyElement);
                        } else {
                            alert("Failed to add reply: " + data.error);
                        }
                    })
                    .catch(function (error) {
                        console.error("Error adding reply:", error);
                    });
            }
        });
    });
   
    




