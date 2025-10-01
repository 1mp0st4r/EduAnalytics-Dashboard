import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"
import { validateStudentData, validatePagination, sanitizeObject, ValidationError } from "../../../lib/validation"
import { withErrorHandler, handleValidationError, handleDatabaseError, ConflictError, NotFoundError } from "../../../lib/error-handler"
import { logger } from "../../../lib/logger"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get all students with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  const riskLevel = searchParams.get('riskLevel')
  const classLevel = searchParams.get('classLevel')
  const isDropout = searchParams.get('isDropout') === 'true'

  // Validate pagination parameters
  const paginationValidation = validatePagination(limit || undefined, offset || undefined)
  if (!paginationValidation.isValid) {
    throw handleValidationError(paginationValidation.errors)
  }

  const limitNum = limit ? parseInt(limit) : 100
  const offsetNum = offset ? parseInt(offset) : 0

  // Validate risk level if provided
  if (riskLevel && !['Low', 'Medium', 'High', 'Critical'].includes(riskLevel)) {
    throw handleValidationError(['Invalid risk level. Must be Low, Medium, High, or Critical'])
  }

  // Validate class level if provided
  if (classLevel) {
    const classLevelNum = parseInt(classLevel)
    if (isNaN(classLevelNum) || classLevelNum < 1 || classLevelNum > 12) {
      throw handleValidationError(['Invalid class level. Must be between 1 and 12'])
    }
  }

  try {
    const students = await neonService.getStudents({
      limit: limitNum,
      offset: offsetNum,
      riskLevel: riskLevel || undefined,
      classLevel: classLevel || undefined,
      isDropout: isDropout || undefined
    })

    logger.info(`Fetched ${students.length} students`, 'STUDENT', {
      limit: limitNum,
      offset: offsetNum,
      riskLevel,
      classLevel,
      isDropout
    })

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: students.length
      }
    })
  } catch (error) {
    throw handleDatabaseError(error, 'fetch students')
  }
})

// Add new student
export const POST = withErrorHandler(async (request: NextRequest) => {
  const rawStudentData = await request.json()
  
  // Sanitize input data
  const studentData = sanitizeObject(rawStudentData)
  
  // Validate student data
  const validation = validateStudentData(studentData)
  if (!validation.isValid) {
    throw handleValidationError(validation.errors)
  }

  try {
    // Check if student ID already exists
    const existingStudent = await neonService.getStudentById(studentData.studentId)
    if (existingStudent) {
      throw new ConflictError("Student with this ID already exists")
    }

    // Create student in database
    const newStudent = await neonService.createStudent({
      studentId: studentData.studentId,
      fullName: studentData.fullName,
      email: studentData.email,
      phone: studentData.phone,
      gender: studentData.gender,
      classLevel: studentData.classLevel || 10,
      schoolId: studentData.schoolId,
      mentorId: studentData.mentorId,
      parentName: studentData.parentName,
      parentPhone: studentData.parentPhone,
      parentEmail: studentData.parentEmail,
      address: studentData.address,
      district: studentData.district,
      state: studentData.state,
      attendance: studentData.attendance,
      performance: studentData.performance,
      riskLevel: studentData.riskLevel,
      riskScore: studentData.riskScore,
      dropoutProbability: studentData.dropoutProbability
    })

    if (!newStudent) {
      throw new Error('Failed to create student in database')
    }

    logger.studentAction('CREATE', studentData.studentId, {
      fullName: studentData.fullName,
      classLevel: studentData.classLevel,
      riskLevel: studentData.riskLevel
    })

    return NextResponse.json({
      success: true,
      data: newStudent,
      message: "Student added successfully"
    })
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error
    }
    throw handleDatabaseError(error, 'create student')
  }
})