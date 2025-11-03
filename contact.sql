CREATE TABLE contact_form (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle VARCHAR(255),
    service VARCHAR(100) NOT NULL,
    preferred_date DATETIME,
    message TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bot_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    honeypot_value TEXT,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);