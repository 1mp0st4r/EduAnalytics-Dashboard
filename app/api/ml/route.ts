import { NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/database-service"

// ML Risk Assessment and Prediction API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, action } = body

    if (!studentId && action !== 'batch-assess') {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      )
    }

    // Get student data (skip for batch assessment)
    let student = null
    if (action !== 'batch-assess') {
      student = await dbService.getStudentById(studentId)
      if (!student) {
        return NextResponse.json(
          { success: false, error: "Student not found" },
          { status: 404 }
        )
      }
    }

    switch (action) {
      case 'assess-risk':
        // Try to use Python ML service first, fallback to JavaScript algorithm
        try {
          const pythonResult = await callPythonMLService(student)
          if (pythonResult.success) {
            // Update student record with Python ML results
            await dbService.updateStudentRisk(
              studentId, 
              pythonResult.data.risk_level, 
              pythonResult.data.risk_score, 
              pythonResult.data.dropout_probability * 100
            )

            // Create AI prediction record
            await dbService.createAIPrediction(
              studentId,
              'dropout_prediction',
              pythonResult.data.dropout_probability * 100,
              pythonResult.data.risk_score,
              pythonResult.data.model_version,
              pythonResult.data.feature_importance
            )

            return NextResponse.json({
              success: true,
              data: {
                studentId,
                riskScore: pythonResult.data.risk_score,
                riskLevel: pythonResult.data.risk_level,
                dropoutProbability: pythonResult.data.dropout_probability * 100,
                factors: getTopRiskFactors(pythonResult.data.feature_importance),
                recommendations: getRecommendations(pythonResult.data.risk_level, student),
                modelVersion: pythonResult.data.model_version,
                source: 'python_ml_service'
              }
            })
          }
        } catch (error) {
          console.log("Python ML service unavailable, using JavaScript fallback")
        }

        // Fallback to JavaScript algorithm
        const riskScore = calculateRiskScore(student)
        const riskLevel = getRiskLevel(riskScore)
        const dropoutProbability = calculateDropoutProbability(student, riskScore)

        // Update student record
        await dbService.updateStudentRisk(studentId, riskLevel, riskScore, dropoutProbability)

        // Create AI prediction record
        await dbService.createAIPrediction(
          studentId,
          'dropout_prediction',
          dropoutProbability,
          riskScore,
          'v1.0-js',
          {
            attendance: student.AvgAttendance_LatestTerm,
            performance: student.AvgMarks_LatestTerm,
            rural: student.IsRural,
            firstGeneration: student.IsFirstGenerationLearner,
            siblings: student.NumberOfSiblings,
            income: student.FamilyAnnualIncome
          }
        )

        return NextResponse.json({
          success: true,
          data: {
            studentId,
            riskScore,
            riskLevel,
            dropoutProbability,
            factors: getRiskFactors(student),
            recommendations: getRecommendations(riskLevel, student),
            modelVersion: 'v1.0-js',
            source: 'javascript_fallback'
          }
        })

      case 'batch-assess':
        // Assess all students
        const allStudents = await dbService.getStudents({ limit: 1000 })
        const results = []
        
        for (const s of allStudents) {
          const score = calculateRiskScore(s)
          const level = getRiskLevel(score)
          const probability = calculateDropoutProbability(s, score)
          
          await dbService.updateStudentRisk(s.StudentID, level, score, probability)
          
          results.push({
            studentId: s.StudentID,
            riskScore: score,
            riskLevel: level,
            dropoutProbability: probability
          })
        }

        return NextResponse.json({
          success: true,
          message: `Risk assessment completed for ${results.length} students`,
          data: results
        })

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("[API] Error in ML assessment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to perform risk assessment" },
      { status: 500 }
    )
  }
}

