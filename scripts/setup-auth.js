const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8QabD3LcUHWE@ep-crimson-cloud-adl8of9h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

async function setupAuth() {
  try {
    console.log('🔧 Setting up authentication tables and demo users...')
    
    // 1. Create auth tables
    console.log('📋 Creating authentication tables...')
    
    // Add password reset tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `)
    
    // Add email verification table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP,
        UNIQUE(user_id)
      )
    `)
    
    // Add indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at)
    `)
    
    // Add columns to users table if they don't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'users' AND column_name = 'last_login') THEN
          ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
        END IF;
      END $$;
    `)
    
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'users' AND column_name = 'email_verified') THEN
          ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `)
    
    console.log('✅ Authentication tables created successfully!')
    
    // 2. Create demo users
    console.log('👥 Creating demo users...')
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123!', 12)
    const studentPassword = await bcrypt.hash('student123!', 12)
    
    // Check if demo users already exist
    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@eduanalytics.com'])
    const existingStudent = await pool.query('SELECT id FROM users WHERE email = $1', ['student@eduanalytics.com'])
    
    // Create admin user
    if (existingAdmin.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (email, password_hash, user_type, full_name, phone, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'admin@eduanalytics.com',
        adminPassword,
        'admin',
        'System Administrator',
        '+1-555-0001',
        true,
        true
      ])
      console.log('✅ Admin user created: admin@eduanalytics.com / admin123!')
    } else {
      console.log('ℹ️  Admin user already exists')
    }
    
    // Create student user
    if (existingStudent.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (email, password_hash, user_type, full_name, phone, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'student@eduanalytics.com',
        studentPassword,
        'student',
        'Demo Student',
        '+1-555-0002',
        true,
        true
      ])
      console.log('✅ Student user created: student@eduanalytics.com / student123!')
    } else {
      console.log('ℹ️  Student user already exists')
    }
    
    // 3. Create a mentor user for testing
    const mentorPassword = await bcrypt.hash('mentor123!', 12)
    const existingMentor = await pool.query('SELECT id FROM users WHERE email = $1', ['mentor@eduanalytics.com'])
    
    if (existingMentor.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (email, password_hash, user_type, full_name, phone, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'mentor@eduanalytics.com',
        mentorPassword,
        'mentor',
        'Demo Mentor',
        '+1-555-0003',
        true,
        true
      ])
      console.log('✅ Mentor user created: mentor@eduanalytics.com / mentor123!')
    } else {
      console.log('ℹ️  Mentor user already exists')
    }
    
    // 4. Clean up expired tokens
    await pool.query('DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP')
    await pool.query('DELETE FROM email_verification_tokens WHERE expires_at < CURRENT_TIMESTAMP')
    
    console.log('🧹 Cleaned up expired tokens')
    
    console.log('\n🎉 Authentication setup completed successfully!')
    console.log('\n📋 Demo Credentials:')
    console.log('   Admin:    admin@eduanalytics.com    / admin123!')
    console.log('   Student:  student@eduanalytics.com  / student123!')
    console.log('   Mentor:   mentor@eduanalytics.com   / mentor123!')
    console.log('\n🚀 You can now test the authentication system!')
    
  } catch (error) {
    console.error('❌ Error setting up authentication:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the setup
setupAuth()
