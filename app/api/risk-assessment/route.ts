import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentData } = body

    if (!studentData) {
      return NextResponse.json(
        { error: 'Student data is required' },
        { status: 400 }
      )
    }

    console.log('[API] Processing risk assessment request')

    // Call our ML service for real risk assessment
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001'
    
    try {
      const mlResponse = await fetch(`${mlServiceUrl}/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      })

      if (!mlResponse.ok) {
        throw new Error(`ML service responded with status: ${mlResponse.status}`)
      }

      const mlResult = await mlResponse.json()

      // Generate detailed risk explanation
      const riskExplanation = generateRiskExplanation(studentData, mlResult)

      // Generate intervention recommendations
      const interventions = generateInterventionRecommendations(mlResult, studentData)

      const assessmentResult = {
        studentId: studentData.StudentID || studentData.studentId,
        riskScore: mlResult.risk_score,
        riskLevel: mlResult.risk_level,
        dropoutProbability: mlResult.dropout_probability,
        dropoutPrediction: mlResult.dropout_prediction,
        featureImportance: mlResult.feature_importance,
        riskExplanation: mlResult.risk_explanation || riskExplanation,
        interventions,
        modelVersion: mlResult.model_version,
        assessmentDate: new Date().toISOString(),
        dataSource: mlResult.data_source,
        shapAvailable: mlResult.shap_available || false
      }

      return NextResponse.json({
        success: true,
        data: assessmentResult
      })

    } catch (mlError) {
      console.error('[API] ML service error:', mlError)
      
      // Fallback to simplified risk assessment
      const fallbackAssessment = generateFallbackRiskAssessment(studentData)
      
      return NextResponse.json({
        success: true,
        data: {
          ...fallbackAssessment,
          dataSource: 'FALLBACK_ALGORITHM',
          warning: '⚠️ ML SERVICE UNAVAILABLE - Using simplified algorithm'
        },
        warning: 'Using fallback risk assessment due to ML service unavailability'
      })
    }

  } catch (error) {
    console.error('[API] Risk assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to process risk assessment' },
      { status: 500 }
    )
  }
}

function generateRiskExplanation(studentData: any, mlResult: any) {
  const explanations = []

  // Attendance explanation
  if (studentData.AvgAttendance_LatestTerm < 75) {
    explanations.push({
      factor: 'Attendance',
      impact: 'High',
      description: `Low attendance (${studentData.AvgAttendance_LatestTerm}%) significantly increases dropout risk. Regular attendance is crucial for academic success.`,
      recommendation: 'Implement attendance monitoring and family communication'
    })
  }

  // Performance explanation
  if (studentData.AvgMarks_LatestTerm < 60) {
    explanations.push({
      factor: 'Academic Performance',
      impact: 'High',
      description: `Below-average academic performance (${studentData.AvgMarks_LatestTerm}%) indicates potential learning difficulties or engagement issues.`,
      recommendation: 'Provide additional academic support and tutoring'
    })
  }

  // Socioeconomic factors
  if (studentData.FamilyAnnualIncome < 100000) {
    explanations.push({
      factor: 'Financial Stability',
      impact: 'Medium',
      description: `Low family income (₹${studentData.FamilyAnnualIncome}) may create financial stress affecting academic focus.`,
      recommendation: 'Consider financial aid and scholarship opportunities'
    })
  }

  // First generation learner
  if (studentData.IsFirstGenerationLearner === 'TRUE') {
    explanations.push({
      factor: 'Family Educational Background',
      impact: 'Medium',
      description: 'As a first-generation learner, the student may lack family support in navigating academic challenges.',
      recommendation: 'Provide additional guidance and mentorship programs'
    })
  }

  // Rural status
  if (studentData.IsRural === 'TRUE') {
    explanations.push({
      factor: 'Geographic Location',
      impact: 'Medium',
      description: 'Rural background may present challenges in access to resources and educational support.',
      recommendation: 'Ensure access to digital resources and support services'
    })
  }

  return explanations
}

function generateInterventionRecommendations(mlResult: any, studentData: any) {
  const interventions = []

  const riskLevel = mlResult.risk_level?.toLowerCase() || 'medium'
  const riskScore = mlResult.risk_score || 50

  // High-risk interventions
  if (riskLevel === 'high' || riskLevel === 'critical') {
    interventions.push({
      type: 'Immediate Action Required',
      priority: 'High',
      title: 'Intensive Support Program',
      description: 'Student requires immediate intervention due to high dropout risk.',
      actions: [
        'Assign dedicated mentor for daily check-ins',
        'Schedule weekly family meetings',
        'Implement attendance monitoring system',
        'Provide academic tutoring support',
        'Consider alternative learning approaches'
      ],
      timeline: 'Immediate (within 1 week)',
      successMetrics: ['Improved attendance', 'Better academic performance', 'Reduced risk score']
    })
  }

  // Medium-risk interventions
  if (riskLevel === 'medium') {
    interventions.push({
      type: 'Preventive Support',
      priority: 'Medium',
      title: 'Regular Monitoring Program',
      description: 'Student needs regular monitoring and support to prevent risk escalation.',
      actions: [
        'Schedule bi-weekly mentor meetings',
        'Monitor attendance and performance trends',
        'Provide study skills workshops',
        'Connect with peer support groups'
      ],
      timeline: 'Within 2 weeks',
      successMetrics: ['Maintained attendance', 'Stable performance', 'Active engagement']
    })
  }

  // Specific interventions based on student data
  if (studentData.AvgAttendance_LatestTerm < 75) {
    interventions.push({
      type: 'Attendance Support',
      priority: 'High',
      title: 'Attendance Improvement Program',
      description: 'Focus on improving student attendance through targeted interventions.',
      actions: [
        'Identify barriers to attendance',
        'Implement attendance incentives',
        'Provide transportation support if needed',
        'Regular parent communication'
      ],
      timeline: 'Immediate',
      successMetrics: ['Attendance rate above 80%']
    })
  }

  if (studentData.AvgMarks_LatestTerm < 60) {
    interventions.push({
      type: 'Academic Support',
      priority: 'High',
      title: 'Academic Improvement Program',
      description: 'Provide targeted academic support to improve performance.',
      actions: [
        'Assess learning difficulties',
        'Provide subject-specific tutoring',
        'Implement study skills training',
        'Regular progress monitoring'
      ],
      timeline: 'Within 1 week',
      successMetrics: ['Improved test scores', 'Better assignment completion']
    })
  }

  if (studentData.IsFirstGenerationLearner === 'TRUE') {
    interventions.push({
      type: 'Family Support',
      priority: 'Medium',
      title: 'First-Generation Learner Support',
      description: 'Provide additional support for first-generation college student.',
      actions: [
        'Family orientation programs',
        'Academic guidance workshops',
        'Peer mentoring program',
        'Financial literacy training'
      ],
      timeline: 'Within 2 weeks',
      successMetrics: ['Family engagement', 'Student confidence', 'Academic progress']
    })
  }

  return interventions
}

function generateFallbackRiskAssessment(studentData: any) {
  // Simplified risk calculation when ML service is unavailable
  let riskScore = 0

  // Attendance factor
  if (studentData.AvgAttendance_LatestTerm < 60) riskScore += 30
  else if (studentData.AvgAttendance_LatestTerm < 75) riskScore += 20
  else if (studentData.AvgAttendance_LatestTerm < 85) riskScore += 10

  // Performance factor
  if (studentData.AvgMarks_LatestTerm < 40) riskScore += 25
  else if (studentData.AvgMarks_LatestTerm < 60) riskScore += 15
  else if (studentData.AvgMarks_LatestTerm < 75) riskScore += 10

  // Socioeconomic factors
  if (studentData.FamilyAnnualIncome < 100000) riskScore += 15
  if (studentData.IsFirstGenerationLearner === 'TRUE') riskScore += 10
  if (studentData.IsRural === 'TRUE') riskScore += 8
  if (studentData.NumberOfSiblings > 3) riskScore += 5

  riskScore = Math.min(riskScore, 100)

  let riskLevel = 'Low'
  if (riskScore >= 80) riskLevel = 'Critical'
  else if (riskScore >= 60) riskLevel = 'High'
  else if (riskScore >= 40) riskLevel = 'Medium'

  const dropoutProbability = riskScore * 0.6 / 100

  return {
    studentId: studentData.StudentID,
    riskScore,
    riskLevel,
    dropoutProbability,
    dropoutPrediction: dropoutProbability > 0.5,
    featureImportance: {
      attendance: 0.3,
      performance: 0.25,
      socioeconomic: 0.25,
      family: 0.2
    },
    riskExplanation: generateRiskExplanation(studentData, { risk_score: riskScore, risk_level: riskLevel }),
    interventions: generateInterventionRecommendations({ risk_level: riskLevel, risk_score: riskScore }, studentData),
    modelVersion: 'fallback-v1.0',
    assessmentDate: new Date().toISOString(),
    fallback: true
  }
}
