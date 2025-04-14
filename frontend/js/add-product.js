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
document.addEventListener("DOMContentLoaded", function () {
    const profilePic = localStorage.getItem("profilePic");
    if (profilePic) {
        updateProfilePictures(profilePic);
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const hamburgerMenuContent = document.getElementById("hamburger-menu-content");

    hamburgerMenu.addEventListener("click", function () {
        const isVisible = hamburgerMenuContent.style.display === "block";
        hamburgerMenuContent.style.display = isVisible ? "none" : "block";
    });

    // Close the menu when clicking outside
    document.addEventListener("click", function (event) {
        if (!hamburgerMenu.contains(event.target) && !hamburgerMenuContent.contains(event.target)) {
            hamburgerMenuContent.style.display = "none";
        }
    });
}); window.alert = function(message) {
    if (typeof showUniMartToast === "function") {
      showUniMartToast(message);
    } else {
      console.log("Toast fallback:", message);
    }
  };
  function showUniMartToast(message) {
    const toast = document.getElementById("unimart-toast");
    const msgSpan = document.getElementById("unimart-toast-message");
  
    msgSpan.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");
  
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 300); // for fade-out effect
    }, 3000);
  }