-- ./database/dump.sql

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (name, email, password) VALUES
('Alice Dupont', 'alice@example.com', '$2b$12$saxIz.bRoDC3gDY89wZKausFqAUochd9AvpElPnZses5q5mVY6YW2'),
('Bob Martin', 'bob@example.com', '$2b$12$vW8KR/f.q3iYp68eSpLOU.0BtITEyHZFTi.le3aOLBW9L7FhJOmOS'),
('Charlie Dubois', 'charlie@example.com', '$2b$12$enwVUcBm5DZEQUAjcn07TuQmmNOsel5blXRKKlAfiAElhWEk2VJze');