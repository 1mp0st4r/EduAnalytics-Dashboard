// Risk explanation service for student dropout prevention system
// Provides detailed explanations for why students are flagged at different risk levels

interface RiskExplanation {
  level: string
  score: number
  attendance: number
  performance: number
  dropoutProbability: number
  gender?: string
  classLevel?: number
  explanation: {
    primary: string
    factors: string[]
    recommendations: string[]
    urgency: 'low' | 'medium' | 'high' | 'critical'
  }
}

export class RiskExplanationService {
  
  /**
   * Generate comprehensive risk explanation for a student
   */
  generateExplanation(studentData: any): RiskExplanation {
    const attendance = parseFloat(studentData.AvgAttendance_LatestTerm)
    const performance = parseFloat(studentData.AvgMarks_LatestTerm)
    const dropoutProbability = parseFloat(studentData.DropoutProbability)
    const riskLevel = studentData.RiskLevel
    const riskScore = studentData.RiskScore

    const baseExplanation = this.getBaseExplanation(riskLevel, riskScore, attendance, performance, dropoutProbability)
    
    // Add specific factors based on data
    const factors = this.identifyRiskFactors(attendance, performance, riskScore, dropoutProbability)
    
    // Add gender and class-specific insights
    if (studentData.Gender) {
      factors.push(this.getGenderInsight(studentData.Gender, riskLevel))
    }
    
    if (studentData.StudentClass) {
      factors.push(this.getClassInsight(studentData.StudentClass, riskLevel))
    }

    return {
      level: riskLevel,
      score: riskScore,
      attendance: attendance,
      performance: performance,
      dropoutProbability: dropoutProbability,
      explanation: {
        ...baseExplanation,
        factors: factors
      }
    }
  }

  private getBaseExplanation(riskLevel: string, riskScore: number, attendance: number, performance: number, dropoutProbability: number) {
    const baseExplanations = {
      'Critical': {
        primary: `This student is at CRITICAL risk of dropping out with a ${riskScore}/100 risk score and ${dropoutProbability.toFixed(1)}% dropout probability.`,
        urgency: 'critical' as const,
        recommendations: [
          'Immediate intervention required - schedule emergency meeting with student and parents',
          'Assign dedicated counselor and create intensive support plan',
          'Implement daily check-ins and academic monitoring',
          'Consider alternative learning approaches or additional support services',
          'Notify school administration and relevant stakeholders immediately'
        ]
      },
      'High': {
        primary: `This student is at HIGH risk of dropping out with a ${riskScore}/100 risk score and ${dropoutProbability.toFixed(1)}% dropout probability.`,
        urgency: 'high' as const,
        recommendations: [
          'Schedule urgent meeting with student and parents within 48 hours',
          'Assign mentor for intensive academic and emotional support',
          'Create personalized intervention plan with specific goals',
          'Implement weekly progress monitoring and support sessions',
          'Consider additional tutoring or academic support services'
        ]
      },
      'Medium': {
        primary: `This student is at MEDIUM risk with a ${riskScore}/100 risk score and ${dropoutProbability.toFixed(1)}% dropout probability.`,
        urgency: 'medium' as const,
        recommendations: [
          'Schedule regular check-ins with student and mentor',
          'Identify specific areas of concern and create improvement plan',
          'Provide additional academic support and resources',
          'Monitor progress closely and adjust support as needed',
          'Encourage student engagement in school activities'
        ]
      },
      'Low': {
        primary: `This student is at LOW risk with a ${riskScore}/100 risk score and ${dropoutProbability.toFixed(1)}% dropout probability.`,
        urgency: 'low' as const,
        recommendations: [
          'Continue current support and monitoring',
          'Encourage continued academic excellence',
          'Provide opportunities for advanced learning',
          'Maintain regular check-ins to prevent risk escalation',
          'Celebrate achievements and maintain positive engagement'
        ]
      }
    }

    return baseExplanations[riskLevel as keyof typeof baseExplanations] || baseExplanations['Low']
  }

