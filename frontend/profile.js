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
