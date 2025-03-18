document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("review-form");
    const statusMessage = document.getElementById("status-message");
    const userId = localStorage.getItem("userId");
    console.log("Logged-in User ID:", userId);

    reviewForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const reviewType = document.getElementById("review-type").value;
        const reviewSubject = document.getElementById("review-subject").value.trim();
        const rating = document.getElementById("rating").value;
        const reviewText = document.getElementById("review-text").value.trim();

        // Validate fields
        if (!reviewSubject || !reviewText) {
            statusMessage.textContent = "Please fill out all fields.";
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
            review_subject: reviewSubject,
            rating: parseInt(rating, 10),
            comment: reviewText,
            review_source: userId,
        };

        const endpoint = reviewType === "seller" ? "/reviews/sellers" : "/reviews/users";

        try {
            const response = await fetch(`http://localhost:5001${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response from server:", errorData);
                
            }

            statusMessage.textContent = "Review submitted successfully!";
            statusMessage.style.color = "green";
            reviewForm.reset();
        } catch (error) {
            console.error("Error submitting review:", error);
            statusMessage.textContent = "Error submitting review.";
            statusMessage.style.color = "red";
        }
    });
});