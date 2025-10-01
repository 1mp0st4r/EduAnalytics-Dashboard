// Historical Analytics Service for EduAnalytics
// Provides trend analysis and historical data processing

interface HistoricalData {
  studentId: string
  date: string
  attendance: number
  performance: number
  riskScore: number
  riskLevel: string
}

interface TrendAnalysis {
  period: string
  trend: 'improving' | 'declining' | 'stable'
  change: number
  significance: 'high' | 'medium' | 'low'
}

interface StudentAnalytics {
  studentId: string
  currentMetrics: {
    attendance: number
    performance: number
    riskScore: number
    riskLevel: string
  }
  trends: {
    attendance: TrendAnalysis
    performance: TrendAnalysis
    riskScore: TrendAnalysis
  }
  insights: string[]
  recommendations: string[]
}

export class AnalyticsService {
  private historicalData: HistoricalData[] = []

  constructor() {
    // Initialize with some sample historical data
    this.initializeSampleData()
  }

  /**
   * Initialize sample historical data for demonstration
   */
  private initializeSampleData() {
    const baseDate = new Date()
    const sampleData: HistoricalData[] = []

    // Generate 30 days of historical data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - i)
      
      sampleData.push({
        studentId: 'RJ_2025',
        date: date.toISOString().split('T')[0],
        attendance: Math.max(60, 85 - Math.random() * 20 + (30 - i) * 0.3),
        performance: Math.max(40, 70 - Math.random() * 15 + (30 - i) * 0.2),
        riskScore: Math.max(20, 80 - Math.random() * 30 - (30 - i) * 0.5),
        riskLevel: this.calculateRiskLevel(Math.max(20, 80 - Math.random() * 30 - (30 - i) * 0.5))
      })
    }

