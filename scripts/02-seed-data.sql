-- Seed data for Student Dropout Prevention System
-- This script populates the database with sample data for testing

-- Insert sample schools
INSERT INTO schools (name, address, district, state, contact_phone, contact_email) VALUES
('सरकारी उच्च माध्यमिक विद्यालय, रामपुर', 'रामपुर गांव, तहसील - सदर', 'बरेली', 'उत्तर प्रदेश', '+91-9876543210', 'rampur.school@gov.in'),
('राजकीय माध्यमिक विद्यालय, सुंदरनगर', 'सुंदरनगर, ब्लॉक - देवरिया', 'देवरिया', 'उत्तर प्रदेश', '+91-9876543211', 'sundarnagar.school@gov.in'),
('सरकारी हाई स्कूल, गोकुलपुर', 'गोकुलपुर गांव, जिला - गोरखपुर', 'गोरखपुर', 'उत्तर प्रदेश', '+91-9876543212', 'gokulpur.school@gov.in');

-- Insert sample users (mentors, admins)
INSERT INTO users (email, password_hash, user_type, full_name, phone) VALUES
('admin@edusupport.gov.in', '$2b$10$example_hash_1', 'admin', 'डॉ. राजेश कुमार', '+91-9876543200'),
('priya.singh@edusupport.gov.in', '$2b$10$example_hash_2', 'mentor', 'प्रिया सिंह', '+91-9876543201'),
('amit.gupta@edusupport.gov.in', '$2b$10$example_hash_3', 'mentor', 'अमित गुप्ता', '+91-9876543202'),
('rita.sharma@edusupport.gov.in', '$2b$10$example_hash_4', 'mentor', 'रीता शर्मा', '+91-9876543203'),
('vikas.kumar@edusupport.gov.in', '$2b$10$example_hash_5', 'mentor', 'विकास कुमार', '+91-9876543204');

-- Insert mentors
INSERT INTO mentors (user_id, employee_id, specialization, experience_years, max_students) VALUES
(2, 'MEN001', 'शैक्षणिक परामर्श', 5, 50),
(3, 'MEN002', 'मनोवैज्ञानिक सहायता', 8, 40),
(4, 'MEN003', 'करियर मार्गदर्शन', 6, 45),
(5, 'MEN004', 'पारिवारिक परामर्श', 4, 35);

-- Insert sample student users
INSERT INTO users (email, password_hash, user_type, full_name, phone) VALUES
('rahul.sharma.stu001@student.gov.in', '$2b$10$example_hash_6', 'student', 'राहुल शर्मा', '+91-9876543210'),
('sunita.kumari.stu002@student.gov.in', '$2b$10$example_hash_7', 'student', 'सुनीता कुमारी', '+91-9876543211'),
('arjun.patel.stu003@student.gov.in', '$2b$10$example_hash_8', 'student', 'अर्जुन पटेल', '+91-9876543212'),
('pooja.yadav.stu004@student.gov.in', '$2b$10$example_hash_9', 'student', 'पूजा यादव', '+91-9876543213'),
('ravi.singh.stu005@student.gov.in', '$2b$10$example_hash_10', 'student', 'रवि सिंह', '+91-9876543214');

-- Insert sample students
INSERT INTO students (
    user_id, student_id, school_id, mentor_id, class_level, section,
    date_of_birth, gender, parent_name, parent_phone, parent_email,
    parent_education, family_income, address, district, state, location_type,
    enrollment_date, current_attendance, current_performance, risk_level, dropout_probability
) VALUES
(6, 'STU001', 1, 1, 10, 'A', '2008-05-15', 'male', 'श्याम शर्मा', '+91-9876543220', 'shyam.sharma@gmail.com', 'secondary', 'low', 'रामपुर गांव, घर नं. 123', 'बरेली', 'उत्तर प्रदेश', 'rural', '2023-04-01', 78.50, 72.30, 'medium', 45.20),

(7, 'STU002', 2, 2, 9, 'B', '2009-08-22', 'female', 'राम कुमार', '+91-9876543221', 'ram.kumar@gmail.com', 'primary', 'low', 'सुंदरनगर, मकान नं. 45', 'देवरिया', 'उत्तर प्रदेश', 'rural', '2023-04-01', 45.20, 38.70, 'high', 78.90),

