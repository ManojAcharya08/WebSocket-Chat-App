package com.example.websocketdemo.session;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserSessionRegistry {

    // sessionId → username mapping
    private final ConcurrentHashMap<String, String> sessionIdToUsername = new ConcurrentHashMap<>();

    /**
     * Registers a user by associating their sessionId with a username.
     * Throws IllegalArgumentException if the username is already taken (case-insensitive).
     */
    public synchronized void registerUser(String sessionId, String username) {
        if (isUsernameTaken(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken");
        }
        sessionIdToUsername.put(sessionId, username);
    }

    /**
     * Removes a user based on sessionId.
     * @return the username that was removed, or null if none.
     */
    public String removeUser(String sessionId) {
        return sessionIdToUsername.remove(sessionId);
    }

    /**
     * Returns an immutable set of all active usernames.
     */
    public Set<String> getAllUsers() {
        return Collections.unmodifiableSet(new HashSet<>(sessionIdToUsername.values()));
    }

    /**
     * Gets the username associated with a given sessionId.
     */
    public String getUsernameForSession(String sessionId) {
        return sessionIdToUsername.get(sessionId);
    }

    /**
     * Checks if a username is already taken (case-insensitive).
     */
    public boolean isUsernameTaken(String username) {
        if (username == null) return false;
        return sessionIdToUsername.values().stream()
                .anyMatch(existing -> existing.equalsIgnoreCase(username));
    }

    /**
     * Finds the registered username that matches the input (case-insensitive).
     * Returns the actual registered username, or null if not found.
     */
    public String findExistingUsername(String inputUsername) {
        if (inputUsername == null) return null;
        return sessionIdToUsername.values().stream()
                .filter(existing -> existing.equalsIgnoreCase(inputUsername))
                .findFirst()
                .orElse(null);
    }

	public String getSessionIdForUsername(String username) {
    if (username == null) return null;
    return sessionIdToUsername.entrySet().stream()
            .filter(entry -> entry.getValue().equalsIgnoreCase(username))
            .map(entry -> entry.getKey())
            .findFirst()
            .orElse(null);
}
}