// Call Python ML service
async function callPythonMLService(student: any) {
  try {
    const response = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_data: {
          StudentID: student.StudentID,
          Gender: student.Gender || 'Male',
          AccommodationType: student.AccommodationType || 'DayScholar',
          IsRural: student.IsRural ? 'TRUE' : 'FALSE',
          CommuteTimeMinutes: student.CommuteTimeMinutes || 0,
          AdmissionQuota: student.AdmissionQuota || 'General',
          FamilyAnnualIncome: student.FamilyAnnualIncome || 0,
          NumberOfSiblings: student.NumberOfSiblings || 0,
          FatherEducation: student.FatherEducation || 'No Formal Education',
          IsFatherLiterate: student.IsFatherLiterate ? 'TRUE' : 'FALSE',
          MotherEducation: student.MotherEducation || 'No Formal Education',
          IsMotherLiterate: student.IsMotherLiterate ? 'TRUE' : 'FALSE',
          IsFirstGenerationLearner: student.IsFirstGenerationLearner ? 'TRUE' : 'FALSE',
          AvgPastPerformance: student.AvgPastPerformance || 0,
          MediumChanged: student.MediumChanged ? 'TRUE' : 'FALSE',
          AvgMarks_LatestTerm: student.AvgMarks_LatestTerm || 0,
          MarksTrend: student.MarksTrend || 0,
          FailureRate_LatestTerm: student.FailureRate_LatestTerm || 0,
          AvgAttendance_LatestTerm: student.AvgAttendance_LatestTerm || 0,
          WorksPartTime: student.WorksPartTime ? 'TRUE' : 'FALSE',
          IsPreparingCompetitiveExam: student.IsPreparingCompetitiveExam ? 'TRUE' : 'FALSE',
          HasOwnLaptop: student.HasOwnLaptop ? 'TRUE' : 'FALSE',
          HasReliableInternet: student.HasReliableInternet ? 'TRUE' : 'FALSE'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Python ML service error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Python ML service call failed:', error)
    return { success: false, error: error.message }
  }
}

// Get top risk factors from feature importance
function getTopRiskFactors(featureImportance: any): string[] {
  if (!featureImportance) return []
  
  const sortedFactors = Object.entries(featureImportance)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([factor, importance]) => factor)
  
  return sortedFactors
}

// ML-like risk calculation algorithm
function calculateRiskScore(student: any): number {
  let score = 0
  
  // Attendance factor (0-30 points)
  if (student.AvgAttendance_LatestTerm < 60) score += 30
  else if (student.AvgAttendance_LatestTerm < 70) score += 20
  else if (student.AvgAttendance_LatestTerm < 80) score += 10
  
  // Performance factor (0-25 points)
  if (student.AvgMarks_LatestTerm < 40) score += 25
  else if (student.AvgMarks_LatestTerm < 50) score += 20
  else if (student.AvgMarks_LatestTerm < 60) score += 15
  else if (student.AvgMarks_LatestTerm < 70) score += 10
  
  // Socioeconomic factors (0-20 points)
  if (student.IsRural) score += 5
  if (student.IsFirstGenerationLearner) score += 8
  if (student.NumberOfSiblings > 3) score += 4
  if (student.FamilyAnnualIncome < 50000) score += 8
  
  // Academic factors (0-15 points)
  if (student.MediumChanged) score += 5
  if (student.WorksPartTime) score += 7
  if (student.FailureRate_LatestTerm > 0.3) score += 10
  
  // Technology access (0-10 points)
  if (!student.HasOwnLaptop) score += 3
  if (!student.HasReliableInternet) score += 4
  
  return Math.min(score, 100) // Cap at 100
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

function calculateDropoutProbability(student: any, riskScore: number): number {
  // Base probability from risk score
  let probability = riskScore * 0.6
  
  // Additional factors
  if (student.IsDropout) probability += 20
  if (student.AvgAttendance_LatestTerm < 50) probability += 15
  if (student.AvgMarks_LatestTerm < 30) probability += 10
  
  return Math.min(probability, 95) // Cap at 95%
}

function getRiskFactors(student: any): string[] {
  const factors = []
  
  if (student.AvgAttendance_LatestTerm < 70) factors.push('Low Attendance')
  if (student.AvgMarks_LatestTerm < 50) factors.push('Poor Academic Performance')
  if (student.IsRural) factors.push('Rural Background')
  if (student.IsFirstGenerationLearner) factors.push('First Generation Learner')
  if (student.NumberOfSiblings > 3) factors.push('Large Family Size')
  if (student.FamilyAnnualIncome < 50000) factors.push('Low Family Income')
  if (student.WorksPartTime) factors.push('Part-time Work')
  if (!student.HasOwnLaptop) factors.push('Limited Technology Access')
  if (!student.HasReliableInternet) factors.push('Poor Internet Connectivity')
  
  return factors
}

function getRecommendations(riskLevel: string, student: any): string[] {
  const recommendations = []
  
  if (riskLevel === 'Critical' || riskLevel === 'High') {
    recommendations.push('Immediate intervention required')
    recommendations.push('Schedule one-on-one counseling session')
    recommendations.push('Assign dedicated mentor for close monitoring')
  }
  
  if (student.AvgAttendance_LatestTerm < 70) {
    recommendations.push('Implement attendance tracking system')
    recommendations.push('Contact parents about attendance issues')
  }
  
  if (student.AvgMarks_LatestTerm < 50) {
    recommendations.push('Provide additional academic support')
    recommendations.push('Arrange tutoring sessions')
  }
  
  if (student.IsRural) {
    recommendations.push('Consider transportation assistance')
    recommendations.push('Provide digital learning resources')
  }
  
  if (!student.HasOwnLaptop) {
    recommendations.push('Explore laptop lending program')
    recommendations.push('Provide computer lab access')
  }
  
  return recommendations
}
