/**
 * Risk Flag Tracking System
 * Captures and manages detailed risk factors identified by SHAP analysis
 */

export interface RiskFlag {
  id: string
  studentId: string
  flagType: 'red' | 'green' | 'neutral'
  category: 'academic' | 'socioeconomic' | 'family' | 'behavioral' | 'infrastructure'
  factor: string
  description: string
  impact: number // SHAP value or impact score
  severity: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  identifiedAt: string
  lastUpdated: string
  metadata?: {
    source: 'shap_analysis' | 'manual' | 'automated'
    confidence: number
    modelVersion?: string
  }
}

export interface RiskProfile {
  studentId: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  dropoutProbability: number
  totalFlags: number
  redFlags: RiskFlag[]
  greenFlags: RiskFlag[]
  neutralFlags: RiskFlag[]
  lastAnalyzed: string
  analysisSource: 'ml_model' | 'fallback' | 'manual'
}

// Risk factor categories and their mappings
export const RISK_FACTOR_MAPPINGS = {
  // Academic Factors
  academic: {
    'MarksTrend': {
      category: 'academic',
      description: 'Declining academic performance trend',
      defaultSeverity: 'high'
    },
    'AvgAttendance LatestTerm': {
      category: 'academic', 
      description: 'Low attendance in latest term',
      defaultSeverity: 'medium'
    },
    'FailureRate LatestTerm': {
      category: 'academic',
      description: 'High failure rate in latest term',
      defaultSeverity: 'high'
    },
    'AvgMarks LatestTerm': {
      category: 'academic',
      description: 'Low average marks in latest term',
      defaultSeverity: 'medium'
    }
  },
  
  // Socioeconomic Factors
  socioeconomic: {
    'FamilyAnnualIncome': {
      category: 'socioeconomic',
      description: 'Family income level impact',
      defaultSeverity: 'medium'
    },
    'FamilyEconomicStatus General Tier': {
      category: 'socioeconomic',
      description: 'Economic status classification',
      defaultSeverity: 'medium'
    },
    'WorksPartTime': {
      category: 'socioeconomic',
      description: 'Student works part-time',
      defaultSeverity: 'high'
    }
  },
  
  // Family Factors
  family: {
    'IsFirstGenerationLearner': {
      category: 'family',
      description: 'First generation learner',
      defaultSeverity: 'high'
    },
    'IsFatherLiterate': {
      category: 'family',
      description: 'Father\'s literacy status',
      defaultSeverity: 'medium'
    },
    'IsMotherLiterate': {
      category: 'family',
      description: 'Mother\'s literacy status',
      defaultSeverity: 'medium'
    },
    'FatherEducation': {
      category: 'family',
      description: 'Father\'s education level',
      defaultSeverity: 'medium'
    },
    'MotherEducation': {
      category: 'family',
      description: 'Mother\'s education level',
      defaultSeverity: 'medium'
    },
    'NumberOfSiblings': {
      category: 'family',
      description: 'Number of siblings',
      defaultSeverity: 'low'
    }
  },
  
  // Behavioral Factors
  behavioral: {
    'MediumChanged': {
      category: 'behavioral',
      description: 'Changed medium of instruction',
      defaultSeverity: 'high'
    },
    'IsPreparingCompetitiveExam': {
      category: 'behavioral',
      description: 'Preparing for competitive exams',
      defaultSeverity: 'low'
    }
  },
  
  // Infrastructure Factors
  infrastructure: {
    'HasReliableInternet': {
      category: 'infrastructure',
      description: 'Access to reliable internet',
      defaultSeverity: 'medium'
    },
    'HasOwnLaptop': {
      category: 'infrastructure',
      description: 'Owns personal laptop/device',
      defaultSeverity: 'low'
    }
  }
}

// Known protective and risk features from SHAP analysis
export const KNOWN_PROTECTIVE_FEATURES = [
  'IsPreparingCompetitiveExam',
  'HasReliableInternet', 
  'HasOwnLaptop',
  'FamilyEconomicStatus_General_Tier',
  'FamilyAnnualIncome',
  'IsMotherLiterate',
  'IsFatherLiterate',
  'FatherEducation',
  'MotherEducation'
]

export const KNOWN_RISK_FEATURES = [
  'WorksPartTime',
  'MediumChanged',
  'IsFirstGenerationLearner',
  'MarksTrend',
  'FailureRate LatestTerm',
  'AvgAttendance LatestTerm',
  'AvgMarks LatestTerm'
]

export class RiskFlagTracker {
  private static instance: RiskFlagTracker
  private riskFlags: Map<string, RiskFlag[]> = new Map()
  private riskProfiles: Map<string, RiskProfile> = new Map()