(8, 'STU003', 3, 3, 11, 'A', '2007-12-10', 'male', 'मोहन पटेल', '+91-9876543222', 'mohan.patel@gmail.com', 'higher', 'medium', 'गोकुलपुर, वार्ड नं. 5', 'गोरखपुर', 'उत्तर प्रदेश', 'semi-urban', '2023-04-01', 92.10, 88.40, 'low', 12.30),

(9, 'STU004', 1, 4, 8, 'C', '2010-03-18', 'female', 'सुरेश यादव', '+91-9876543223', 'suresh.yadav@gmail.com', 'secondary', 'medium', 'रामपुर गांव, गली नं. 7', 'बरेली', 'उत्तर प्रदेश', 'rural', '2023-04-01', 65.80, 58.20, 'medium', 38.50),

(10, 'STU005', 2, 1, 12, 'A', '2006-11-25', 'male', 'गोपाल सिंह', '+91-9876543224', 'gopal.singh@gmail.com', 'primary', 'low', 'सुंदरनगर, मोहल्ला - पूर्वी', 'देवरिया', 'उत्तर प्रदेश', 'rural', '2023-04-01', 82.30, 75.60, 'medium', 32.10);

-- Insert sample attendance records (last 30 days)
INSERT INTO attendance (student_id, date, status, recorded_by) VALUES
-- Student 1 (Rahul) - Mixed attendance
(1, CURRENT_DATE - INTERVAL '1 day', 'present', 2),
(1, CURRENT_DATE - INTERVAL '2 days', 'absent', 2),
(1, CURRENT_DATE - INTERVAL '3 days', 'present', 2),
(1, CURRENT_DATE - INTERVAL '4 days', 'present', 2),
(1, CURRENT_DATE - INTERVAL '5 days', 'absent', 2),

-- Student 2 (Sunita) - Poor attendance
(2, CURRENT_DATE - INTERVAL '1 day', 'absent', 3),
(2, CURRENT_DATE - INTERVAL '2 days', 'absent', 3),
(2, CURRENT_DATE - INTERVAL '3 days', 'present', 3),
(2, CURRENT_DATE - INTERVAL '4 days', 'absent', 3),
(2, CURRENT_DATE - INTERVAL '5 days', 'absent', 3),

-- Student 3 (Arjun) - Good attendance
(3, CURRENT_DATE - INTERVAL '1 day', 'present', 4),
(3, CURRENT_DATE - INTERVAL '2 days', 'present', 4),
(3, CURRENT_DATE - INTERVAL '3 days', 'present', 4),
(3, CURRENT_DATE - INTERVAL '4 days', 'present', 4),
(3, CURRENT_DATE - INTERVAL '5 days', 'present', 4);

-- Insert sample academic performance
INSERT INTO academic_performance (student_id, subject, assessment_type, marks_obtained, total_marks, percentage, grade, assessment_date, academic_year) VALUES
-- Student 1 (Rahul)
(1, 'गणित', 'exam', 78, 100, 78.00, 'B+', '2024-01-15', '2023-24'),
(1, 'विज्ञान', 'exam', 85, 100, 85.00, 'A-', '2024-01-15', '2023-24'),
(1, 'हिंदी', 'exam', 72, 100, 72.00, 'B', '2024-01-15', '2023-24'),
(1, 'अंग्रेजी', 'exam', 68, 100, 68.00, 'C+', '2024-01-15', '2023-24'),

-- Student 2 (Sunita) - Lower performance
(2, 'गणित', 'exam', 35, 100, 35.00, 'F', '2024-01-15', '2023-24'),
(2, 'विज्ञान', 'exam', 42, 100, 42.00, 'D', '2024-01-15', '2023-24'),
(2, 'हिंदी', 'exam', 38, 100, 38.00, 'F', '2024-01-15', '2023-24'),

-- Student 3 (Arjun) - High performance
(3, 'गणित', 'exam', 92, 100, 92.00, 'A+', '2024-01-15', '2023-24'),
(3, 'विज्ञान', 'exam', 88, 100, 88.00, 'A', '2024-01-15', '2023-24'),
(3, 'अंग्रेजी', 'exam', 85, 100, 85.00, 'A-', '2024-01-15', '2023-24');

