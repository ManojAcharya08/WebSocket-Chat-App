package com.example.websocketdemo.config;

import java.security.Principal;

/**
 * Custom Principal used for identifying users in STOMP sessions.
 */
public class StompPrincipal implements Principal {
    private final String name;

    public StompPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }
}