  static getInstance(): RiskFlagTracker {
    if (!RiskFlagTracker.instance) {
      RiskFlagTracker.instance = new RiskFlagTracker()
    }
    return RiskFlagTracker.instance
  }

  /**
   * Process SHAP analysis results and create risk flags
   */
  processShapAnalysis(studentId: string, shapResults: {
    dropoutProbability: number
    redFlags: string[]
    greenFlags: string[]
    modelVersion?: string
  }): RiskProfile {
    const riskFlags: RiskFlag[] = []
    
    // Process red flags (risk factors)
    shapResults.redFlags.forEach((flag, index) => {
      const cleanFlag = flag.replace(/^- /, '') // Remove bullet point
      const flagData = this.getFlagData(cleanFlag)
      
      riskFlags.push({
        id: `${studentId}_red_${index}`,
        studentId,
        flagType: 'red',
        category: flagData.category,
        factor: cleanFlag,
        description: flagData.description,
        impact: this.calculateImpact(shapResults.redFlags.length, index, 'red'),
        severity: flagData.defaultSeverity,
        isActive: true,
        identifiedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        metadata: {
          source: 'shap_analysis',
          confidence: this.calculateConfidence(cleanFlag),
          modelVersion: shapResults.modelVersion
        }
      })
    })
    
    // Process green flags (protective factors)
    shapResults.greenFlags.forEach((flag, index) => {
      const cleanFlag = flag.replace(/^- /, '') // Remove bullet point
      const flagData = this.getFlagData(cleanFlag)
      
      riskFlags.push({
        id: `${studentId}_green_${index}`,
        studentId,
        flagType: 'green',
        category: flagData.category,
        factor: cleanFlag,
        description: flagData.description,
        impact: -this.calculateImpact(shapResults.greenFlags.length, index, 'green'),
        severity: flagData.defaultSeverity,
        isActive: true,
        identifiedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        metadata: {
          source: 'shap_analysis',
          confidence: this.calculateConfidence(cleanFlag),
          modelVersion: shapResults.modelVersion
        }
      })
    })
    
    // Create risk profile
    const riskProfile: RiskProfile = {
      studentId,
      riskLevel: this.assignRiskLevel(shapResults.dropoutProbability),
      dropoutProbability: shapResults.dropoutProbability,
      totalFlags: riskFlags.length,
      redFlags: riskFlags.filter(f => f.flagType === 'red'),
      greenFlags: riskFlags.filter(f => f.flagType === 'green'),
      neutralFlags: [],
      lastAnalyzed: new Date().toISOString(),
      analysisSource: 'ml_model'
    }
    
    // Store the data
    this.riskFlags.set(studentId, riskFlags)
    this.riskProfiles.set(studentId, riskProfile)
    
    return riskProfile
  }

  /**
   * Get risk profile for a student
   */
  getRiskProfile(studentId: string): RiskProfile | null {
    return this.riskProfiles.get(studentId) || null
  }

  /**
   * Get all risk flags for a student
   */
  getRiskFlags(studentId: string): RiskFlag[] {
    return this.riskFlags.get(studentId) || []
  }

  /**
   * Get risk flags by category
   */
  getRiskFlagsByCategory(category: string): RiskFlag[] {
    const allFlags: RiskFlag[] = []
    for (const flags of this.riskFlags.values()) {
      allFlags.push(...flags.filter(f => f.category === category))
    }
    return allFlags
  }

  /**
   * Get students with specific risk factors
   */
  getStudentsWithRiskFactor(factor: string): string[] {
    const students: string[] = []
    for (const [studentId, flags] of this.riskFlags.entries()) {
      if (flags.some(f => f.factor === factor && f.isActive)) {
        students.push(studentId)
      }
    }
    return students
  }

  /**
   * Get risk statistics
   */
  getRiskStatistics(): {
    totalStudents: number
    byRiskLevel: { [key: string]: number }
    byFlagType: { [key: string]: number }
    byCategory: { [key: string]: number }
    topRiskFactors: { [key: string]: number }
  } {
    const stats = {
      totalStudents: this.riskProfiles.size,
      byRiskLevel: {} as { [key: string]: number },
      byFlagType: {} as { [key: string]: number },
      byCategory: {} as { [key: string]: number },
      topRiskFactors: {} as { [key: string]: number }
    }

    // Count by risk level
    for (const profile of this.riskProfiles.values()) {
      stats.byRiskLevel[profile.riskLevel] = (stats.byRiskLevel[profile.riskLevel] || 0) + 1
    }

    // Count by flag type and category
    for (const flags of this.riskFlags.values()) {
      flags.forEach(flag => {
        stats.byFlagType[flag.flagType] = (stats.byFlagType[flag.flagType] || 0) + 1
        stats.byCategory[flag.category] = (stats.byCategory[flag.category] || 0) + 1
        
        if (flag.flagType === 'red') {
          stats.topRiskFactors[flag.factor] = (stats.topRiskFactors[flag.factor] || 0) + 1
        }
      })
    }

    return stats
  }

