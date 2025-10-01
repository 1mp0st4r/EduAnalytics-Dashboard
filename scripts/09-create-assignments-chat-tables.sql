-- Create assignments table for student-mentor assignments
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES "Students"(id) ON DELETE CASCADE,
    mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, mentor_id)
);

-- Create chat_messages table for AI chatbot conversations
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    is_user BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_mentor_id ON assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_by ON assignments(assigned_by);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Add comments
COMMENT ON TABLE assignments IS 'Stores student-mentor assignments made by administrators';
COMMENT ON TABLE chat_messages IS 'Stores AI chatbot conversation history for students';
COMMENT ON COLUMN assignments.student_id IS 'Reference to the assigned student';
COMMENT ON COLUMN assignments.mentor_id IS 'Reference to the assigned mentor';
COMMENT ON COLUMN assignments.assigned_by IS 'Admin user who made the assignment';
COMMENT ON COLUMN chat_messages.conversation_id IS 'Unique identifier for a conversation thread';
COMMENT ON COLUMN chat_messages.is_user IS 'True if message is from user, false if from AI';
