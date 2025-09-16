-- Table for temporary shared accesses
CREATE TABLE shared_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL, -- The patient/user who shares access
  recipient_name VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(50) NOT NULL, -- e.g. 'aseguradora', 'medico'
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Add indexes as needed for performance
