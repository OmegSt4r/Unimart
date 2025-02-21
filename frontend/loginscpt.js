document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form refresh

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const userType = document.getElementById("seller-tab").checked ? "seller" : "buyer";

        const response = await fetch("http://localhost:5001/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, userType }),
        });

        const result = await response.json();

        if (response.ok) {
            // Save user session
            localStorage.setItem("user", JSON.stringify(result.user));

            alert("Login Successful!");
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            alert(result.message || "Invalid credentials. Please try again.");
        }
    });
});