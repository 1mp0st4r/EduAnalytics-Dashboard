-- MySQL Database Schema for EduAnalytics Dashboard
-- This script creates the complete database schema for the student analytics system

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS StudentAnalyticsDB;
USE StudentAnalyticsDB;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS AI_Predictions;
DROP TABLE IF EXISTS Student_Status_Records;
DROP TABLE IF EXISTS Attendance;
DROP TABLE IF EXISTS Academic_Records;
DROP TABLE IF EXISTS Educational_History;
DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS Mentors;
DROP TABLE IF EXISTS Schools;
DROP TABLE IF EXISTS Users;

-- Users table for authentication
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'admin', 'mentor', 'parent') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Schools table
CREATE TABLE Schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    district VARCHAR(100),
    state VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentors table
CREATE TABLE Mentors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    specialization VARCHAR(100),
    experience_years INT,
    max_students INT DEFAULT 50,
    current_students INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main Students table with comprehensive information
CREATE TABLE Students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    StudentID VARCHAR(50) UNIQUE NOT NULL,
    school_id INT REFERENCES Schools(id),
    mentor_id INT REFERENCES Mentors(id),
    
    -- Basic Information
    StudentName VARCHAR(255) NOT NULL,
    Gender ENUM('Male', 'Female', 'Other') NOT NULL,
    Age INT NOT NULL,
    StudentClass INT NOT NULL,
    
    -- Family Information
    MotherName VARCHAR(255),
    FatherName VARCHAR(255),
    ContactPhoneNumber VARCHAR(20),
    
    -- Academic Information
    AdmissionQuota ENUM('General', 'OBC', 'SC', 'ST', 'EWS', 'Other') NOT NULL,
    AccommodationType ENUM('Hostel', 'DayScholar', 'Rented') NOT NULL,
    IsRural BOOLEAN NOT NULL DEFAULT FALSE,
    NumberOfSiblings INT DEFAULT 0,
    
    -- Education Background
    MotherEducation ENUM('No Formal Education', 'Primary (Up to 5th)', 'Middle (Up to 8th)', 'High School (10th)', 'Senior Secondary (12th)', 'Graduate', 'Post Graduate', 'Doctorate') NOT NULL,
    FatherEducation ENUM('No Formal Education', 'Primary (Up to 5th)', 'Middle (Up to 8th)', 'High School (10th)', 'Senior Secondary (12th)', 'Graduate', 'Post Graduate', 'Doctorate') NOT NULL,
    IsFatherLiterate BOOLEAN NOT NULL DEFAULT FALSE,
    IsMotherLiterate BOOLEAN NOT NULL DEFAULT FALSE,
    IsFirstGenerationLearner BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Economic Information
    CommuteTimeMinutes INT DEFAULT 0,
    FamilyAnnualIncome DECIMAL(12,2) NOT NULL,
    FamilyEconomicStatus VARCHAR(50),
    
    -- Technology Access
    HasReliableInternet BOOLEAN NOT NULL DEFAULT FALSE,
    HasOwnLaptop BOOLEAN NOT NULL DEFAULT FALSE,
    IsPreparingCompetitiveExam BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Academic Performance
    AvgPastPerformance DECIMAL(5,2) DEFAULT 0.00,
    MediumChanged BOOLEAN NOT NULL DEFAULT FALSE,
    AvgMarks_LatestTerm DECIMAL(5,2) DEFAULT 0.00,
    AvgMarks_PreviousTerm DECIMAL(5,2) DEFAULT 0.00,
    MarksTrend DECIMAL(5,2) DEFAULT 0.00,
    FailureRate_LatestTerm DECIMAL(5,2) DEFAULT 0.00,
    AvgAttendance_LatestTerm DECIMAL(5,2) DEFAULT 0.00,
    WorksPartTime BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Risk Assessment
    IsDropout BOOLEAN NOT NULL DEFAULT FALSE,
    RiskScore INT DEFAULT 0,
    RiskLevel ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Low',
    DropoutProbability DECIMAL(5,2) DEFAULT 0.00,
    LastRiskAssessment TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Educational History table
