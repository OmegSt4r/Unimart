document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("review-form");
    const statusMessage = document.getElementById("status-message");
    const userId = localStorage.getItem("userId");
    console.log("Logged-in User ID:", userId);

    reviewForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const reviewType = document.getElementById("review-type").value; // "seller" or "user"
        const reviewSubject = document.getElementById("review-subject").value.trim(); // ID of the user/seller being reviewed
        const rating = document.getElementById("rating").value;
        const reviewText = document.getElementById("review-text").value.trim();

        // Validate fields
        if (!reviewSubject || isNaN(parseInt(reviewSubject, 10))) {
            statusMessage.textContent = "Invalid review subject.";
            statusMessage.style.color = "red";
            return;
        }
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

        const reviewData = {
            comment: reviewText,
            rating: parseInt(rating, 10),
             // The logged-in user leaving the review
           // The user or seller being reviewed
        };
        if (reviewType === "seller") {
            reviewData.review_subject = parseInt(reviewSubject, 10); 
            reviewData.review_source= parseInt(userId, 10)// For seller reviews
        } else {
            reviewData.comment_subject = parseInt(reviewSubject, 10); 
            reviewData.comment_source=parseInt(userId, 10);// For user reviews
        }
        // Determine the endpoint based on the review type
        const endpoint =
            reviewType === "seller"
                ? `/users/${reviewSubject}/seller-reviews`
                : `/users/${reviewSubject}/user-reviews`;

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
                window.location.href = "my-reviews.html"; // Replace with the actual path to your reviews page
            }, 1000);
        } catch (error) {
            console.error("Error submitting review:", error);
            statusMessage.textContent = "Error submitting review.";
            statusMessage.style.color = "red";
        }

    });
    document.getElementById("review-subject").addEventListener("input", async function () {
        const query = this.value.trim();
        const reviewType = document.getElementById("review-type").value;
        const suggestionsContainer = document.getElementById("suggestions");
    
        if (!query) {
            suggestionsContainer.innerHTML = "";
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5001/users/search?query=${query}&type=${reviewType}`);
            if (!response.ok) throw new Error("Failed to fetch suggestions");
    
            const suggestions = await response.json();
            suggestionsContainer.innerHTML = suggestions
                .map(suggestion => `<div class="suggestion" data-id="${suggestion.id}">${suggestion.name}</div>`)
                .join("");
    
            // Add click event to suggestions
            document.querySelectorAll(".suggestion").forEach(suggestion => {
                suggestion.addEventListener("click", function () {
                    document.getElementById("review-subject").value = this.dataset.id;
                    suggestionsContainer.innerHTML = "";
                });
            });
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    });
});