  /**
   * Update flag status
   */
  updateFlagStatus(studentId: string, flagId: string, isActive: boolean): boolean {
    const flags = this.riskFlags.get(studentId)
    if (!flags) return false

    const flag = flags.find(f => f.id === flagId)
    if (!flag) return false

    flag.isActive = isActive
    flag.lastUpdated = new Date().toISOString()

    return true
  }

  /**
   * Add manual flag
   */
  addManualFlag(studentId: string, flag: Omit<RiskFlag, 'id' | 'studentId' | 'identifiedAt' | 'lastUpdated'>): RiskFlag {
    const newFlag: RiskFlag = {
      ...flag,
      id: `${studentId}_manual_${Date.now()}`,
      studentId,
      identifiedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        source: 'manual',
        confidence: 1.0
      }
    }

    const existingFlags = this.riskFlags.get(studentId) || []
    existingFlags.push(newFlag)
    this.riskFlags.set(studentId, existingFlags)

    // Update risk profile
    this.updateRiskProfile(studentId)

    return newFlag
  }

  /**
   * Get flag data from mappings
   */
  private getFlagData(factor: string): { category: string, description: string, defaultSeverity: string } {
    // Search through all categories
    for (const [category, factors] of Object.entries(RISK_FACTOR_MAPPINGS)) {
      if (factors[factor]) {
        return {
          category,
          description: factors[factor].description,
          defaultSeverity: factors[factor].defaultSeverity
        }
      }
    }

    // Default fallback
    return {
      category: 'behavioral',
      description: `Risk factor: ${factor}`,
      defaultSeverity: 'medium'
    }
  }

  /**
   * Calculate impact score based on position and type
   */
  private calculateImpact(totalFlags: number, position: number, type: 'red' | 'green'): number {
    const baseImpact = (totalFlags - position) / totalFlags // Higher position = lower impact
    return type === 'red' ? baseImpact : -baseImpact
  }

  /**
   * Calculate confidence based on known factors
   */
  private calculateConfidence(factor: string): number {
    if (KNOWN_RISK_FEATURES.includes(factor) || KNOWN_PROTECTIVE_FEATURES.includes(factor)) {
      return 0.9 // High confidence for known factors
    }
    return 0.7 // Medium confidence for other factors
  }

  /**
   * Assign risk level based on dropout probability
   */
  private assignRiskLevel(dropoutProbability: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (dropoutProbability > 0.5) return 'Critical'
    if (dropoutProbability > 0.3) return 'High'
    if (dropoutProbability > 0.1) return 'Medium'
    return 'Low'
  }

  /**
   * Update risk profile after flag changes
   */
  private updateRiskProfile(studentId: string): void {
    const flags = this.riskFlags.get(studentId) || []
    const activeFlags = flags.filter(f => f.isActive)
    
    const profile = this.riskProfiles.get(studentId)
    if (profile) {
      profile.totalFlags = activeFlags.length
      profile.redFlags = activeFlags.filter(f => f.flagType === 'red')
      profile.greenFlags = activeFlags.filter(f => f.flagType === 'green')
      profile.neutralFlags = activeFlags.filter(f => f.flagType === 'neutral')
      profile.lastAnalyzed = new Date().toISOString()
    }
  }

  /**
   * Clear old flags (for maintenance)
   */
  clearOldFlags(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    
    for (const [studentId, flags] of this.riskFlags.entries()) {
      const recentFlags = flags.filter(flag => 
        new Date(flag.identifiedAt) > cutoffDate
      )
      this.riskFlags.set(studentId, recentFlags)
    }
  }

  /**
   * Export risk data
   */
  exportRiskData(format: 'json' | 'csv' = 'json'): string {
    const allProfiles = Array.from(this.riskProfiles.values())
    const allFlags = Array.from(this.riskFlags.values()).flat()
    
    const data = {
      profiles: allProfiles,
      flags: allFlags,
      exportedAt: new Date().toISOString(),
      totalStudents: allProfiles.length,
      totalFlags: allFlags.length
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvRows = allFlags.map(flag => [
        flag.studentId,
        flag.flagType,
        flag.category,
        flag.factor,
        flag.description,
        flag.impact,
        flag.severity,
        flag.isActive,
        flag.identifiedAt
      ])
      
      const headers = ['studentId', 'flagType', 'category', 'factor', 'description', 'impact', 'severity', 'isActive', 'identifiedAt']
      return [headers, ...csvRows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(data, null, 2)
  }
}

// Export singleton instance
export const riskFlagTracker = RiskFlagTracker.getInstance()