CREATE TABLE Educational_History (
    HistoryID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(50) NOT NULL,
    Qualification VARCHAR(100) NOT NULL,
    MediumOfInstruction VARCHAR(50),
    MarksPercentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- Academic Records table
CREATE TABLE Academic_Records (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(50) NOT NULL,
    Term INT NOT NULL,
    SubjectName VARCHAR(100) NOT NULL,
    MarksObtained DECIMAL(5,2),
    MaxMarks DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE Attendance (
    AttendanceID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(50) NOT NULL,
    Term INT NOT NULL,
    SubjectName VARCHAR(100) NOT NULL,
    AttendancePercentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- Student Status Records table
CREATE TABLE Student_Status_Records (
    StatusID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(50) NOT NULL,
    IsDropout BOOLEAN NOT NULL DEFAULT FALSE,
    StatusDate DATE NOT NULL,
    Reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- AI Predictions table
CREATE TABLE AI_Predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(50) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    prediction_value DECIMAL(5,2),
    confidence_score DECIMAL(5,2),
    model_version VARCHAR(20),
    input_features JSON,
    prediction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_students_mentor_id ON Students(mentor_id);
CREATE INDEX idx_students_school_id ON Students(school_id);
CREATE INDEX idx_students_risk_level ON Students(RiskLevel);
CREATE INDEX idx_students_dropout ON Students(IsDropout);
CREATE INDEX idx_attendance_student ON Attendance(StudentID);
CREATE INDEX idx_academic_records_student ON Academic_Records(StudentID);
CREATE INDEX idx_ai_predictions_student ON AI_Predictions(StudentID);
CREATE INDEX idx_students_student_id ON Students(StudentID);

-- Insert sample school data
INSERT INTO Schools (name, address, district, state, contact_phone, contact_email) VALUES
('Government Higher Secondary School, Jaipur', 'Jaipur, Rajasthan', 'Jaipur', 'Rajasthan', '+91-9876543210', 'ghss.jaipur@rajasthan.gov.in'),
('Rajasthan Public School, Udaipur', 'Udaipur, Rajasthan', 'Udaipur', 'Rajasthan', '+91-9876543211', 'rps.udaipur@rajasthan.gov.in'),
('Kendriya Vidyalaya, Jodhpur', 'Jodhpur, Rajasthan', 'Jodhpur', 'Rajasthan', '+91-9876543212', 'kv.jodhpur@kvs.gov.in');

-- Insert sample admin user
INSERT INTO Users (email, password_hash, user_type, full_name, phone) VALUES
('admin@eduanalytics.gov.in', '$2b$10$example_hash_admin', 'admin', 'System Administrator', '+91-9876543200');

-- Insert sample mentor users and mentors
INSERT INTO Users (email, password_hash, user_type, full_name, phone) VALUES
('rajesh.kumar@eduanalytics.gov.in', '$2b$10$example_hash_1', 'mentor', 'Rajesh Kumar', '+91-9876543210'),
('sunita.sharma@eduanalytics.gov.in', '$2b$10$example_hash_2', 'mentor', 'Sunita Sharma', '+91-9876543211'),
('amit.singh@eduanalytics.gov.in', '$2b$10$example_hash_3', 'mentor', 'Amit Singh', '+91-9876543212'),
('pooja.verma@eduanalytics.gov.in', '$2b$10$example_hash_4', 'mentor', 'Pooja Verma', '+91-9876543213'),
('vijay.gupta@eduanalytics.gov.in', '$2b$10$example_hash_5', 'mentor', 'Vijay Gupta', '+91-9876543214');

INSERT INTO Mentors (user_id, employee_id, full_name, phone, email, specialization, experience_years, max_students) VALUES
(2, 'MEN001', 'Rajesh Kumar', '+91-9876543210', 'rajesh.kumar@eduanalytics.gov.in', 'Academic Counseling', 5, 50),
(3, 'MEN002', 'Sunita Sharma', '+91-9876543211', 'sunita.sharma@eduanalytics.gov.in', 'Psychological Support', 8, 40),
(4, 'MEN003', 'Amit Singh', '+91-9876543212', 'amit.singh@eduanalytics.gov.in', 'Career Guidance', 6, 45),
(5, 'MEN004', 'Pooja Verma', '+91-9876543213', 'pooja.verma@eduanalytics.gov.in', 'Family Counseling', 4, 35),
(6, 'MEN005', 'Vijay Gupta', '+91-9876543214', 'vijay.gupta@eduanalytics.gov.in', 'Academic Support', 7, 50);

COMMIT;

