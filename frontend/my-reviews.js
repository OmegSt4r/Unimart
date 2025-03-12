document.addEventListener("DOMContentLoaded", async function () {
    const reviewsList = document.getElementById("reviews-list");
    const sellerRatingContainer = document.getElementById("seller-rating");
    const customerRatingContainer = document.getElementById("customer-rating");

    try {
        const response = await fetch("http://localhost:5001/reviews");
        
        if (!response.ok) {
            console.error('Error response from server:', response);
            throw new Error("Failed to fetch reviews");
        }

        const { sellerReviews, userReviews } = await response.json();
        console.log("Fetched reviews:", { sellerReviews, userReviews }); // Debugging output

        function generateStars(rating) {
            if (rating < 1) rating = 1;
            if (rating > 5) rating = 5;
            return "★".repeat(rating) + "☆".repeat(5 - rating);
        }

        sellerRatingContainer.innerHTML = generateStars(4);
        customerRatingContainer.innerHTML = generateStars(5);

        let reviewsHTML = "";

        sellerReviews.forEach(review => {
            reviewsHTML += `
                <div class="review-card">
                    <p><strong>${review.seller_name} (Seller)</strong></p>
                    <p>${review.comment}</p>
                    <div class="stars">${generateStars(review.rating)}</div>
                    <button class="rate-btn">Rate</button>
                    <button class="reply-btn">Reply</button>
                </div>`;
        });

        userReviews.forEach(review => {
            reviewsHTML += `
                <div class="review-card">
                    <p><strong>${review.buyer_name} (Buyer)</strong></p>
                    <p>${review.comment}</p>
                    <div class="stars">${generateStars(review.rating)}</div>
                    <button class="rate-btn">Rate</button>
                    <button class="reply-btn">Reply</button>
                </div>`;
        });

        reviewsList.innerHTML = reviewsHTML;

    } catch (error) {
        console.error("Error loading reviews:", error);
        reviewsList.innerHTML = "<p>Failed to load reviews. Please try again later.</p>";
    }
});
