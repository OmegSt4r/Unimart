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
    const userId = localStorage.getItem("userId"); // Use consistent key
    if (!userId) {
        alert("You must be logged in to view this page.");
        window.location.href = "login.html";
        return;
    }

    // Fetch user data
    fetch(`http://localhost:5001/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            document.getElementById("usernameDisplay").textContent = user.username;
            document.getElementById("wallet-amount").textContent = `$${user.wallet_balance}`;

            if (user.profile_pic) {
                localStorage.setItem("profilePic", user.profile_pic);
                updateProfilePictures(user.profile_pic);
            }

            if (user.is_seller) {
                document.getElementById("sellerSettings").classList.remove("hidden");
                document.getElementById("companyName").value = user.company_name || "";
            }
        })
        .catch(err => console.error("Error fetching user data:", err));

    function updateProfilePictures(profilePicUrl) {
        document.querySelectorAll(".profile-pic").forEach(img => {
            img.src = `http://localhost:5001/${profilePicUrl}`; // Ensure proper URL path
        });
    }

    // Update Profile Picture
    document.addEventListener("DOMContentLoaded", function () {
        const userId = localStorage.getItem("userId");
    
        if (userId) {
            ffetch(`http://localhost:5001/users/${userId}`)
            .then(response => response.json())
            .then(user => {
                console.log("Fetched user data:", user); // Debugging
                if (user.profile_pic) {
                    document.getElementById("profilePic").src = `http://localhost:5001/${user.profile_pic}`;
                } else {
                    document.getElementById("profilePic").src = "images/default-profile.jpg"; // Default profile picture
                }
            })
            .catch(error => console.error("Error fetching user data:", error));
        }});
    document.addEventListener("DOMContentLoaded", async function () {
        const userId = localStorage.getItem("userId");
        const profilePic = document.getElementById("profilePic");
      
        if (userId) {
          try {
            const response = await fetch(`http://localhost:5001/users/${userId}`);
            if (!response.ok) {
              throw new Error("Failed to fetch user data");
            }
      
            const user = await response.json();
            if (user.profile_pic) {
              profilePic.src = `http://localhost:5001/${user.profile_pic}`;
            } else {
              profilePic.src = "images/default-profile.jpg"; // Default profile picture
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      });
      document.getElementById("profilePicInput").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            console.log("Selected file:", file); // Debugging
            const formData = new FormData();
            formData.append("profile_pic", file);
    
            fetch(`http://localhost:5001/users/${userId}/upload-profile-pic`, {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                console.log("Upload response:", data); // Debugging
                alert(data.message);
                if (data.success) {
                    console.log("Upload response:", data); // Debugging
                    document.getElementById("profilePic").src = `http://localhost:5001${data.profile_pic}`;
                    alert("Profile picture updated!");
                } else {
                    alert("Failed to update profile picture");
                }
            })
            .catch(err => console.error("Error updating profile picture:", err));
        } else {
            console.error("No file selected");
        }
    });

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



