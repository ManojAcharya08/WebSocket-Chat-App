package com.example.websocketdemo.config;

import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.http.server.ServerHttpRequest;

import java.security.Principal;
import java.util.Map;

/**
 * Custom handshake handler to assign a Principal (username) to each WebSocket connection.
 */
public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {

        // Get username from handshake attributes (set by UserHandshakeInterceptor)
        String username = (String) attributes.get("username");

        // If no username is provided, assign a random guest ID instead of rejecting
        if (username == null || username.isBlank()) {
            username = "Guest-" + System.currentTimeMillis();
        }

        return new StompPrincipal(username.trim());
    }
}
