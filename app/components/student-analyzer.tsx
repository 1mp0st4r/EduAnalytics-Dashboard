"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Brain, TrendingDown, AlertTriangle, CheckCircle, Target, Lightbulb } from "lucide-react"

interface StudentData {
  id: string
  name: string
  class: string
  attendance: number
  performance: number
  familyIncome: "low" | "medium" | "high"
  parentEducation: "primary" | "secondary" | "higher"
  location: "rural" | "urban"
  previousDropouts: number
  extracurricular: boolean
  mentorInteractions: number
  issuesReported: string[]
}

interface StudentAnalyzerProps {
  studentData: StudentData
}

export default function StudentAnalyzer({ studentData }: StudentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  // AI Analysis Algorithm - simulates ML model predictions
  const analyzeStudent = () => {
    setIsAnalyzing(true)

    // Simulate API call delay
    setTimeout(() => {
      const riskFactors = calculateRiskFactors(studentData)
      const dropoutProbability = calculateDropoutProbability(riskFactors)
      const recommendations = generateRecommendations(riskFactors, studentData)
      const interventions = suggestInterventions(riskFactors, studentData)

      setAnalysis({
        riskFactors,
        dropoutProbability,
        recommendations,
        interventions,
        riskLevel: dropoutProbability > 70 ? "high" : dropoutProbability > 40 ? "medium" : "low",
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const calculateRiskFactors = (data: StudentData) => {
    const factors = []

    // Attendance risk
    if (data.attendance < 60) {
      factors.push({
        factor: "कम उपस्थिति / Low Attendance",
        severity: "high",
        impact: 25,
        description: `केवल ${data.attendance}% उपस्थिति, जो चिंताजनक है / Only ${data.attendance}% attendance, which is concerning`,
      })
    } else if (data.attendance < 80) {
      factors.push({
        factor: "अनियमित उपस्थिति / Irregular Attendance",
        severity: "medium",
        impact: 15,
        description: `${data.attendance}% उपस्थिति में सुधार की आवश्यकता / ${data.attendance}% attendance needs improvement`,
      })
    }

    // Performance risk
    if (data.performance < 50) {
      factors.push({
        factor: "कम शैक्षणिक प्रदर्शन / Poor Academic Performance",
        severity: "high",
        impact: 30,
        description: `${data.performance}% प्रदर्शन, तत्काल सहायता चाहिए / ${data.performance}% performance, needs immediate help`,
      })
    } else if (data.performance < 70) {
      factors.push({
        factor: "औसत प्रदर्शन / Average Performance",
        severity: "medium",
        impact: 10,
        description: `${data.performance}% प्रदर्शन में सुधार संभव / ${data.performance}% performance can be improved`,
      })
    }

    // Socio-economic factors
    if (data.familyIncome === "low") {
      factors.push({
        factor: "आर्थिक कठिनाई / Financial Hardship",
        severity: "high",
        impact: 20,
        description: "कम पारिवारिक आय, छात्रवृत्ति की आवश्यकता / Low family income, scholarship needed",
      })
    }

    if (data.parentEducation === "primary") {
      factors.push({
        factor: "अभिभावकों की कम शिक्षा / Low Parental Education",
        severity: "medium",
        impact: 15,
        description: "घर में शैक्षणिक सहायता सीमित / Limited academic support at home",
      })
    }

    if (data.location === "rural") {
      factors.push({
        factor: "ग्रामीण क्षेत्र / Rural Location",
        severity: "medium",
        impact: 10,
        description: "सीमित संसाधन और अवसर / Limited resources and opportunities",
      })
    }

    // Issues reported
    if (data.issuesReported.includes("पारिवारिक दबाव / Family Pressure")) {
      factors.push({
        factor: "पारिवारिक दबाव / Family Pressure",
        severity: "high",
        impact: 25,
        description: "परिवार से पढ़ाई छोड़ने का दबाव / Family pressure to quit studies",
      })
    }

    if (data.issuesReported.includes("आर्थिक समस्या / Financial Issue")) {
      factors.push({
        factor: "आर्थिक संकट / Financial Crisis",
        severity: "high",
        impact: 30,
        description: "तत्काल आर्थिक सहायता की आवश्यकता / Immediate financial assistance needed",
      })
    }

    return factors
  }

  const calculateDropoutProbability = (riskFactors: any[]) => {
    const totalImpact = riskFactors.reduce((sum, factor) => sum + factor.impact, 0)
    return Math.min(totalImpact, 95) // Cap at 95%
  }

  const generateRecommendations = (riskFactors: any[], data: StudentData) => {
    const recommendations = []

    // Attendance-based recommendations
    if (data.attendance < 80) {
      recommendations.push({
        category: "उपस्थिति सुधार / Attendance Improvement",
        action: "दैनिक उपस्थिति ट्रैकिंग और प्रेरणा कार्यक्रम / Daily attendance tracking and motivation program",
        priority: "high",
        timeline: "तत्काल / Immediate",
      })
    }

    // Performance-based recommendations
    if (data.performance < 70) {
      recommendations.push({
        category: "शैक्षणिक सहायता / Academic Support",
        action: "व्यक्तिगत ट्यूटरिंग और अतिरिक्त कक्षाएं / Personal tutoring and extra classes",
        priority: "high",
        timeline: "1-2 सप्ताह / 1-2 weeks",
      })
    }

    // Financial support
    if (data.familyIncome === "low") {
      recommendations.push({
        category: "आर्थिक सहायता / Financial Aid",
        action: "छात्रवृत्ति और मुफ्त भोजन योजना / Scholarship and free meal program",
        priority: "high",
        timeline: "तत्काल / Immediate",
      })
    }

    // Family engagement
    if (data.parentEducation === "primary") {
      recommendations.push({
        category: "पारिवारिक सहयोग / Family Engagement",
        action: "अभिभावक शिक्षा कार्यक्रम / Parent education program",
        priority: "medium",
        timeline: "1 महीना / 1 month",
      })
    }

    return recommendations
  }

  const suggestInterventions = (riskFactors: any[], data: StudentData) => {
    const interventions = []

    // High-risk interventions
    if (riskFactors.some((f) => f.severity === "high")) {
      interventions.push({
        type: "तत्काल हस्तक्षेप / Immediate Intervention",
        actions: [
          "साप्ताहिक मेंटर मीटिंग / Weekly mentor meetings",
          "अभिभावक-शिक्षक बैठक / Parent-teacher conference",
          "व्यक्तिगत सहायता योजना / Individual support plan",
        ],
        duration: "3 महीने / 3 months",
      })
    }

    // Medium-risk interventions
    if (riskFactors.some((f) => f.severity === "medium")) {
      interventions.push({
        type: "निवारक उपाय / Preventive Measures",
        actions: [
          "मासिक प्रगति समीक्षा / Monthly progress review",
          "सहपाठी सहायता समूह / Peer support group",
          "कौशल विकास कार्यक्रम / Skill development program",
        ],
        duration: "6 महीने / 6 months",
      })
    }

    // Long-term support
    interventions.push({
      type: "दीर्घकालिक सहायता / Long-term Support",
      actions: [
        "करियर मार्गदर्शन / Career guidance",
        "व्यावसायिक प्रशिक्षण / Vocational training",
        "समुदायिक सहायता नेटवर्क / Community support network",
      ],
      duration: "1 वर्ष / 1 year",
    })

    return interventions
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">कम जोखिम / Low Risk</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">मध्यम जोखिम / Medium Risk</Badge>
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200">उच्च जोखिम / High Risk</Badge>
      default:
        return null
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "medium":
        return <TrendingDown className="w-4 h-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI छात्र विश्लेषण / AI Student Analysis
          </CardTitle>
          <CardDescription>
            उन्नत एल्गोरिदम का उपयोग करके छात्र के ड्रॉपआउट जोखिम का विश्लेषण / Advanced algorithm analysis of student dropout
            risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="text-center py-8">
              <Button onClick={analyzeStudent} disabled={isAnalyzing} size="lg" className="px-8">
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    विश्लेषण हो रहा है... / Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    AI विश्लेषण शुरू करें / Start AI Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Risk Assessment */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">ड्रॉपआउट संभावना / Dropout Probability</h3>
                  <p className="text-sm text-muted-foreground">AI मॉडल की भविष्यवाणी / AI model prediction</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-2">{analysis.dropoutProbability}%</div>
                  {getRiskBadge(analysis.riskLevel)}
                </div>
              </div>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">जोखिम कारक / Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.riskFactors.map((factor: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        {getSeverityIcon(factor.severity)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{factor.factor}</h4>
                            <span className="text-sm font-semibold">{factor.impact}% प्रभाव / impact</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                          <Progress value={factor.impact} className="h-1 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    AI सुझाव / AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{rec.category}</h4>
                          <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                            {rec.priority === "high"
                              ? "उच्च प्राथमिकता / High Priority"
                              : "मध्यम प्राथमिकता / Medium Priority"}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{rec.action}</p>
                        <p className="text-xs text-muted-foreground">समयसीमा / Timeline: {rec.timeline}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interventions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-secondary" />
                    सुझाए गए हस्तक्षेप / Suggested Interventions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.interventions.map((intervention: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{intervention.type}</h4>
                        <ul className="space-y-1 mb-2">
                          {intervention.actions.map((action: string, actionIndex: number) => (
                            <li key={actionIndex} className="text-sm flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground">अवधि / Duration: {intervention.duration}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
