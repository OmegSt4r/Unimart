// Search Bar Functionality
document.getElementById("searchBar").addEventListener("keyup", function(event) {
    let query = event.target.value.toLowerCase();
    let products = document.querySelectorAll(".product");

    products.forEach(product => {
        let description = product.textContent.toLowerCase();
        if (description.includes(query)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
});

// Add to Cart Button
document.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", function() {
        alert("Item added to cart!");
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const filterBtn = document.querySelector(".filter-btn");
    const filterContainer = document.querySelector(".filter-container");

    filterBtn.addEventListener("click", function() {
        filterContainer.classList.toggle("active");
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const checkboxes = document.querySelectorAll(".filter-tag");
    const sortSelect = document.getElementById("sortPrice");
    const productsContainer = document.querySelector(".products");
    const products = Array.from(document.querySelectorAll(".product"));

    function filterAndSort() {
        let selectedTags = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        let sortedProducts = products.filter(product => {
            let productTags = product.getAttribute("data-tags").split(",");
            return selectedTags.length === 0 || selectedTags.some(tag => productTags.includes(tag));
        });
        let sortOrder = sortSelect.value;
        if (sortOrder === "low") {
            sortedProducts.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
        } else if (sortOrder === "high") {
            sortedProducts.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
        }
        if (selectedTags.length === 0 && sortOrder === "") {
            sortedProducts = products;
        }

        productsContainer.innerHTML = "";
        sortedProducts.forEach(product => productsContainer.appendChild(product));
    }

    checkboxes.forEach(checkbox => checkbox.addEventListener("change", filterAndSort));
    sortSelect.addEventListener("change", filterAndSort);   });
                   