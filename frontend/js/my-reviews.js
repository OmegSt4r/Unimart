document.addEventListener("DOMContentLoaded", async function () {
    const sellerReviewsList = document.getElementById("seller-reviews-list");
    const userReviewsList = document.getElementById("user-reviews-list");
    const sellerRatingContainer = document.getElementById("seller-rating");
    const customerRatingContainer = document.getElementById("customer-rating");
    const myReviewsList = document.getElementById("my-reviews-list");
    const userId = localStorage.getItem("userId");
    console.log("Logged-in User ID:", userId);
    if (!userId) {
        alert("Please log in to view your reviews.");
        window.location.href = "login.html";
        return;
    }

        try {
            const response = await fetch("http://localhost:5001/reviews");
            if (!response.ok) {
                throw new Error("Failed to fetch reviews");
            }
    
            const { sellerReviews, userReviews } = await response.json();
    function generateStars(rating) {
            if (rating < 1) rating = 1;
            if (rating > 5) rating = 5;
            return "★".repeat(rating) + "☆".repeat(5 - rating);
        }

        sellerRatingContainer.innerHTML = generateStars(4);
        customerRatingContainer.innerHTML = generateStars(5);
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
            
         }
         try {
            const response = await fetch(`http://localhost:5001/users/${userId}/my-reviews`);
            if (!response.ok) {
                throw new Error("Failed to fetch your reviews");
            }
    
            const myReviews = await response.json();
    
            myReviewsList.innerHTML = ""; // Clear the list
            myReviews.forEach((review) => {
                const reviewElement = document.createElement("div");
                reviewElement.classList.add("review");
                reviewElement.innerHTML = `
                    <div class="review-card">
                        <p><strong>Reviewer:</strong> ${review.reviewer || "Unknown"}</p>
                        <p><strong>${review.seller ? "Seller" : "Reviewed User"}:</strong> ${review.seller || review.reviewed_user || "Unknown"}</p>
                        <p><strong>Comment:</strong> ${review.comment}</p>
                        <div class="stars">${generateStars(review.rating)}</div>
                    </div>`;
                myReviewsList.appendChild(reviewElement);
            });
        } catch (error) {
            console.error("Error loading your reviews:", error);
            myReviewsList.innerHTML = "<p>Failed to load your reviews. Please try again later.</p>";
        }
    });
   
    




