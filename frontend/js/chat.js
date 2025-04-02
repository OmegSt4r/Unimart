document.addEventListener("DOMContentLoaded", function () {
    const senderId = localStorage.getItem("userId"); // Logged-in user ID
    const receiverId = new URLSearchParams(window.location.search).get("receiverId"); // Receiver's user ID
    const notificationId = new URLSearchParams(window.location.search).get("notificationId"); // Notification ID (optional)

    if (!senderId || !receiverId) {
        alert("Invalid chat session. Please ensure both sender and receiver IDs are set.");
        return;
    }
    function updateNotificationBadge() {
        fetch(`http://localhost:5001/users/${userId}/notifications/count`)
            .then(response => response.json())
            .then(data => {
                if (notificationBadge) {
                    notificationBadge.textContent = data.unread_count > 0 ? data.unread_count : "";
                    notificationBadge.style.display = data.unread_count > 0 ? "inline-block" : "none";
                }
            })
            .catch(error => console.error("❌ Error fetching notification count:", error));
    }
    // Mark the notification as read (if applicable)
    if (notificationId) {
        fetch(`http://localhost:5001/users/${senderId}/notifications/mark-read/${notificationId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to mark notification as read. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Notification marked as read:", data);
            updateNotificationBadge();
        })
        .catch(error => {
            console.error("Error marking notification as read:", error);
        });
    }

    // Fetch and display chat messages
    fetchMessages(senderId, receiverId);

    // Send a message when the button is clicked
    const sendMessageButton = document.getElementById("send-message-button");
    const chatMessageInput = document.getElementById("chat-message-input");

    sendMessageButton.addEventListener("click", function () {
        const message = chatMessageInput.value.trim();
        if (message) {
            sendMessage(senderId, receiverId, message);
            chatMessageInput.value = ""; // Clear the input field
        }
    });

    // Optionally, poll for new messages every 2 seconds
    setInterval(() => fetchMessages(senderId, receiverId), 2000);
});