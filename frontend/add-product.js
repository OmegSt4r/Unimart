
document.addEventListener("DOMContentLoaded", function() {
    checkSellerStatus();
    fetchExistingTags();

    document.getElementById("add-product-form").addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData(this);
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("Please log in to add a product.");
            window.location.href = "login.html";
            return;
        }
        const selectedTags = Array.from(document.getElementById("tags").selectedOptions).map(option => option.value);
        if (selectedTags.length > 0) {
            formData.append("tags", JSON.stringify(selectedTags));
        }
        submitProductForm(formData, userId);
    });
});
function checkSellerStatus() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    fetch(`http://localhost:5001/users/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.seller_id) {
                // If the user is not a seller, hide the form and show a message
                document.getElementById("add-product-container").innerHTML = "<p>You must be a seller to add products.</p>";
            }
        })
        .catch(error => console.error("Error checking seller status:", error));
}

function fetchExistingTags() {
    fetch("http://localhost:5001/tags")
        .then(response => { if (!response.ok) {
            throw new Error("Failed to fetch tags");
        }
        return response.json();
    })
        .then(tags => {
            const tagsSelect = document.getElementById("tags");
            tags.forEach(tag => {
                const option = document.createElement("option");
                option.value = tag.tag_id;
                option.textContent = tag.tag_name;
                tagsSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching tags:", error));
}

function submitProductForm(formData, userId) {
    fetch(`http://localhost:5001/users/${userId}/add-product`, {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Product added successfully!");
            window.location.href = "index.html";
        } else {
            alert("Failed to add product: " + data.message);
        }
    })
    .catch(error =>{
        console.error("Error adding product:", error);
        alert("An error occurred while adding the product.");
});}