    this.historicalData = sampleData
  }

  /**
   * Get comprehensive analytics for a student
   */
  async getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
    const studentData = this.historicalData.filter(d => d.studentId === studentId)
    
    if (studentData.length === 0) {
      throw new Error(`No historical data found for student ${studentId}`)
    }

    // Get current metrics (latest data)
    const current = studentData[studentData.length - 1]
    
    // Calculate trends
    const attendanceTrend = this.calculateTrend(studentData.map(d => d.attendance))
    const performanceTrend = this.calculateTrend(studentData.map(d => d.performance))
    const riskTrend = this.calculateTrend(studentData.map(d => d.riskScore))

    // Generate insights and recommendations
    const insights = this.generateInsights(current, attendanceTrend, performanceTrend, riskTrend)
    const recommendations = this.generateRecommendations(current, attendanceTrend, performanceTrend, riskTrend)

    return {
      studentId,
      currentMetrics: {
        attendance: Math.round(current.attendance),
        performance: Math.round(current.performance),
        riskScore: Math.round(current.riskScore),
        riskLevel: current.riskLevel
      },
      trends: {
        attendance: attendanceTrend,
        performance: performanceTrend,
        riskScore: riskTrend
      },
      insights,
      recommendations
    }
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(values: number[]): TrendAnalysis {
    if (values.length < 2) {
      return {
        period: 'insufficient_data',
        trend: 'stable',
        change: 0,
        significance: 'low'
      }
    }

    // Calculate simple linear trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    const change = secondAvg - firstAvg
    const changePercent = Math.abs(change / firstAvg) * 100

    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    let significance: 'high' | 'medium' | 'low' = 'low'

    if (Math.abs(change) > 5) { // Significant change threshold
      trend = change > 0 ? 'improving' : 'declining'
      significance = changePercent > 15 ? 'high' : changePercent > 8 ? 'medium' : 'low'
    }

    return {
      period: `${values.length} days`,
      trend,
      change: Math.round(change * 10) / 10,
      significance
    }
  }

  /**
   * Generate insights based on current metrics and trends
   */
  private generateInsights(
    current: HistoricalData,
    attendanceTrend: TrendAnalysis,
    performanceTrend: TrendAnalysis,
    riskTrend: TrendAnalysis
  ): string[] {
    const insights: string[] = []

    // Attendance insights
    if (current.attendance < 75) {
      insights.push(`Attendance is below recommended level (${Math.round(current.attendance)}%)`)
    } else if (current.attendance > 90) {
      insights.push(`Excellent attendance maintained (${Math.round(current.attendance)}%)`)
    }

    if (attendanceTrend.trend === 'improving') {
      insights.push(`Attendance is showing improvement (+${attendanceTrend.change}%)`)
    } else if (attendanceTrend.trend === 'declining') {
      insights.push(`Attendance trend is concerning (${attendanceTrend.change}%)`)
    }

    // Performance insights
    if (current.performance < 60) {
      insights.push(`Academic performance needs attention (${Math.round(current.performance)}%)`)
    } else if (current.performance > 80) {
      insights.push(`Strong academic performance (${Math.round(current.performance)}%)`)
    }

    if (performanceTrend.trend === 'improving') {
      insights.push(`Academic performance is improving (+${performanceTrend.change}%)`)
    } else if (performanceTrend.trend === 'declining') {
      insights.push(`Academic performance is declining (${performanceTrend.change}%)`)
    }

    // Risk insights
    if (current.riskScore > 70) {
      insights.push(`High dropout risk detected (${current.riskLevel})`)
    } else if (current.riskScore < 40) {
      insights.push(`Low dropout risk - student is on track`)
    }

    if (riskTrend.trend === 'declining') {
      insights.push(`Risk level is decreasing - positive trend`)
    } else if (riskTrend.trend === 'improving' && current.riskScore > 60) {
      insights.push(`Risk level is increasing - intervention needed`)
    }

    return insights
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    current: HistoricalData,
    attendanceTrend: TrendAnalysis,
    performanceTrend: TrendAnalysis,
    riskTrend: TrendAnalysis
  ): string[] {
    const recommendations: string[] = []

    // Attendance recommendations
    if (current.attendance < 75 || attendanceTrend.trend === 'declining') {
      recommendations.push('Implement attendance monitoring and family communication')
      recommendations.push('Schedule regular check-ins with student and parents')
    }

    // Performance recommendations
    if (current.performance < 60 || performanceTrend.trend === 'declining') {
      recommendations.push('Provide additional academic support and tutoring')
      recommendations.push('Review study habits and learning environment')
    }

    // Risk-based recommendations
    if (current.riskScore > 70) {
      recommendations.push('Activate high-priority intervention program')
      recommendations.push('Assign dedicated mentor for daily check-ins')
      recommendations.push('Involve family in support plan')
    } else if (current.riskScore > 50) {
      recommendations.push('Schedule weekly mentor meetings')
      recommendations.push('Monitor attendance and performance closely')
    }

    // Trend-based recommendations
    if (riskTrend.trend === 'improving' && current.riskScore > 60) {
      recommendations.push('Increase intervention intensity')
      recommendations.push('Consider alternative learning approaches')
    }

    if (attendanceTrend.trend === 'improving' && performanceTrend.trend === 'improving') {
      recommendations.push('Continue current support strategies')
      recommendations.push('Consider advanced learning opportunities')
    }

    return recommendations
  }

  /**
   * Get historical data for a student
   */
  async getHistoricalData(studentId: string, days: number = 30): Promise<HistoricalData[]> {
    const studentData = this.historicalData.filter(d => d.studentId === studentId)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return studentData.filter(d => new Date(d.date) >= cutoffDate)
  }

  /**
   * Add new data point to historical records
   */
  async addDataPoint(data: HistoricalData): Promise<void> {
    this.historicalData.push(data)
    // In a real implementation, this would save to database
  }

  /**
   * Calculate risk level from score
   */
  private calculateRiskLevel(score: number): string {
    if (score >= 80) return 'Critical'
    if (score >= 60) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }

  /**
   * Get class-level analytics
   */
  async getClassAnalytics(classLevel: string): Promise<{
    averageAttendance: number
    averagePerformance: number
    averageRiskScore: number
    atRiskStudents: number
    totalStudents: number
  }> {
    // This would typically query database for class data
    // For now, return sample data
    return {
      averageAttendance: 78,
      averagePerformance: 65,
      averageRiskScore: 45,
      atRiskStudents: 12,
      totalStudents: 45
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
