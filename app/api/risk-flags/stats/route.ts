import { NextRequest, NextResponse } from "next/server"
import { riskFlagTracker } from "../../../../lib/risk-flag-tracker"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get risk statistics
    const statistics = riskFlagTracker.getRiskStatistics()
    
    // Mock some additional data for demonstration
    const mockFlags = generateMockRiskFlags()
    const mockProfiles = generateMockRiskProfiles()
    
    return NextResponse.json({
      success: true,
      data: {
        statistics,
        flags: mockFlags,
        profiles: mockProfiles,
        lastUpdated: new Date('2025-01-09').toISOString()
      }
    })

  } catch (error) {
    console.error('[API] Error fetching risk flags statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk flags statistics' },
      { status: 500 }
    )
  }
}

function generateMockRiskFlags() {
  const riskFactors = [
    'IsFirstGenerationLearner',
    'MarksTrend',
    'AvgAttendance LatestTerm',
    'WorksPartTime',
    'MediumChanged',
    'IsMotherLiterate',
    'FailureRate LatestTerm',
    'FamilyAnnualIncome',
    'HasReliableInternet',
    'IsPreparingCompetitiveExam'
  ]
  
  const flags = []
  const studentIds = Array.from({length: 100}, (_, i) => `RJ_${1000 + i}`)
  
  for (let i = 0; i < 200; i++) {
    const studentId = studentIds[Math.floor(Math.random() * studentIds.length)]
    const factor = riskFactors[Math.floor(Math.random() * riskFactors.length)]
    const flagType = Math.random() < 0.6 ? 'red' : 'green'
    
    flags.push({
      id: `${studentId}_flag_${i}`,
      studentId,
      flagType,
      category: getCategoryForFactor(factor),
      factor,
      description: getDescriptionForFactor(factor),
      impact: flagType === 'red' ? Math.random() * 0.8 + 0.2 : -(Math.random() * 0.8 + 0.2),
      severity: getRandomSeverity(),
      isActive: true,
      identifiedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        source: 'shap_analysis',
        confidence: Math.random() * 0.3 + 0.7,
        modelVersion: 'shap_v1'
      }
    })
  }
  
  return flags
}

function generateMockRiskProfiles() {
  const studentIds = Array.from({length: 100}, (_, i) => `RJ_${1000 + i}`)
  
  return studentIds.map(studentId => {
    const dropoutProbability = Math.random()
    const redFlagsCount = Math.floor(Math.random() * 5)
    const greenFlagsCount = Math.floor(Math.random() * 4)
    
    return {
      studentId,
      riskLevel: assignRiskLevel(dropoutProbability),
      dropoutProbability,
      totalFlags: redFlagsCount + greenFlagsCount,
      redFlags: Array.from({length: redFlagsCount}, (_, i) => ({
        id: `${studentId}_red_${i}`,
        factor: `Risk Factor ${i + 1}`,
        impact: Math.random() * 0.8 + 0.2
      })),
      greenFlags: Array.from({length: greenFlagsCount}, (_, i) => ({
        id: `${studentId}_green_${i}`,
        factor: `Protective Factor ${i + 1}`,
        impact: -(Math.random() * 0.8 + 0.2)
      })),
      neutralFlags: [],
      lastAnalyzed: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      analysisSource: Math.random() < 0.8 ? 'ml_model' : 'fallback'
    }
  })
}

function getCategoryForFactor(factor: string): string {
  if (factor.includes('Marks') || factor.includes('Attendance') || factor.includes('Failure')) {
    return 'academic'
  }
  if (factor.includes('Income') || factor.includes('Works')) {
    return 'socioeconomic'
  }
  if (factor.includes('Mother') || factor.includes('Father') || factor.includes('Generation')) {
    return 'family'
  }
  if (factor.includes('Medium') || factor.includes('Exam')) {
    return 'behavioral'
  }
  if (factor.includes('Internet') || factor.includes('Laptop')) {
    return 'infrastructure'
  }
  return 'behavioral'
}

function getDescriptionForFactor(factor: string): string {
  const descriptions: { [key: string]: string } = {
    'IsFirstGenerationLearner': 'First generation learner',
    'MarksTrend': 'Declining academic performance trend',
    'AvgAttendance LatestTerm': 'Low attendance in latest term',
    'WorksPartTime': 'Student works part-time',
    'MediumChanged': 'Changed medium of instruction',
    'IsMotherLiterate': 'Mother\'s literacy status impact',
    'FailureRate LatestTerm': 'High failure rate in latest term',
    'FamilyAnnualIncome': 'Family income level impact',
    'HasReliableInternet': 'Access to reliable internet',
    'IsPreparingCompetitiveExam': 'Preparing for competitive exams'
  }
  
  return descriptions[factor] || `Risk factor: ${factor}`
}

function getRandomSeverity(): string {
  const severities = ['low', 'medium', 'high', 'critical']
  return severities[Math.floor(Math.random() * severities.length)]
}

function assignRiskLevel(dropoutProbability: number): string {
  if (dropoutProbability > 0.5) return 'Critical'
  if (dropoutProbability > 0.3) return 'High'
  if (dropoutProbability > 0.1) return 'Medium'
  return 'Low'
}
