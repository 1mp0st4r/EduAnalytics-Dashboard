#!/usr/bin/env node

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

// Configuration
const BACKUP_DIR = path.join(__dirname, '..', 'backups')
const MAX_BACKUPS = 7 // Keep last 7 backups
const COMPRESS_BACKUPS = true

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFileName = `eduanalytics-backup-${timestamp}.sql`
  const backupPath = path.join(BACKUP_DIR, backupFileName)
  
  console.log(`Creating backup: ${backupFileName}`)
  
  try {
    // Get database connection string
    const connectionString = process.env.DATABASE_URL || process.env.NEON_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or NEON_URL environment variable is required')
    }

    // Create pg_dump command
    const pgDumpCommand = `pg_dump "${connectionString}" --no-owner --no-privileges --clean --if-exists --create`
    
    // Execute backup
    const { stdout, stderr } = await execAsync(pgDumpCommand)
    
    if (stderr) {
      console.warn('pg_dump warnings:', stderr)
    }
    
    // Write backup to file
    fs.writeFileSync(backupPath, stdout)
    console.log(`Backup created successfully: ${backupPath}`)
    
    // Compress backup if enabled
    if (COMPRESS_BACKUPS) {
      const compressedPath = `${backupPath}.gz`
      await execAsync(`gzip "${backupPath}"`)
      console.log(`Backup compressed: ${compressedPath}`)
    }
    
    // Clean up old backups
    await cleanupOldBackups()
    
    console.log('Backup completed successfully')
    
  } catch (error) {
    console.error('Backup failed:', error.message)
    process.exit(1)
  }
}

async function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('eduanalytics-backup-'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        stats: fs.statSync(path.join(BACKUP_DIR, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime) // Sort by modification time, newest first
    
    // Remove old backups
    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS)
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path)
        console.log(`Removed old backup: ${file.name}`)
      }
    }
    
  } catch (error) {
    console.error('Error cleaning up old backups:', error.message)
  }
}

async function restoreBackup(backupFileName) {
  const backupPath = path.join(BACKUP_DIR, backupFileName)
  
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`)
    process.exit(1)
  }
  
  console.log(`Restoring backup: ${backupFileName}`)
  
  try {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or NEON_URL environment variable is required')
    }
    
    // Check if backup is compressed
    const isCompressed = backupPath.endsWith('.gz')
    const actualBackupPath = isCompressed ? backupPath.slice(0, -3) : backupPath
    
    if (isCompressed) {
      // Decompress backup
      await execAsync(`gunzip -c "${backupPath}" > "${actualBackupPath}"`)
    }
    
    // Restore backup
    const psqlCommand = `psql "${connectionString}" < "${actualBackupPath}"`
    const { stdout, stderr } = await execAsync(psqlCommand)
    
    if (stderr) {
      console.warn('psql warnings:', stderr)
    }
    
    console.log('Backup restored successfully')
    
    // Clean up temporary file if it was decompressed
    if (isCompressed && fs.existsSync(actualBackupPath)) {
      fs.unlinkSync(actualBackupPath)
    }
    
  } catch (error) {
    console.error('Restore failed:', error.message)
    process.exit(1)
  }
}

async function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('eduanalytics-backup-'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file))
        return {
          name: file,
          size: stats.size,
          created: stats.mtime
        }
      })
      .sort((a, b) => b.created - a.created)
    
    if (files.length === 0) {
      console.log('No backups found')
      return
    }
    
    console.log('Available backups:')
    console.log('==================')
    
    files.forEach((file, index) => {
      const sizeKB = Math.round(file.size / 1024)
      const created = file.created.toLocaleString()
      console.log(`${index + 1}. ${file.name}`)
      console.log(`   Size: ${sizeKB} KB`)
      console.log(`   Created: ${created}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error listing backups:', error.message)
  }
}

// CLI interface
async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'create':
      await createBackup()
      break
    case 'restore':
      const backupFileName = process.argv[3]
      if (!backupFileName) {
        console.error('Please specify backup file name')
        process.exit(1)
      }
      await restoreBackup(backupFileName)
      break
    case 'list':
      await listBackups()
      break
    default:
      console.log('Usage:')
      console.log('  node backup-database.js create     - Create a new backup')
      console.log('  node backup-database.js restore <file> - Restore from backup')
      console.log('  node backup-database.js list      - List available backups')
      process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups
}
