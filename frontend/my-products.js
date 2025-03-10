document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please log in to view your products.");
        window.location.href = "login.html";
        return;
    }

    const myProductsContainer = document.getElementById("my-products-container");

    // Fetch user's products
    fetch(`http://localhost:5001/users/${userId}/my-products`)
        .then(response => response.json())
        .then(products => {
            myProductsContainer.innerHTML = "";
            products.forEach(product => {
                const productForm = document.createElement("form");
                productForm.className = "product-form";
                productForm.innerHTML = `
                    <div class="form-group">
                        <label for="product-name-${product.product_id}">Product Name</label>
                        <input type="text" id="product-name-${product.product_id}" name="product_name" value="${product.product_name}" required>
                    </div>
                    <div class="form-group">
                        <label for="product-description-${product.product_id}">Description</label>
                        <textarea id="product-description-${product.product_id}" name="p_description" rows="3" required>${product.p_description}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="product-price-${product.product_id}">Price</label>
                        <input type="number" id="product-price-${product.product_id}" name="price" step="0.01" value="${product.price}" required>
                    </div>
                    <div class="form-group">
                        <label for="product-inventory-${product.product_id}">Inventory</label>
                        <input type="number" id="product-inventory-${product.product_id}" name="inventory" value="${product.inventory}" required>
                    </div>
                   <div class="form-group">
                        <label for="tags-${product.product_id}">Tags:</label>
                        <select id="tags-${product.product_id}" name="tags[]" multiple required>
                           
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product-image-${product.product_id}">Product Image</label>
                        <input type="file" id="product-image-${product.product_id}" name="p_image" accept="image/*">
                    </div>
                    <button type="submit" class="update-product" data-product-id="${product.product_id}">Update</button>
                    <button type="button" class="delete-product" data-product-id="${product.product_id}">Delete</button>
                `;
                myProductsContainer.appendChild(productForm);
                // Fetch existing tags and populate the dropdown
                fetch("http://localhost:5001/tags")
                    .then(response => response.json())
                    .then(tags => {
                        const tagsSelect = document.getElementById(`tags-${product.product_id}`);
                        tags.forEach(tag => {
                            const option = document.createElement("option");
                            option.value = tag.tag_id;
                            option.textContent = tag.tag_name;
                            if (product.tags && product.tags.includes(tag.tag_id)) {
                                option.selected = true;
                            }
                            tagsSelect.appendChild(option);
                        });
                    })
                    .catch(error => console.error("Error fetching tags:", error));

                // Add event listener for update button
                productForm.querySelector(".update-product").addEventListener("click", function(event) {
                    event.preventDefault();
                    const productId = this.getAttribute("data-product-id");
                    const formData = new FormData(productForm);
                    const selectedTags = Array.from(productForm.querySelectorAll(`#tags-${product.product_id} option:checked`)).map(option => option.value);
                    formData.append("tags", JSON.stringify(selectedTags));

                    fetch(`http://localhost:5001/users/${userId}/update-product/${productId}`, {
                        method: "PUT",
                        body: formData,
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert("Product updated successfully!");
                        } else {
                            alert("Failed to update product: " + data.message);
                        }
                    })
                    .catch(error => console.error("Error updating product:", error));
                });

                // Add event listener for delete button
                productForm.querySelector(".delete-product").addEventListener("click", function() {
                    const productId = this.getAttribute("data-product-id");
                    if (confirm("Are you sure you want to delete this product?")) {
                        fetch(`http://localhost:5001/users/${userId}/delete-product/${productId}`, {
                            method: "DELETE"
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert("Product deleted successfully!");
                                window.location.reload();
                            } else {
                                alert("Failed to delete product: " + data.message);
                            }
                        })
                        .catch(error => console.error("Error deleting product:", error));
                    }
                });
            });
        })
        .catch(error => console.error("Error fetching user's products:", error));
});