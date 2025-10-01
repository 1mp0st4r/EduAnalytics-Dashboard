import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Create interventions table
export async function POST(request: NextRequest) {
  try {
    const pool = await neonService.getConnection()
    
    // First, check if table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'interventions'
      );
    `)
    
    if (checkTable.rows[0].exists) {
      await pool.end()
      return NextResponse.json({
        success: true,
        message: "Interventions table already exists"
      })
    }

    // Create the table
    await pool.query(`
      CREATE TABLE interventions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        scheduled_date DATE NOT NULL,
        completed_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create indexes
    await pool.query(`
      CREATE INDEX idx_interventions_student_id ON interventions(student_id);
      CREATE INDEX idx_interventions_mentor_id ON interventions(mentor_id);
      CREATE INDEX idx_interventions_status ON interventions(status);
    `)

    await pool.end()

    return NextResponse.json({
      success: true,
      message: "Interventions table created successfully"
    })

  } catch (error) {
    console.error("[API] Error creating interventions table:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
