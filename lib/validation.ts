// Data validation utilities for API endpoints
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ValidationError extends Error {
  public errors: string[]
  
  constructor(errors: string[]) {
    super(errors.join(', '))
    this.name = 'ValidationError'
    this.errors = errors
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation (basic)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Student validation
export function validateStudentData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.studentId || typeof data.studentId !== 'string' || data.studentId.trim().length === 0) {
    errors.push('Student ID is required')
  }
  
  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim().length === 0) {
    errors.push('Full name is required')
  }
  
  if (!data.classLevel || typeof data.classLevel !== 'number') {
    errors.push('Class level is required and must be a number')
  } else if (data.classLevel < 1 || data.classLevel > 12) {
    errors.push('Class level must be between 1 and 12')
  }
  
  // Optional field validations
  if (data.email && !validateEmail(data.email)) {
    errors.push('Invalid email format')
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format')
  }
  
  if (data.gender && !['Male', 'Female', 'Other'].includes(data.gender)) {
    errors.push('Gender must be Male, Female, or Other')
  }
  
  if (data.attendance !== undefined) {
    if (typeof data.attendance !== 'number' || data.attendance < 0 || data.attendance > 100) {
      errors.push('Attendance must be a number between 0 and 100')
    }
  }
  
  if (data.performance !== undefined) {
    if (typeof data.performance !== 'number' || data.performance < 0 || data.performance > 100) {
      errors.push('Performance must be a number between 0 and 100')
    }
  }
  
  if (data.riskLevel && !['Low', 'Medium', 'High', 'Critical'].includes(data.riskLevel)) {
    errors.push('Risk level must be Low, Medium, High, or Critical')
  }
  
  if (data.riskScore !== undefined) {
    if (typeof data.riskScore !== 'number' || data.riskScore < 0 || data.riskScore > 100) {
      errors.push('Risk score must be a number between 0 and 100')
    }
  }
  
  if (data.dropoutProbability !== undefined) {
    if (typeof data.dropoutProbability !== 'number' || data.dropoutProbability < 0 || data.dropoutProbability > 100) {
      errors.push('Dropout probability must be a number between 0 and 100')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// User validation
export function validateUserData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push('Email is required')
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format')
  }
  
  if (!data.password || typeof data.password !== 'string' || data.password.length === 0) {
    errors.push('Password is required')
  } else {
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }
  }
  
  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim().length === 0) {
    errors.push('Full name is required')
  }
  
  if (!data.userType || typeof data.userType !== 'string' || data.userType.trim().length === 0) {
    errors.push('User type is required')
  } else if (!['student', 'admin', 'mentor', 'parent'].includes(data.userType)) {
    errors.push('User type must be student, admin, mentor, or parent')
  }
  
  // Optional field validations
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// School validation
export function validateSchoolData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('School name is required')
  }
  
  // Optional field validations
  if (data.contactEmail && !validateEmail(data.contactEmail)) {
    errors.push('Invalid contact email format')
  }
  
  if (data.contactPhone && !validatePhone(data.contactPhone)) {
    errors.push('Invalid contact phone format')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Mentor validation
export function validateMentorData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.userId || typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    errors.push('User ID is required')
  }
  
  if (!data.employeeId || typeof data.employeeId !== 'string' || data.employeeId.trim().length === 0) {
    errors.push('Employee ID is required')
  }
  
  // Optional field validations
  if (data.experienceYears !== undefined) {
    if (typeof data.experienceYears !== 'number' || data.experienceYears < 0 || data.experienceYears > 50) {
      errors.push('Experience years must be a number between 0 and 50')
    }
  }
  
  if (data.maxStudents !== undefined) {
    if (typeof data.maxStudents !== 'number' || data.maxStudents < 1 || data.maxStudents > 200) {
      errors.push('Max students must be a number between 1 and 200')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generic validation helper
export function validateRequired(data: any, requiredFields: string[]): ValidationResult {
  const errors: string[] = []
  
  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`${field} is required`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Sanitize string input
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// Sanitize object strings
export function sanitizeObject(obj: any): any {
  const sanitized = { ...obj }
  
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key])
    }
  })
  
  return sanitized
}

// Validate pagination parameters
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

// Validate UUID format
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Validate integer ID
export function validateIntegerId(id: string): boolean {
  const num = parseInt(id)
  return !isNaN(num) && num > 0 && num.toString() === id
}
