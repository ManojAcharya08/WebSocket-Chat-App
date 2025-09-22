-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS websocket_chat_db;

-- Use the database
USE websocket_chat_db;

-- Create message table
CREATE TABLE IF NOT EXISTS message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(100) NOT NULL,
    receiver VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: index on sender and receiver for faster queries
CREATE INDEX idx_sender ON message(sender);
CREATE INDEX idx_receiver ON message(receiver);
