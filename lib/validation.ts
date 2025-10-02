/**
 * Input Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateStudentData(data: any): ValidationResult {
  const errors: string[] = []
  
  if (!data.StudentName || typeof data.StudentName !== 'string') {
    errors.push('Student name is required and must be a string')
  }
  
  if (!data.StudentClass || typeof data.StudentClass !== 'number') {
    errors.push('Student class is required and must be a number')
  }
  
  if (data.StudentClass < 1 || data.StudentClass > 12) {
    errors.push('Student class must be between 1 and 12')
  }
  
  if (data.ContactEmail && !validateEmail(data.ContactEmail)) {
    errors.push('Contact email must be a valid email address')
  }
  
  if (data.AvgAttendance_LatestTerm !== undefined) {
    const attendance = parseFloat(data.AvgAttendance_LatestTerm)
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      errors.push('Attendance must be a number between 0 and 100')
    }
  }
  
  if (data.AvgMarks_LatestTerm !== undefined) {
    const marks = parseFloat(data.AvgMarks_LatestTerm)
    if (isNaN(marks) || marks < 0 || marks > 100) {
      errors.push('Marks must be a number between 0 and 100')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePagination(limit?: string, offset?: string): ValidationResult {
  const errors: string[] = []
  
  if (limit !== undefined) {
    const limitNum = parseInt(limit)
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 10000) {
      errors.push('Limit must be a number between 1 and 10000')
    }
  }
  
  if (offset !== undefined) {
    const offsetNum = parseInt(offset)
    if (isNaN(offsetNum) || offsetNum < 0) {
      errors.push('Offset must be a non-negative number')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim()
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}