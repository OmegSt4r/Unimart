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
                    <div class="review-card">
                        <p><strong>Reviewer:</strong> ${review.reviewer}</p>
                        <p><strong>Reviewed Consumer:</strong> ${review.reviewed_user}</p>
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
   
    




