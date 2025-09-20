-- CockroachDB (PostgreSQL-compatible) Schema for EduAnalytics Dashboard
-- This schema is compatible with CockroachDB Serverless

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'admin', 'mentor', 'parent')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    district VARCHAR(100),
    state VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentors table
CREATE TABLE IF NOT EXISTS mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    specialization VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    max_students INTEGER DEFAULT 50,
    current_students INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table (main table)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    school_id UUID REFERENCES schools(id),
    mentor_id UUID REFERENCES mentors(id),
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    class_level INTEGER,
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Academic Information
    current_attendance DECIMAL(5,2) DEFAULT 0,
    current_performance DECIMAL(5,2) DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    risk_score INTEGER DEFAULT 0,
    dropout_probability DECIMAL(5,2) DEFAULT 0,
    is_dropout BOOLEAN DEFAULT FALSE,
    
    -- Additional Fields (from CSV data)
    age INTEGER,
    accommodation_type VARCHAR(50),
    is_rural BOOLEAN DEFAULT FALSE,
    commute_time_minutes INTEGER DEFAULT 0,
    admission_quota VARCHAR(50),
    family_annual_income DECIMAL(12,2),
    number_of_siblings INTEGER DEFAULT 0,
    father_education VARCHAR(100),
    is_father_literate BOOLEAN DEFAULT FALSE,
    mother_education VARCHAR(100),
    is_mother_literate BOOLEAN DEFAULT FALSE,
    is_first_generation_learner BOOLEAN DEFAULT FALSE,
    avg_past_performance DECIMAL(5,2),
    medium_changed BOOLEAN DEFAULT FALSE,
    avg_marks_latest_term DECIMAL(5,2),
    avg_marks_previous_term DECIMAL(5,2),
    marks_trend DECIMAL(5,2),
    failure_rate_latest_term DECIMAL(5,2),
    avg_attendance_latest_term DECIMAL(5,2),
    works_part_time BOOLEAN DEFAULT FALSE,
    is_preparing_competitive_exam BOOLEAN DEFAULT FALSE,
    has_own_laptop BOOLEAN DEFAULT FALSE,
    has_reliable_internet BOOLEAN DEFAULT FALSE,
    
    -- System fields
    is_active BOOLEAN DEFAULT TRUE,
    last_risk_assessment TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Educational History table
CREATE TABLE IF NOT EXISTS educational_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    school_name VARCHAR(255),
    class_level INTEGER,
    academic_year VARCHAR(10),
    final_grade DECIMAL(5,2),
    attendance_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Records table
CREATE TABLE IF NOT EXISTS academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    term VARCHAR(20),
    academic_year VARCHAR(10),
    marks_obtained DECIMAL(5,2),
    max_marks DECIMAL(5,2),
    grade VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    subject VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Status Records table
CREATE TABLE IF NOT EXISTS student_status_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Issues table
CREATE TABLE IF NOT EXISTS student_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES mentors(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Risk Factors table
CREATE TABLE IF NOT EXISTS risk_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    factor_type VARCHAR(100) NOT NULL,
    factor_value TEXT,
    impact_score INTEGER DEFAULT 0,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interventions table
CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    intervention_type VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES mentors(id),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Completed', 'Cancelled')),
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('student', 'parent', 'mentor', 'admin')),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    student_id UUID REFERENCES students(id),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) NOT NULL,
    prediction_type VARCHAR(100) NOT NULL,
    prediction_value DECIMAL(10,4) NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    input_features JSONB,
    prediction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_risk_level ON students(risk_level);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_mentor_id ON students(mentor_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_student_id ON ai_predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);

-- Insert sample schools
INSERT INTO schools (name, district, state, contact_phone, contact_email) VALUES
('Rajasthan Government School', 'Jaipur', 'Rajasthan', '+91-141-1234567', 'contact@rajgovschool.edu.in'),
('Delhi Public School', 'New Delhi', 'Delhi', '+91-11-1234567', 'info@dpsdelhi.edu.in'),
('Kendriya Vidyalaya', 'Mumbai', 'Maharashtra', '+91-22-1234567', 'kv@kvs.edu.in')
ON CONFLICT DO NOTHING;

-- Insert sample mentors
INSERT INTO users (email, password_hash, user_type, full_name, phone) VALUES
('mentor1@school.edu', '$2a$10$example_hash_1', 'mentor', 'Dr. Priya Sharma', '+91-9876543210'),
('mentor2@school.edu', '$2a$10$example_hash_2', 'mentor', 'Prof. Amit Kumar', '+91-9876543211'),
('admin@school.edu', '$2a$10$example_hash_3', 'admin', 'Admin User', '+91-9876543212')
ON CONFLICT (email) DO NOTHING;

-- Get the mentor user IDs and insert into mentors table
INSERT INTO mentors (user_id, employee_id, specialization, experience_years, max_students)
SELECT u.id, 'MEN001', 'Academic Counseling', 5, 50
FROM users u WHERE u.email = 'mentor1@school.edu'
ON CONFLICT DO NOTHING;

INSERT INTO mentors (user_id, employee_id, specialization, experience_years, max_students)
SELECT u.id, 'MEN002', 'Psychological Support', 8, 40
FROM users u WHERE u.email = 'mentor2@school.edu'
ON CONFLICT DO NOTHING;

-- Insert sample students
INSERT INTO users (email, password_hash, user_type, full_name, phone) VALUES
('student1@school.edu', '$2a$10$example_hash_4', 'student', 'Rahul Sharma', '+91-9876543213'),
('student2@school.edu', '$2a$10$example_hash_5', 'student', 'Sunita Kumari', '+91-9876543214')
ON CONFLICT (email) DO NOTHING;

-- Get school and mentor IDs for sample students
INSERT INTO students (
    user_id, student_id, school_id, mentor_id, full_name, gender, class_level,
    current_attendance, current_performance, risk_level, risk_score, dropout_probability,
    phone, email
)
SELECT 
    u.id, 'RJ_2025', s.id, m.id, 'Rahul Sharma', 'Male', 10,
    78.5, 72.3, 'Medium', 58, 45.2,
    '+91-9876543213', 'student1@school.edu'
FROM users u, schools s, mentors m
WHERE u.email = 'student1@school.edu' 
  AND s.name = 'Rajasthan Government School'
  AND m.employee_id = 'MEN001'
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO students (
    user_id, student_id, school_id, mentor_id, full_name, gender, class_level,
    current_attendance, current_performance, risk_level, risk_score, dropout_probability,
    phone, email
)
SELECT 
    u.id, 'RJ_2026', s.id, m.id, 'Sunita Kumari', 'Female', 9,
    45.2, 38.7, 'High', 78, 78.9,
    '+91-9876543214', 'student2@school.edu'
FROM users u, schools s, mentors m
WHERE u.email = 'student2@school.edu' 
  AND s.name = 'Rajasthan Government School'
  AND m.employee_id = 'MEN002'
ON CONFLICT (student_id) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('risk_threshold_high', '70', 'Risk score threshold for high risk classification'),
('risk_threshold_medium', '40', 'Risk score threshold for medium risk classification'),
('attendance_threshold', '75', 'Minimum attendance percentage threshold'),
('performance_threshold', '60', 'Minimum performance percentage threshold'),
('email_notifications_enabled', 'true', 'Enable/disable email notifications'),
('ml_model_version', 'v1.0', 'Current ML model version')
ON CONFLICT (setting_key) DO NOTHING;
