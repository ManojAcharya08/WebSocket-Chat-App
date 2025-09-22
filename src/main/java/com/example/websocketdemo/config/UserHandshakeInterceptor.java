package com.example.websocketdemo.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Intercepts WebSocket handshake requests and extracts the username from query parameters.
 */
public class UserHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        try {
            String query = request.getURI().getQuery();

            if (query != null) {
                String[] pairs = query.split("&");

                for (String pair : pairs) {
                    String[] keyValue = pair.split("=", 2); // limit=2 avoids IndexOutOfBounds
                    if (keyValue.length == 2 && keyValue[0].equals("username")) {
                        String username = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8).trim();

                        if (!username.isBlank()) {
                            attributes.put("username", username);
                            return true; // Found a valid username
                        }
                    }
                }
            }

            // If no username provided → assign a guest
            attributes.put("username", "Guest-" + System.currentTimeMillis());

        } catch (Exception e) {
            System.err.println("Error parsing WebSocket username: " + e.getMessage());
            // fallback to guest to avoid disconnection
            attributes.put("username", "Guest-" + System.currentTimeMillis());
        }

        return true; // allow the handshake
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // No post-handshake logic needed
    }
}
