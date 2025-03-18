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
            img.src = `http://localhost:5001/uploads/${profilePicUrl}`; // Ensure proper URL path
        });
    }

    // Update Profile Picture
    document.addEventListener("DOMContentLoaded", function () {
        const userId = localStorage.getItem("userId");
    
        if (userId) {
            fetch(`http://localhost:5001/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    if (user.profile_pic) {
                        document.getElementById("profilePic").src = `http://localhost:5001/${user.profile_pic}`;
                    }
                })
                .catch(error => console.error("Error fetching user data:", error));
        }
    });
    
    // Profile Picture Upload Handler
    document.getElementById("uploadAvatar").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append("profile_pic", file);
    
        const userId = localStorage.getItem("userId");
    
        fetch(`http://localhost:5001/upload/${userId}/profile`, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.profile_pic) {
                document.getElementById("profilePic").src = `http://localhost:5001/${data.profile_pic}`;
                alert("Profile picture updated!");
            }
        })
        .catch(error => console.error("Error uploading profile picture:", error));
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




