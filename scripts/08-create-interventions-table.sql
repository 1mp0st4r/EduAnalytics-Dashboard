-- Create interventions table for mentor intervention tracking
-- This table stores intervention plans and their status

CREATE TABLE IF NOT EXISTS interventions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'academic_support', 
        'attendance_intervention', 
        'parent_meeting', 
        'counseling', 
        'peer_mentoring', 
        'other'
    )),
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    scheduled_date DATE NOT NULL,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_interventions_student_id ON interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_mentor_id ON interventions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_scheduled_date ON interventions(scheduled_date);

-- Add comment to table
COMMENT ON TABLE interventions IS 'Stores intervention plans created by mentors for their students';
COMMENT ON COLUMN interventions.type IS 'Type of intervention (academic_support, attendance_intervention, etc.)';
COMMENT ON COLUMN interventions.priority IS 'Priority level of the intervention (low, medium, high)';
COMMENT ON COLUMN interventions.status IS 'Current status of the intervention (pending, in_progress, completed, cancelled)';
COMMENT ON COLUMN interventions.scheduled_date IS 'When the intervention is scheduled to take place';
COMMENT ON COLUMN interventions.completed_date IS 'When the intervention was completed (if applicable)';
