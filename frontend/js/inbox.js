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
            conversations.forEach(conversation => {
            

                const conversationDiv = document.createElement("div");
                conversationDiv.classList.add("conversation");
                conversationDiv.setAttribute("data-user-id", conversation.other_user_id); // Add a unique identifier

                conversationDiv.innerHTML = `
                    <h3>${conversation.other_user_name || "Unknown User"}</h3>
                    <p>${conversation.message || "No message available"}</p>
                    <time>${conversation.timestamp ? new Date(conversation.timestamp).toLocaleString() : "Unknown time"}</time>
                `;

                conversationDiv.addEventListener("click", () => {
                    // Mark the notification as read
                    if (conversation.notification_id) {
                        fetch(`http://localhost:5001/users/${userId}/notifications/mark-read/${conversation.notification_id}`, {
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
                                // Redirect to the chat page
                                window.location.href = `chat.html?receiverId=${conversation.other_user_id}`;
                            })
                            .catch(error => {
                                console.error("Error marking notification as read:", error);
                                // Redirect to the chat page even if marking fails
                                window.location.href = `chat.html?receiverId=${conversation.other_user_id}`;
                            });
                    } else {
                        // Redirect to the chat page if no notification ID is associated
                        window.location.href = `chat.html?receiverId=${conversation.other_user_id}`;
                    }
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
    const userId = localStorage.getItem("userId"); // Retrieve user ID
    const notificationsContainer = document.getElementById("notifications-list");
    const notificationBadge = document.getElementById("notification-count");

    if (!userId) {
        console.error("❌ User ID not found in localStorage.");
        return;
    }

    // ✅ Fetch notifications
    function fetchNotifications() {
        fetch(`http://localhost:5001/users/${userId}/notifications`)
            .then(response => response.json())
            .then(notifications => {
                console.log("📩 Fetched notifications:", notifications);
                notificationsContainer.innerHTML = ""; // Clear old notifications
    
                const unreadNotifications = notifications.filter(notification => !notification.is_read);
    
                if (unreadNotifications.length === 0) {
                    notificationsContainer.innerHTML = "<p>No new notifications.</p>";
                    return;
                }
    
                unreadNotifications.forEach(notification => {
                    const notificationDiv = document.createElement("div");
                    notificationDiv.classList.add("notification-item");
                    notificationDiv.dataset.notificationId = notification.notification_id;
    
                    notificationDiv.innerHTML = `
                        <p>${notification.message}</p>
                        <time>${new Date(notification.created_at).toLocaleString()}</time>
                    `;
    
                    notificationsContainer.appendChild(notificationDiv);
                });
            })
            .catch(error => console.error("❌ Error fetching notifications:", error));
    }
    function updateNotificationBadge() {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
    
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

            fetch(`http://localhost:5001/users/${userId}/notifications/mark-read/${convo.notification_id}`, {
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
                updateNotificationBadge(); // Update the notification badge
                window.location.href = `chat.html?receiverId=${convo.other_user_id}`;
            })
            .catch(error => {
                console.error("Error marking notification as read:", error);
                window.location.href = `chat.html?receiverId=${convo.other_user_id}`;
            });
    }
    // ✅ Load notifications and unread count on page load
    fetchNotifications();
    fetchUnreadCount();
    updateNotificationBadge();
});
});