  private identifyRiskFactors(attendance: number, performance: number, riskScore: number, dropoutProbability: number): string[] {
    const factors: string[] = []

    // Attendance-based factors
    if (attendance < 60) {
      factors.push(`Severely low attendance (${attendance.toFixed(1)}%) - below critical threshold of 60%`)
    } else if (attendance < 75) {
      factors.push(`Low attendance (${attendance.toFixed(1)}%) - below recommended 75% threshold`)
    } else if (attendance < 85) {
      factors.push(`Moderate attendance (${attendance.toFixed(1)}%) - room for improvement`)
    }

    // Performance-based factors
    if (performance < 40) {
      factors.push(`Critically low academic performance (${performance.toFixed(1)}%) - failing grades`)
    } else if (performance < 60) {
      factors.push(`Poor academic performance (${performance.toFixed(1)}%) - below passing threshold`)
    } else if (performance < 75) {
      factors.push(`Below-average academic performance (${performance.toFixed(1)}%) - needs improvement`)
    }

    // Combined risk factors
    if (attendance < 70 && performance < 60) {
      factors.push('Dual risk: Both attendance and performance are significantly below acceptable levels')
    }

    if (riskScore >= 80) {
      factors.push('Very high risk score indicates multiple concerning factors')
    } else if (riskScore >= 60) {
      factors.push('High risk score suggests several areas of concern')
    }

    if (dropoutProbability >= 80) {
      factors.push('Extremely high dropout probability based on current patterns')
    } else if (dropoutProbability >= 60) {
      factors.push('High dropout probability requires immediate attention')
    }

    // Academic trajectory factors
    if (attendance < 50 || performance < 30) {
      factors.push('Academic trajectory shows severe decline requiring emergency intervention')
    }

    // Engagement factors
    if (attendance < 80 && performance < 70) {
      factors.push('Low engagement indicators suggest potential disconnection from school')
    }

    return factors
  }

  private getGenderInsight(gender: string, riskLevel: string): string {
    const insights = {
      'Male': {
        'Critical': 'Male students at critical risk often face additional social pressures and may need gender-specific support strategies',
        'High': 'Male students in high-risk category may benefit from mentorship programs and peer support',
        'Medium': 'Male students showing medium risk should be monitored for social and academic factors',
        'Low': 'Male students with low risk should continue to be supported in maintaining positive engagement'
      },
      'Female': {
        'Critical': 'Female students at critical risk may face unique challenges requiring sensitive and comprehensive support',
        'High': 'Female students in high-risk category may benefit from targeted academic and emotional support',
        'Medium': 'Female students showing medium risk should be supported in building confidence and engagement',
        'Low': 'Female students with low risk should continue to be encouraged in their academic pursuits'
      },
      'Other': {
        'Critical': 'Students identifying as other gender at critical risk may face additional challenges requiring inclusive support',
        'High': 'Students identifying as other gender in high-risk category need culturally sensitive support approaches',
        'Medium': 'Students identifying as other gender showing medium risk should receive inclusive support',
        'Low': 'Students identifying as other gender with low risk should continue to be supported inclusively'
      }
    }

    return insights[gender as keyof typeof insights]?.[riskLevel as keyof typeof insights['Male']] || 
           'Gender-specific factors should be considered in support planning'
  }

  private getClassInsight(classLevel: number, riskLevel: string): string {
    if (classLevel <= 8) {
      return `Early intervention is crucial for Class ${classLevel} students at ${riskLevel.toLowerCase()} risk to prevent long-term academic disengagement`
    } else if (classLevel <= 10) {
      return `Class ${classLevel} students at ${riskLevel.toLowerCase()} risk are at a critical transition point requiring focused support`
    } else {
      return `Senior students (Class ${classLevel}) at ${riskLevel.toLowerCase()} risk need immediate intervention to ensure graduation and future success`
    }
  }

  /**
   * Get risk level color and styling information
   */
  getRiskStyling(riskLevel: string) {
    const styles = {
      'Critical': {
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        icon: '🚨',
        urgency: 'CRITICAL'
      },
      'High': {
        color: 'text-orange-800',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        icon: '⚠️',
        urgency: 'HIGH'
      },
      'Medium': {
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        icon: '⚡',
        urgency: 'MEDIUM'
      },
      'Low': {
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        icon: '✅',
        urgency: 'LOW'
      }
    }

    return styles[riskLevel as keyof typeof styles] || styles['Low']
  }

  /**
   * Generate intervention timeline based on risk level
   */
  getInterventionTimeline(riskLevel: string) {
    const timelines = {
      'Critical': {
        immediate: 'Within 24 hours',
        shortTerm: 'Within 1 week',
        mediumTerm: 'Within 2 weeks',
        longTerm: 'Ongoing monitoring'
      },
      'High': {
        immediate: 'Within 48 hours',
        shortTerm: 'Within 1 week',
        mediumTerm: 'Within 2-3 weeks',
        longTerm: 'Monthly monitoring'
      },
      'Medium': {
        immediate: 'Within 1 week',
        shortTerm: 'Within 2 weeks',
        mediumTerm: 'Within 1 month',
        longTerm: 'Quarterly monitoring'
      },
      'Low': {
        immediate: 'Within 2 weeks',
        shortTerm: 'Within 1 month',
        mediumTerm: 'Within 2 months',
        longTerm: 'Semester monitoring'
      }
    }

    return timelines[riskLevel as keyof typeof timelines] || timelines['Low']
  }
}

// Export singleton instance
export const riskExplanationService = new RiskExplanationService()
