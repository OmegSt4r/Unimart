document.addEventListener("DOMContentLoaded", async function () {
    const reviewsContainer = document.getElementById("my-reviews-container");

    try {
        const response = await fetch("/backend/reviews"); 
        if (!response.ok) throw new Error("Failed to fetch reviews");

        const reviews = await response.json();
        reviewsContainer.innerHTML = ""; // Clear loading message

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = "<p>No reviews found.</p>";
            return;
        }

        reviews.forEach(review => {
            const reviewElement = document.createElement("div");
            reviewElement.classList.add("review");
            reviewElement.innerHTML = `
                <p><strong>Buyer:</strong> ${review.buyer}</p>
                <p><strong>Seller:</strong> ${review.seller}</p>
                <p>${review.text}</p>
                <button class="delete-review" data-id="${review.id}">Remove</button>
            `;
            reviewsContainer.appendChild(reviewElement);
        });

        // Handle review deletion
        document.querySelectorAll(".delete-review").forEach(button => {
            button.addEventListener("click", async function () {
                const reviewId = this.getAttribute("data-id");
                await deleteReview(reviewId);
                this.parentElement.remove();
            });
        });

    } catch (error) {
        console.error("Error loading reviews:", error);
        reviewsContainer.innerHTML = "<p>Error loading reviews.</p>";
    }
});

// Function to delete a review
async function deleteReview(reviewId) {
    try {
        const response = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete review");
    } catch (error) {
        console.error("Error deleting review:", error);
    }
}
