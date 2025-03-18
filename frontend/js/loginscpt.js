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
});