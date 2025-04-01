function fetchMessages(senderId, receiverId) {
    fetch(`http://localhost:5001/users/${senderId}/chat/messages?userId2=${receiverId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(messages => {
            console.log("Fetched messages:", messages); // Debugging

            const chatContainer = document.getElementById("chat-container");
            if (!chatContainer) {
                console.error("Chat container not found in the DOM.");
                return;
            }

            chatContainer.innerHTML = ""; // Clear previous messages

            if (!messages || messages.length === 0) {
                chatContainer.innerHTML = "<p>No messages yet.</p>";
                return;
            }

            messages.forEach(message => {
                const messageDiv = document.createElement("div");
                const isSent = parseInt(message.sender_id) === parseInt(senderId);
                
                messageDiv.classList.add(isSent ? "sent-message" : "received-message");
                messageDiv.textContent = message.message || "No content";

                chatContainer.appendChild(messageDiv);
            });

            // Scroll to the latest message
            chatContainer.scrollTop = chatContainer.scrollHeight;
        })
        .catch(error => {
            console.error("Error fetching messages:", error);
        });
}
function sendMessage(senderId, receiverId, message) {
    fetch(`http://localhost:5001/users/${senderId}/chat/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            senderId: parseInt(senderId),  // Ensure correct format
            receiverId: parseInt(receiverId),
            message: message.trim()
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to send message. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Message sent successfully:", data);
        fetchMessages(senderId, receiverId); // Refresh chat after sending
    })
    .catch(error => {
        console.error("Error sending message:", error);
    });
}
document.addEventListener("DOMContentLoaded", function () {
    console.log("Inbox script loaded!");
    const userId = localStorage.getItem("userId"); 
    const inboxContainer = document.getElementById("inbox-container");
   
    if (!userId) {
        alert("User ID is missing. Please log in.");
        window.location.href = "login.html";
        return;
    }

    fetch(`http://localhost:5001/users/${userId}/inbox`)
    .then(response => {
        console.log("Fetch response status:", response.status); // Log the response status
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
        .then(conversations => {
            console.log("Inbox conversations:", conversations); // Debugging

            inboxContainer.innerHTML = "";

            if (!conversations || conversations.length === 0) {
                inboxContainer.innerHTML = "<p>No conversations found.</p>";
                return;
            }

            // Render each conversation properly
            conversations.forEach(convo => {
                const conversationDiv = document.createElement("div");
                conversationDiv.classList.add("conversation");

                const otherUserName = convo.other_user_name || "Unknown User";
                const lastMessage = convo.message || "No message available";
                const timestamp = convo.timestamp 
                    ? new Date(convo.timestamp).toLocaleString() 
                    : "Unknown time";

                conversationDiv.innerHTML = `
                    <h3>${otherUserName}</h3>
                    <p>${lastMessage}</p>
                    <time>${timestamp}</time>
                `;

                conversationDiv.addEventListener("click", () => {
                    window.location.href = `chat.html?receiverId=${convo.other_user_id}`;
                });

                inboxContainer.appendChild(conversationDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching inbox messages:", error);
            inboxContainer.innerHTML = "<p>Failed to load inbox. Please try again later.</p>";
        });
});
document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId"); // Get userId before using it
    const inboxContainer = document.getElementById("inbox-container"); // Inbox container
    const notificationsContainer = document.getElementById("notifications-list"); // List of notifications
    const notificationBadge = document.getElementById("notification-count"); // Badge element

    if (!userId) {
        console.error("❌ User ID is missing.");
        return;
    }

    // ✅ Fetch notifications and display them
    function fetchNotifications() {
        fetch(`http://localhost:5001/users/${userId}/notifications`)
            .then(response => response.json())
            .then(notifications => {
                console.log("📩 Fetched notifications:", notifications);
                notificationsContainer.innerHTML = ""; // Clear existing notifications

                if (notifications.length === 0) {
                    notificationsContainer.innerHTML = "<p>No new notifications.</p>";
                } else {
                    notifications.forEach(notification => {
                        const notificationDiv = document.createElement("div");
                        notificationDiv.classList.add("notification-item");
                        notificationDiv.dataset.notificationId = notification.notification_id;

                        if (!notification.is_read) {
                            notificationDiv.classList.add("unread");
                        }

                        notificationDiv.innerHTML = `
                            <p>${notification.message}</p>
                            <time>${new Date(notification.created_at).toLocaleString()}</time>
                        `;

                        notificationsContainer.appendChild(notificationDiv);
                    });
                }
            })
            .catch(error => console.error("❌ Error fetching notifications:", error));
    }

    // ✅ Fetch unread notification count
    function fetchUnreadCount() {
        fetch(`http://localhost:5001/users/${userId}/notifications/count`)
            .then(response => response.json())
            .then(data => {
                console.log("🔔 Notification count:", data.unread_count);
                if (notificationBadge) {
                    if (data.unread_count > 0) {
                        notificationBadge.textContent = data.unread_count;
                        notificationBadge.style.display = "inline-block";
                    } else {
                        notificationBadge.style.display = "none";
                    }
                } else {
                    console.error("❌ Notification badge element not found.");
                }
            })
            .catch(error => console.error("❌ Error fetching notification count:", error));
    }

    // ✅ Mark a notification as read
    notificationsContainer.addEventListener("click", function (event) {
        const notificationItem = event.target.closest(".notification-item");

        if (notificationItem && notificationItem.classList.contains("unread")) {
            const notificationId = notificationItem.dataset.notificationId;

            if (!userId || !notificationId) {
                console.error("❌ Missing userId or notificationId.");
                return;
            }

            console.log(`📩 Marking notification as read: userId=${userId}, notificationId=${notificationId}`);

            fetch(`http://localhost:5001/${userId}/notifications/mark-read/${notificationId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })
                .then(response => response.json())
                .then(data => {
                    console.log("✅ Response from server:", data);
                    if (data.affectedRows > 0) {
                        notificationItem.classList.remove("unread");
                        notificationItem.classList.add("read");
                        fetchUnreadCount(); // 🔄 Refresh unread count
                    }
                })
                .catch(error => console.error("❌ Error marking notification as read:", error));
        }
    });

    // ✅ Load notifications and unread count on page load
    fetchNotifications();
    fetchUnreadCount();
});
