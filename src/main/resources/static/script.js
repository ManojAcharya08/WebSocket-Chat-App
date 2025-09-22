let stompClient = null;
let currentUsername = '';

function connect() {
    const senderInput = document.getElementById('sender');
    currentUsername = senderInput.value.trim();
    if (!currentUsername) {
        alert("Please enter your name before connecting.");
        return;
    }

    setStatus("Connecting...");
    const socket = new SockJS('/ws?username=' + encodeURIComponent(currentUsername));
    stompClient = Stomp.over(socket);

    senderInput.readOnly = true;
    document.getElementById('connectBtn').disabled = true;
    document.getElementById('disconnectBtn').disabled = false;

    stompClient.connect({}, function () {
        setStatus("Connected");
        stompClient.send("/app/register", {}, JSON.stringify({ sender: currentUsername }));

        stompClient.subscribe('/topic/messages', (msg) => displayMessage(msg, false));
        stompClient.subscribe('/user/queue/private', (msg) => handlePrivate(msg));
        stompClient.subscribe('/topic/userList', (users) => updateUserList(JSON.parse(users.body)));
        stompClient.subscribe('/topic/history', (msg) => handleHistory(JSON.parse(msg.body)));

        stompClient.send("/app/requestHistory", {}, JSON.stringify({ username: currentUsername }));
        stompClient.send("/app/refreshUsers", {}, JSON.stringify({}));

        document.getElementById('sendBtn').disabled = false;
        document.getElementById('receiver').disabled = false;
        document.getElementById('message').disabled = false;
        document.getElementById('message').focus();
    }, (error) => {
        alert("Connection failed: " + error);
        resetUI();
    });
}

function handlePrivate(msg) {
    try {
        const message = JSON.parse(msg.body);
        if (message.sender === "System" && message.content && message.content.toLowerCase().includes("already taken")) {
            alert(message.content);
            setTimeout(resetUI, 100);
            return;
        }
        displayMessage(msg, true);
    } catch (e) {
        console.error("Error handling private message:", e);
    }
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect(() => {
            setStatus("Disconnected");
            resetUI();
            console.log("Disconnected");
        });
    }
}

function resetUI() {
    document.getElementById('sender').readOnly = false;
    document.getElementById('connectBtn').disabled = false;
    document.getElementById('disconnectBtn').disabled = true;
    document.getElementById('sendBtn').disabled = true;
    document.getElementById('receiver').disabled = true;
    document.getElementById('message').disabled = true;
    document.getElementById('user-list').innerHTML = '<h3>Online Users</h3>';
    setStatus("Disconnected");
    currentUsername = '';
}

function sendMessage() {
    if (!stompClient || !currentUsername) {
        alert("Please connect first.");
        return;
    }

    const receiverInput = document.getElementById('receiver');
    const messageInput = document.getElementById('message');
    const receiver = receiverInput.value.trim();
    const content = messageInput.value.trim();

    if (!content) {
        alert("Message content is required.");
        return;
    }

    const payload = {
        sender: currentUsername,
        content: content,
        receiver: receiver || null
    };

    stompClient.send("/app/chat", {}, JSON.stringify(payload));
    messageInput.value = "";
    messageInput.focus();
}

function displayMessage(msg, isPrivate) {
    try {
        const message = typeof msg.body === "string" ? JSON.parse(msg.body) : msg;
        if (message.id && document.querySelector(`[data-message-id="${message.id}"]`)) return;

        const li = document.createElement('li');
        if (message.id) li.setAttribute('data-message-id', message.id);

        // Determine message type for styling
        if (message.sender === "System") {
            li.className = "system";
        } else if (isPrivate) {
            li.className = "private-message";
            if (message.sender === currentUsername) li.classList.add('me');
        } else {
            li.className = "public-message";
            if (message.sender === currentUsername) li.classList.add('me');
        }

        // Message time
        const timeSpan = document.createElement('span');
        timeSpan.className = "message-time";
        timeSpan.textContent = message.formattedTimestamp || formatTimestamp(message.timestamp) || '';

        // Message body
        const contentDiv = document.createElement('div');
        contentDiv.className = "message-content";

        if (message.sender === "System") {
            contentDiv.textContent = message.content;
        } else if (isPrivate) {
            const senderSpan = document.createElement('span');
            senderSpan.className = "message-sender";
            senderSpan.textContent = message.sender === currentUsername
                ? "[Private] You to " + message.receiver
                : "[Private] " + message.sender + " to you";
            contentDiv.appendChild(senderSpan);
            contentDiv.innerHTML += `: ${message.content}`;
        } else {
            const senderSpan = document.createElement('span');
            senderSpan.className = "message-sender";
            senderSpan.textContent = message.sender;
            contentDiv.appendChild(senderSpan);
            contentDiv.innerHTML += `: ${message.content}`;
        }

        li.appendChild(timeSpan);
        li.appendChild(contentDiv);
        document.getElementById('messages').appendChild(li);
        scrollToBottom();
    } catch (e) {
        console.error("Error parsing message:", e);
    }
}

function handleHistory(messages) {
    if (!Array.isArray(messages)) return;
    messages.forEach(msg => {
        let isPrivate = false;
        if (msg.receiver && (msg.receiver === currentUsername || msg.sender === currentUsername)) {
            isPrivate = true;
        }
        if (msg.id && document.querySelector(`[data-message-id="${msg.id}"]`)) return;
        displayMessage({ body: JSON.stringify(msg) }, isPrivate);
    });
    scrollToBottom();
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return '';
    }
}

function scrollToBottom() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateUserList(users) {
    const userListDiv = document.getElementById('user-list');
    userListDiv.innerHTML = `
        <div class="user-list-header">
            <h3>Online Users</h3>
            <button onclick="refreshUserList()" class="refresh-btn" title="Refresh user list">🔄</button>
        </div>
    `;

    const userContainer = document.createElement('div');
    if (!users || users.length === 0) {
        userContainer.innerHTML = '<div class="no-users">No users online</div>';
    } else {
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = "user-item";
            userDiv.textContent = user;
            if (user === currentUsername) userDiv.classList.add('me');
            userContainer.appendChild(userDiv);
        });
    }
    userListDiv.appendChild(userContainer);
}

function refreshUserList() {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/refreshUsers", {}, JSON.stringify({}));
    }
}

function setStatus(status) {
    let statusBar = document.getElementById('status-bar');
    if (!statusBar) {
        statusBar = document.createElement('div');
        statusBar.id = 'status-bar';
        statusBar.style.position = 'fixed';
        statusBar.style.top = '0';
        statusBar.style.left = '0';
        statusBar.style.right = '0';
        statusBar.style.background = 'rgba(67,233,123,0.98)';
        statusBar.style.color = '#232b3a';
        statusBar.style.fontWeight = 'bold';
        statusBar.style.textAlign = 'center';
        statusBar.style.padding = '4px 0';
        statusBar.style.zIndex = '9999';
        document.body.appendChild(statusBar);
    }
    statusBar.textContent = status;
    if (status === "Connected") {
        statusBar.style.background = 'rgba(67,233,123,0.98)';
        statusBar.style.color = '#232b3a';
    } else if (status === "Disconnected") {
        statusBar.style.background = '#ffbdbd';
        statusBar.style.color = '#232b3a';
    } else {
        statusBar.style.background = '#ffe066';
        statusBar.style.color = '#232b3a';
    }
    if (status === "Connected" || status === "Disconnected") {
        setTimeout(() => statusBar.remove(), 2000);
    }
}

// Keyboard: send message on Enter
document.getElementById('message').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
