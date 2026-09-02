CREATE DATABASE IF NOT EXISTS veterinary_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE veterinary_app;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'veterinarian', 'staff', 'admin') NOT NULL DEFAULT 'owner',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE clinics (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE veterinarians (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  license_number VARCHAR(100) NOT NULL UNIQUE,
  specialty VARCHAR(150),
  bio TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE clinic_veterinarians (
  clinic_id INT UNSIGNED NOT NULL,
  veterinarian_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (clinic_id, veterinarian_id),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  species ENUM('dog', 'cat', 'bird', 'rabbit', 'reptile', 'other') NOT NULL,
  breed VARCHAR(100),
  sex ENUM('male', 'female', 'unknown') NOT NULL DEFAULT 'unknown',
  date_of_birth DATE,
  color VARCHAR(100),
  microchip_number VARCHAR(100) UNIQUE,
  weight_kg DECIMAL(6,2),
  allergies TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_pets_owner (owner_id)
) ENGINE=InnoDB;

CREATE TABLE appointments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id INT UNSIGNED NOT NULL,
  clinic_id INT UNSIGNED NOT NULL,
  veterinarian_id INT UNSIGNED,
  appointment_type ENUM('checkup', 'vaccination', 'surgery', 'emergency', 'grooming', 'other') NOT NULL DEFAULT 'checkup',
  status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled',
  starts_at DATETIME NOT NULL,
  ends_at DATETIME,
  reason VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
  FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE SET NULL,
  INDEX idx_appointments_schedule (clinic_id, starts_at),
  INDEX idx_appointments_pet (pet_id, starts_at)
) ENGINE=InnoDB;

CREATE TABLE medical_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id INT UNSIGNED NOT NULL,
  appointment_id INT UNSIGNED UNIQUE,
  veterinarian_id INT UNSIGNED,
  record_type ENUM('exam', 'vaccination', 'diagnosis', 'surgery', 'lab_result', 'other') NOT NULL DEFAULT 'exam',
  visit_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  chief_complaint TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE SET NULL,
  INDEX idx_medical_records_pet (pet_id, visit_date)
) ENGINE=InnoDB;

CREATE TABLE vaccinations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id INT UNSIGNED NOT NULL,
  medical_record_id INT UNSIGNED,
  vaccine_name VARCHAR(150) NOT NULL,
  administered_on DATE NOT NULL,
  expires_on DATE,
  batch_number VARCHAR(100),
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE SET NULL,
  INDEX idx_vaccinations_pet (pet_id, expires_on)
) ENGINE=InnoDB;

CREATE TABLE medications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  UNIQUE KEY uq_medications_name (name)
) ENGINE=InnoDB;

CREATE TABLE prescriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id INT UNSIGNED NOT NULL,
  veterinarian_id INT UNSIGNED,
  medication_id INT UNSIGNED NOT NULL,
  medical_record_id INT UNSIGNED,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE SET NULL,
  FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE RESTRICT,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE SET NULL,
  INDEX idx_prescriptions_pet_status (pet_id, status)
) ENGINE=InnoDB;

CREATE TABLE invoices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id INT UNSIGNED NOT NULL,
  pet_id INT UNSIGNED NOT NULL,
  appointment_id INT UNSIGNED,
  status ENUM('draft', 'issued', 'paid', 'partially_paid', 'void') NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  due_date DATE,
  issued_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  INDEX idx_invoices_owner_status (owner_id, status)
) ENGINE=InnoDB;

CREATE TABLE invoice_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(8,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'bank_transfer', 'insurance', 'other') NOT NULL,
  transaction_reference VARCHAR(150),
  paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  INDEX idx_payments_invoice (invoice_id)
) ENGINE=InnoDB;
