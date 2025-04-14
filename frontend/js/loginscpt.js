document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    

    fetch("http://localhost:5001/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("token", data.token);
            alert("Login successful!");
            // Redirect to homepage or another page
            window.location.href = 'index.html';
        } else {
            alert("Login failed: " + data.error);
        }
    })
    .catch(error => console.error("Error logging in:", error));
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