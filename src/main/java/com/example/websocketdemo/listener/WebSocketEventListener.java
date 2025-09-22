package com.example.websocketdemo.listener;

import com.example.websocketdemo.model.Message;
import com.example.websocketdemo.session.UserSessionRegistry;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;

@Component
public class WebSocketEventListener {

    private static final String SYSTEM_SENDER = "System";
    private static final DateTimeFormatter TIMESTAMP_FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm:ss");

    private final UserSessionRegistry userSessionRegistry;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(UserSessionRegistry userSessionRegistry,
                                  SimpMessagingTemplate messagingTemplate) {
        this.userSessionRegistry = userSessionRegistry;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String username = userSessionRegistry.removeUser(sessionId);

        if (username == null) {
            return; // Nothing to do if no username found
        }

        // Check if the user is still online (another active session exists)
        boolean isUserStillOnline = userSessionRegistry.isUsernameTaken(username);

        // Broadcast updated user list
        Set<String> users = userSessionRegistry.getAllUsers();
        messagingTemplate.convertAndSend("/topic/userList", users);

        // If user is completely offline, broadcast a leave message
        if (!isUserStillOnline) {
            LocalDateTime now = LocalDateTime.now();

            Message systemMessage = new Message();
            systemMessage.setSender(SYSTEM_SENDER);
            systemMessage.setContent(username + " has left the chat");
            systemMessage.setTimestamp(now);
            systemMessage.setFormattedTimestamp(now.format(TIMESTAMP_FORMATTER));

            messagingTemplate.convertAndSend("/topic/messages", systemMessage);
        }
    }
}
