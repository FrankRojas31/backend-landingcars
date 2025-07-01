-- Script para crear la base de datos MySQL para Landing Cars

CREATE DATABASE IF NOT EXISTS landing_cars 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE landing_cars;

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON contacts(email);
CREATE INDEX idx_created_at ON contacts(created_at);

DESCRIBE contacts;
