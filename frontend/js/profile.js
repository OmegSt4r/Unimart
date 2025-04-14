function upgradeToSeller() {
    const userId = localStorage.getItem("userId"); // Get user ID from storage
    console.log("User ID from localStorage:", userId); // Debugging
    
    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    const companyName = prompt("Enter your seller name:");
    if (!companyName) {
        alert("Seller name cannot be empty.");
        return;
    }

    fetch(`http://localhost:5001/users/${userId}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Response Data:", data); // Debugging
        alert(data.message);
        if (data.seller_id) {
            location.reload();
        }
    })
    .catch(err => console.error("Error:", err));
}

document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");
    const BASE_URL = "http://localhost:5001";

    if (!userId) {
        alert("You must be logged in to view this page.");
        window.location.href = "login.html";
        return;
    }

    const profileContainer = document.getElementById("profile-container");

    // Fetch user data
    fetch(`http://localhost:5001/users/${userId}`)
        .then(response => response.json())
        .then(user => {
            profileContainer.innerHTML = `
                <form id="profile-form" class="profile-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" value="${user.username}" required>
                    </div>
                    <div class="form-group">
                        <label for="wallet-amount">Wallet Balance</label>
                        <input type="text" id="wallet-amount" name="wallet_balance" value="$${user.wallet_balance}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePicInput">Profile Picture</label>
                        <input type="file" id="profilePicInput" name="profile_pic" accept="image/*">
                        <img id="profilePic" src="${user.profile_pic ? `http://localhost:5001/${user.profile_pic}` : 'images/default-profile.jpg'}" alt="Profile Picture" class="profile-image">
                    </div>
                    ${user.is_seller ? `
                        <div class="form-group">
                            <label for="companyName">Company Name</label>
                            <input type="text" id="companyName" name="company_name" value="${user.company_name || ''}">
                        </div>
                    ` : ''}
                    <button type="submit" id="updateProfileButton">Update Profile</button>
                </form>
            `;

            // Add event listener for profile picture upload
            document.getElementById("profilePicInput").addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (!file) {
                    console.error("No file selected");
                    return;
                }

                const formData = new FormData();
                formData.append("profile_pic", file);

                fetch(`http://localhost:5001/users/${userId}/upload-profile-pic`, {
                    method: "POST",
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const profilePic = document.getElementById("profilePic");
                            profilePic.src = `http://localhost5001/${data.profile_pic}?t=${Date.now()}`; // Cache-busting query
                            alert("Profile picture updated successfully!");
                        } else {
                            alert("Failed to update profile picture: " + data.error);
                        }
                    })
                    .catch(error => console.error("Error uploading profile picture:", error));
            });
           
            // Add event listener for profile update
            document.getElementById("profile-form").addEventListener("submit", function (event) {
                event.preventDefault();
            
                const userId = localStorage.getItem("userId");
                const BASE_URL = "http://localhost:5001";
            
                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries()); // Convert FormData to a plain object
            
                fetch(`${BASE_URL}/users/${userId}/update-profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert("Profile updated successfully!");
                            location.reload(); // Reload the page to reflect changes
                        } else {
                            alert("Failed to update profile: " + data.error);
                        }
                    })
                    .catch(error => console.error("Error updating profile:", error));
            });
        });
    });

// Profile picture upload


    // Update Password
    document.getElementById("updatePassword").addEventListener("click", function () {
        const newPassword = document.getElementById("newPassword").value;
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        fetch(`http://localhost:5001/users/${userId}/update-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_password: newPassword })
        })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(err => console.error("Error updating password:", err));
    });

    // Update Company Name (for sellers)
    document.getElementById("updateCompany").addEventListener("click", function () {
        const companyName = document.getElementById("companyName").value;

        fetch(`http://localhost:5001/users/${userId}/update-company`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_name: companyName })
        })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(err => console.error("Error updating company name:", err));
    });

    // Delete Account
    document.getElementById("deleteAccount").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete your account?")) {
            fetch(`http://localhost:5001/users/${userId}/delete`, { method: "DELETE" })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                localStorage.clear();
                window.location.href = "login.html";
            })
            .catch(err => console.error("Error deleting account:", err));
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
});
document.getElementById("topup-button").addEventListener("click", function () {
    const userId = localStorage.getItem("userId");
    const amount = parseFloat(document.getElementById("topup-amount").value);

    if (!userId) {
        alert("Please log in to add funds.");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    fetch(`http://localhost:5001/users/${userId}/wallet/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // Optionally, update the wallet balance on the page
                const walletAmount = document.getElementById("wallet-amount");
                walletAmount.textContent = `$${(parseFloat(walletAmount.textContent.replace("$", "")) + amount).toFixed(2)}`;
            } else {
                alert("Failed to add funds.");
            }
        })
        .catch(error => console.error("Error adding funds:", error));
});




window.alert = function(message) {
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