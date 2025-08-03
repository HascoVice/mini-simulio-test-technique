-- ./database/dump.sql

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE simulations 
ADD COLUMN montant_finance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN salaire_minimum DECIMAL(12,2) DEFAULT 0,
ADD COLUMN interets_totaux DECIMAL(12,2) DEFAULT 0,
ADD COLUMN assurance_totale DECIMAL(12,2) DEFAULT 0,
ADD COLUMN frais_notaire DECIMAL(12,2) DEFAULT 0,
ADD COLUMN garantie_bancaire DECIMAL(12,2) DEFAULT 0,
ADD COLUMN frais_agence DECIMAL(12,2) DEFAULT 0,
ADD COLUMN travaux DECIMAL(12,2) DEFAULT 0,
ADD COLUMN apport DECIMAL(12,2) DEFAULT 0,
ADD COLUMN prix_bien DECIMAL(12,2) DEFAULT 0,
ADD COLUMN taux_assurance DECIMAL(5,2) DEFAULT 0,
ADD COLUMN frais_agence_pct DECIMAL(5,2) DEFAULT 0,
ADD COLUMN frais_notaire_pct DECIMAL(5,2) DEFAULT 0;

INSERT INTO users (name, email, password) VALUES
('Alice Dupont', 'alice@example.com', '$2b$12$saxIz.bRoDC3gDY89wZKausFqAUochd9AvpElPnZses5q5mVY6YW2'),
('Bob Martin', 'bob@example.com', '$2b$12$vW8KR/f.q3iYp68eSpLOU.0BtITEyHZFTi.le3aOLBW9L7FhJOmOS'),
('Charlie Dubois', 'charlie@example.com', '$2b$12$enwVUcBm5DZEQUAjcn07TuQmmNOsel5blXRKKlAfiAElhWEk2VJze');