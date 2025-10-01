import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'predictive'

    if (type === 'predictive') {
      // Simulate predictive analytics with fallback data
      const fallbackStudents = []
      for (let i = 0; i < 50; i++) {
        fallbackStudents.push({
          StudentID: `[FALLBACK_DATA] Student ${i + 1}`,
          RiskLevel: i % 4 === 0 ? 'Critical' : i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low',
          RiskScore: i % 4 === 0 ? 95 : i % 3 === 0 ? 75 : i % 2 === 0 ? 55 : 25,
          AvgAttendance_LatestTerm: i % 4 === 0 ? 25 : i % 3 === 0 ? 45 : i % 2 === 0 ? 65 : 85,
          AvgMarks_LatestTerm: i % 4 === 0 ? 20 : i % 3 === 0 ? 40 : i % 2 === 0 ? 60 : 80,
          FamilyAnnualIncome: 100000,
          IsRural: i % 2 === 0 ? 'TRUE' : 'FALSE',
          IsFirstGenerationLearner: i % 3 === 0 ? 'TRUE' : 'FALSE',
          NumberOfSiblings: 2,
          HasOwnLaptop: i % 2 === 0 ? 'TRUE' : 'FALSE',
          HasReliableInternet: i % 2 === 0 ? 'FALSE' : 'TRUE',
          _isFallbackData: true
        })
      }

      const predictiveData = {
        totalAtRisk: 40,
        highRisk: 15,
        mediumRisk: 25,
        lowRisk: 10,
        criticalRisk: 5,
        trendDirection: 'increasing',
        confidence: 45, // Low confidence for fallback
        monthlyPredictions: [
          { month: 'जनवरी / Jan', predicted: 8, actual: 6, prevented: 4, confidence: 50 },
          { month: 'फरवरी / Feb', predicted: 12, actual: 10, prevented: 6, confidence: 45 },
          { month: 'मार्च / Mar', predicted: 15, actual: 13, prevented: 8, confidence: 40 },
          { month: 'अप्रैल / Apr', predicted: 18, actual: 16, prevented: 10, confidence: 35 },
          { month: 'मई / May', predicted: 22, actual: null, prevented: null, confidence: 30 },
          { month: 'जून / Jun', predicted: 25, actual: null, prevented: null, confidence: 25 }
        ],
        riskFactorDistribution: [
          { factor: 'आर्थिक / Financial', value: 0, color: '#ef4444' },
          { factor: 'शैक्षणिक / Academic', value: 100, color: '#f97316' },
          { factor: 'पारिवारिक / Family', value: 0, color: '#eab308' },
          { factor: 'सामाजिक / Social', value: 0, color: '#22c55e' }
        ],
        interventionSuccess: [
          { intervention: 'Mentor Assignment', studentsReached: 40, successRate: 45, avgRiskReduction: 15 },
          { intervention: 'Family Counseling', studentsReached: 25, successRate: 50, avgRiskReduction: 12 },
          { intervention: 'Academic Support', studentsReached: 35, successRate: 48, avgRiskReduction: 18 },
          { intervention: 'Financial Aid', studentsReached: 15, successRate: 55, avgRiskReduction: 20 }
        ],
        lastUpdated: new Date().toISOString(),
        dataSource: 'FALLBACK_DEMO_DATA',
        warning: '⚠️ DATABASE CONNECTION FAILED - Using demo data for demonstration'
      }

      return NextResponse.json({
        success: true,
        data: predictiveData
      })
    }

    if (type === 'risk') {
      // Simulate risk assessment with fallback
      const fallbackAssessment = {
        studentId: 'TEST_FALLBACK_STUDENT',
        riskScore: 75,
        riskLevel: 'High',
        dropoutProbability: 0.65,
        dropoutPrediction: true,
        featureImportance: {
          attendance: 0.4,
          performance: 0.3,
          family_income: 0.2,
          rural_status: 0.1
        },
        riskExplanation: [
          {
            factor: 'Attendance',
            impact: 'High',
            description: '[FALLBACK DATA] Low attendance significantly increases dropout risk.',
            recommendation: 'Implement attendance monitoring (Demo recommendation)'
          },
          {
            factor: 'Academic Performance',
            impact: 'High',
            description: '[FALLBACK DATA] Below-average performance indicates learning difficulties.',
            recommendation: 'Provide academic support (Demo recommendation)'
          }
        ],
        interventions: [
          {
            type: 'Demo Intervention',
            priority: 'High',
            title: '[FALLBACK] Sample Intervention Program',
            description: 'This is demo intervention data for demonstration purposes.',
            actions: ['Demo action 1', 'Demo action 2', 'Demo action 3'],
            timeline: 'Demo timeline',
            successMetrics: ['Demo metric 1', 'Demo metric 2']
          }
        ],
        modelVersion: 'fallback-v1.0-demo',
        assessmentDate: new Date().toISOString(),
        fallback: true,
        dataSource: 'FALLBACK_ALGORITHM',
        warning: '⚠️ ML SERVICE UNAVAILABLE - Using simplified algorithm'
      }

      return NextResponse.json({
        success: true,
        data: fallbackAssessment
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid test type. Use ?type=predictive or ?type=risk'
    }, { status: 400 })

  } catch (error) {
    console.error('[API] Test fallback error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate test fallback data' },
      { status: 500 }
    )
  }
}
