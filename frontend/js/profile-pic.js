document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");
    const BASE_URL = "http://localhost:5001";

    if (!userId) {
        console.error("User ID is not set in localStorage.");
        return;
    }

    // Fetch user data to get the profile picture
    fetch(`${BASE_URL}/users/${userId}`)
        .then(response => response.json())
        .then(user => {
            const profilePicElements = document.querySelectorAll(".profile-pic");

            // Update all profile picture elements on the page
            profilePicElements.forEach(profilePic => {
                profilePic.src = user.profile_pic
                    ? `${BASE_URL}/${user.profile_pic}?t=${Date.now()}` // Cache-busting query
                    : "images/default-profile.jpg";
            });
        })
        .catch(error => console.error("Error fetching user data:", error));
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