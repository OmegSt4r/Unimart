
document.addEventListener("DOMContentLoaded", function() {
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
        formData.append("tags", JSON.stringify(selectedTags));
        submitProductForm(formData, userId);
    });
});

function fetchExistingTags() {
    fetch("http://localhost:5001/tags")
        .then(response => response.json())
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
    .catch(error => console.error("Error adding product:", error));
}