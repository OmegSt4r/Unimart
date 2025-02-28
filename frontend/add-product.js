document.getElementById("add-product-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in to add a product.");
        window.location.href = "login.html";
        return;
    }

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
});