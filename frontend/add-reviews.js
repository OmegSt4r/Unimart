document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("review-form");
    const statusMessage = document.getElementById("status-message");

    reviewForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const reviewType = document.getElementById("review-type").value;
        const reviewSubject = document.getElementById("review-subject").value.trim();
        const rating = document.getElementById("rating").value;
        const reviewText = document.getElementById("review-text").value.trim();

        if (!reviewSubject || !reviewText) {
            statusMessage.textContent = "Please fill out all fields.";
            statusMessage.style.color = "red";
            return;
        }

        const reviewData = {
            review_subject: reviewSubject,
            rating: parseInt(rating, 10),
            comment: reviewText,
            review_source: loggedInUserId // or some logic to get the user's ID
        };

        const endpoint = reviewType === "seller" ? "/reviews/sellers" : "/reviews/users";
        
        try {
            const response = await fetch(`http://localhost:5001${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) throw new Error("Failed to submit review");

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
