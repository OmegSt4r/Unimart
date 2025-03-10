document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("review-form");
    const statusMessage = document.getElementById("status-message");

    reviewForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get input values
        const buyerName = document.getElementById("buyer-name").value.trim();
        const sellerName = document.getElementById("seller-name").value.trim();
        const reviewText = document.getElementById("review-text").value.trim();

        if (!buyerName || !sellerName || !reviewText) {
            statusMessage.textContent = "Please fill out all fields.";
            statusMessage.style.color = "red";
            return;
        }

        // Create review object
        const reviewData = { buyer: buyerName, seller: sellerName, text: reviewText };

        try {
            const response = await fetch("/api/reviews", {
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
