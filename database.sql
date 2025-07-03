-- Script para crear la base de datos MySQL para Landing Cars
-- Versión profesional con sistema de autenticación y gestión de contactos

CREATE DATABASE IF NOT EXISTS landing_cars 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE landing_cars;

-- Tabla de usuarios para el sistema de autenticación
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'agent') DEFAULT 'agent',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de contactos mejorada con estado de atención
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('No Atendido', 'En Espera', 'Atendido', 'Enviado') DEFAULT 'No Atendido',
  assigned_to INT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  notes TEXT NULL,
  source VARCHAR(100) DEFAULT 'landing_page',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de mensajes/conversaciones con clientes
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  user_id INT NULL,
  message TEXT NOT NULL,
  message_type ENUM('incoming', 'outgoing', 'note') DEFAULT 'note',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de sesiones (opcional para gestión avanzada de sesiones)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para optimización
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX idx_contact_messages_contact_id ON contact_messages(contact_id);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Insertar usuario administrador por defecto
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@titanmotors.com', '$2b$10$rKvK1YjUQVZhF8q8T9.9I.8J5XZBfGk5H5.8J5XZBfGk5H5.8J5XZB', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Datos de ejemplo para testing (opcional)
INSERT INTO contacts (fullName, email, phone, message, status) VALUES
('Carlos Rodríguez', 'carlos@example.com', '5551234567', 'Interesado en Camioneta Mediana Pro', 'Atendido'),
('María González', 'maria@example.com', '5552345678', 'Quiero información sobre Camioneta Compacta Urban', 'En Espera'),
('Javier Martínez', 'javier@example.com', '5553456789', 'Necesito cotización para Camioneta Grande Heavy', 'Atendido'),
('Ana Fernández', 'ana@example.com', '5554567890', 'Consulta sobre financiamiento Camioneta Mediana Flex', 'No Atendido')
ON DUPLICATE KEY UPDATE fullName = fullName;

DESCRIBE users;
DESCRIBE contacts;
DESCRIBE contact_messages;
