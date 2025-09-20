CREATE DATABASE IF NOT EXISTS StudentAnalyticsDB;
USE StudentAnalyticsDB;


DROP TABLE IF EXISTS Educational_History;
DROP TABLE IF EXISTS Academic_Records;
DROP TABLE IF EXISTS Attendance;
DROP TABLE IF EXISTS Student_Status_Records;

DROP TABLE IF EXISTS Students;

-- 1. Students Table

CREATE TABLE Students (
    StudentID VARCHAR(20) PRIMARY KEY, 
    DateOfBirth DATE NOT NULL,  
    Gender ENUM('Male', 'Female', 'Other') NOT NULL,  
    AccommodationType ENUM('Hostel', 'DayScholar', 'Rented') NOT NULL,  
    IsRural BOOLEAN, 
    CommuteTimeMinutes INT, 
    CasteCategory ENUM('General', 'OBC', 'SC', 'ST', 'Other'), 
    AdmissionQuota ENUM('General', 'OBC', 'SC', 'ST', 'EWS', 'Other'),  
    FamilyAnnualIncome INT, 
    NumberOfSiblings INT, 
    FatherEducation ENUM('No Formal Education', 'Primary (Up to 5th)', 'Middle (Up to 8th)', 'High School (10th)', 'Senior Secondary (12th)', 'Graduate', 'Post Graduate', 'Doctorate'), 
    IsFatherLiterate BOOLEAN, 
    MotherEducation ENUM('No Formal Education', 'Primary (Up to 5th)', 'Middle (Up to 8th)', 'High School (10th)', 'Senior Secondary (12th)', 'Graduate', 'Post Graduate', 'Doctorate'), 
    IsMotherLiterate BOOLEAN, 
    IsFirstGenerationLearner BOOLEAN, 
    WorksPartTime BOOLEAN,  
    IsPreparingCompetitiveExam BOOLEAN, 
    HasOwnLaptop BOOLEAN, 
    HasReliableInternet BOOLEAN 
);

-- 2. Educational History Table

CREATE TABLE Educational_History (
    HistoryID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID VARCHAR(20) NOT NULL,
    Qualification VARCHAR(100), 
    MediumOfInstruction VARCHAR(50), 
    MarksPercentage DECIMAL(5, 2), 
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- 3. Academic_Records Table

CREATE TABLE Academic_Records (
    RecordID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID VARCHAR(20) NOT NULL,
    Term INT NOT NULL,
    SubjectName VARCHAR(100) NOT NULL,
    MarksObtained DECIMAL(5, 2),
    MaxMarks DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- 4. Attendance Table

CREATE TABLE Attendance (
    AttendanceID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID VARCHAR(20) NOT NULL,
    Term INT NOT NULL,
    SubjectName VARCHAR(100) NOT NULL,
    AttendancePercentage DECIMAL(5, 2) NOT NULL, 
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- 5. Student_Status_Records Table

CREATE TABLE Student_Status_Records (
    StatusID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID VARCHAR(20) NOT NULL,
    IsDropout BOOLEAN NOT NULL DEFAULT FALSE, 
    StatusDate DATE NOT NULL,
    Reason TEXT,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);
