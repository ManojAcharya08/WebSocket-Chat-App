package com.example.websocketdemo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable in-memory broker for topics (broadcast) and queues (private)
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app"); // Prefix for client → server
        config.setUserDestinationPrefix("/user");         // Prefix for private messages
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setHandshakeHandler(new CustomHandshakeHandler())   // custom handshake
            .addInterceptors(new UserHandshakeInterceptor())     // track username/session
            .setAllowedOriginPatterns("*")                      // allow all origins
            .withSockJS();                                      // fallback for old browsers
    }
}