-- Insert sample student issues
INSERT INTO student_issues (student_id, issue_type, description, severity, status, reported_by, assigned_to) VALUES
(1, 'पारिवारिक दबाव', 'परिवार चाहता है कि वह खेती में मदद करे और पढ़ाई छोड़ दे', 'high', 'pending', 6, 1),
(2, 'आर्थिक समस्या', 'घर की आर्थिक स्थिति खराब होने से स्कूल आने में कठिनाई', 'critical', 'in_progress', 7, 2),
(2, 'पढ़ाई में कठिनाई', 'गणित और विज्ञान के विषयों में बहुत कमजोर है', 'medium', 'pending', 7, 2),
(4, 'अन्य', 'स्कूल में दोस्त नहीं बन रहे, अकेलापन महसूस करती है', 'medium', 'pending', 9, 4);

-- Insert sample risk factors
INSERT INTO risk_factors (student_id, factor_type, factor_description, impact_score, severity, identified_date) VALUES
(1, 'family', 'पारिवारिक दबाव - खेती में मदद करने का दबाव', 25, 'high', CURRENT_DATE - INTERVAL '10 days'),
(1, 'attendance', 'अनियमित उपस्थिति - 78% उपस्थिति', 15, 'medium', CURRENT_DATE - INTERVAL '5 days'),

(2, 'financial', 'गंभीर आर्थिक समस्या - परिवार की कम आय', 30, 'high', CURRENT_DATE - INTERVAL '15 days'),
(2, 'performance', 'बहुत कम शैक्षणिक प्रदर्शन - 38% औसत', 30, 'high', CURRENT_DATE - INTERVAL '20 days'),
(2, 'attendance', 'बहुत कम उपस्थिति - 45% उपस्थिति', 25, 'high', CURRENT_DATE - INTERVAL '7 days'),

(4, 'social', 'सामाजिक अलगाव - दोस्त नहीं बन रहे', 15, 'medium', CURRENT_DATE - INTERVAL '12 days');

-- Insert sample interventions
INSERT INTO interventions (student_id, intervention_type, description, start_date, status, assigned_mentor, created_by) VALUES
(1, 'मेंटरिंग', 'साप्ताहिक व्यक्तिगत परामर्श सत्र', CURRENT_DATE - INTERVAL '5 days', 'active', 1, 2),
(1, 'पारिवारिक परामर्श', 'अभिभावकों के साथ बैठक और समझाइश', CURRENT_DATE - INTERVAL '3 days', 'active', 1, 2),

(2, 'आर्थिक सहायता', 'छात्रवृत्ति और मुफ्त भोजन की व्यवस्था', CURRENT_DATE - INTERVAL '10 days', 'active', 2, 3),
(2, 'अकादमिक सहायता', 'गणित और विज्ञान के लिए अतिरिक्त ट्यूशन', CURRENT_DATE - INTERVAL '7 days', 'active', 2, 3),

(4, 'सामाजिक एकीकरण', 'समूहिक गतिविधियों में भागीदारी', CURRENT_DATE - INTERVAL '8 days', 'active', 4, 5);

-- Insert sample AI predictions
INSERT INTO ai_predictions (student_id, prediction_type, prediction_value, confidence_score, model_version, prediction_date) VALUES
(1, 'dropout_risk', 45.20, 87.50, 'v1.2', CURRENT_DATE),
(2, 'dropout_risk', 78.90, 92.30, 'v1.2', CURRENT_DATE),
(3, 'dropout_risk', 12.30, 89.10, 'v1.2', CURRENT_DATE),
(4, 'dropout_risk', 38.50, 85.70, 'v1.2', CURRENT_DATE),
(5, 'dropout_risk', 32.10, 88.20, 'v1.2', CURRENT_DATE);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES
('email_notifications_enabled', 'true', 'Enable/disable email notifications system', 1),
('monthly_report_day', '1', 'Day of month to send monthly reports', 1),
('high_risk_threshold', '70', 'Dropout probability threshold for high risk classification', 1),
('medium_risk_threshold', '40', 'Dropout probability threshold for medium risk classification', 1),
('attendance_warning_threshold', '75', 'Attendance percentage below which warnings are sent', 1),
('performance_warning_threshold', '60', 'Performance percentage below which warnings are sent', 1);
