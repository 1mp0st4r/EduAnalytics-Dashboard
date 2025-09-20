"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Users, AlertTriangle, Brain, Target } from "lucide-react"

export default function PredictiveAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months")
  const [predictions, setPredictions] = useState<any>(null)

  // Mock predictive data - in real app, this would come from ML models
  const mockPredictions = {
    "6months": {
      totalAtRisk: 156,
      highRisk: 45,
      mediumRisk: 67,
      lowRisk: 44,
      trendDirection: "increasing",
      confidence: 87,
      monthlyPredictions: [
        { month: "जन / Jan", predicted: 12, actual: 10, prevented: 8 },
        { month: "फर / Feb", predicted: 15, actual: 13, prevented: 10 },
        { month: "मार / Mar", predicted: 18, actual: 16, prevented: 12 },
        { month: "अप्र / Apr", predicted: 22, actual: 19, prevented: 15 },
        { month: "मई / May", predicted: 25, actual: null, prevented: null },
        { month: "जून / Jun", predicted: 28, actual: null, prevented: null },
      ],
      riskFactorDistribution: [
        { factor: "आर्थिक / Financial", value: 35, color: "#ef4444" },
        { factor: "शैक्षणिक / Academic", value: 28, color: "#f97316" },
        { factor: "पारिवारिक / Family", value: 22, color: "#eab308" },
        { factor: "सामाजिक / Social", value: 15, color: "#22c55e" },
      ],
      interventionSuccess: [
        { intervention: "मेंटरिंग / Mentoring", success: 78, total: 120 },
        { intervention: "आर्थिक सहायता / Financial Aid", success: 85, total: 95 },
        { intervention: "ट्यूटरिंग / Tutoring", success: 72, total: 150 },
        { intervention: "पारिवारिक सहयोग / Family Support", success: 68, total: 80 },
      ],
    },
  }

  useEffect(() => {
    // Simulate API call to get predictions
    setTimeout(() => {
      setPredictions(mockPredictions[selectedTimeframe as keyof typeof mockPredictions])
    }, 1000)
  }, [selectedTimeframe])

  const getTrendIcon = (direction: string) => {
    return direction === "increasing" ? (
      <TrendingUp className="w-4 h-4 text-red-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-green-500" />
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (!predictions) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
              <p>भविष्यवाणी मॉडल लोड हो रहा है... / Loading prediction model...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            भविष्यवाणी विश्लेषण / Predictive Analytics
          </CardTitle>
          <CardDescription>
            AI-आधारित ड्रॉपआउट भविष्यवाणी और रुझान विश्लेषण / AI-based dropout prediction and trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: "3months", label: "3 महीने / 3 Months" },
              { value: "6months", label: "6 महीने / 6 Months" },
              { value: "1year", label: "1 वर्ष / 1 Year" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={selectedTimeframe === option.value ? "default" : "outline"}
                onClick={() => setSelectedTimeframe(option.value)}
                className={selectedTimeframe !== option.value ? "bg-transparent" : ""}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              कुल जोखिम में / Total At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{predictions.totalAtRisk}</div>
              <div className="flex items-center gap-1">
                {getTrendIcon(predictions.trendDirection)}
                <span className="text-sm text-muted-foreground">
                  {predictions.trendDirection === "increasing" ? "बढ़ रहा / Increasing" : "घट रहा / Decreasing"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              उच्च जोखिम / High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{predictions.highRisk}</div>
            <Progress value={(predictions.highRisk / predictions.totalAtRisk) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-500" />
              मध्यम जोखिम / Medium Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{predictions.mediumRisk}</div>
            <Progress value={(predictions.mediumRisk / predictions.totalAtRisk) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              मॉडल विश्वसनीयता / Model Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getConfidenceColor(predictions.confidence)}`}>
              {predictions.confidence}%
            </div>
            <Progress value={predictions.confidence} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Predictions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>मासिक ड्रॉपआउट भविष्यवाणी / Monthly Dropout Predictions</CardTitle>
          <CardDescription>
            भविष्यवाणी बनाम वास्तविक और रोकथाम के आंकड़े / Predicted vs Actual and Prevention data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictions.monthlyPredictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "predicted"
                      ? "भविष्यवाणी / Predicted"
                      : name === "actual"
                        ? "वास्तविक / Actual"
                        : "रोका गया / Prevented",
                  ]}
                />
                <Bar dataKey="predicted" fill="#ef4444" name="predicted" />
                <Bar dataKey="actual" fill="#f97316" name="actual" />
                <Bar dataKey="prevented" fill="#22c55e" name="prevented" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factor Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>जोखिम कारक वितरण / Risk Factor Distribution</CardTitle>
            <CardDescription>मुख्य ड्रॉपआउट कारकों का विश्लेषण / Analysis of main dropout factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={predictions.riskFactorDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ factor, value }) => `${factor}: ${value}%`}
                  >
                    {predictions.riskFactorDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Intervention Success Rates */}
        <Card>
          <CardHeader>
            <CardTitle>हस्तक्षेप सफलता दर / Intervention Success Rates</CardTitle>
            <CardDescription>विभिन्न हस्तक्षेपों की प्रभावशीलता / Effectiveness of different interventions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.interventionSuccess.map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.intervention}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.success}/{item.total} ({Math.round((item.success / item.total) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(item.success / item.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-l-4 border-l-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-secondary" />
            AI अंतर्दृष्टि / AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">चेतावनी / Warning</h4>
              <p className="text-sm text-red-800">
                अगले 3 महीनों में ड्रॉपआउट दर में 15% की वृद्धि का अनुमान है। तत्काल हस्तक्षेप की आवश्यकता है। / Dropout rate is
                predicted to increase by 15% in the next 3 months. Immediate intervention required.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">सुझाव / Recommendation</h4>
              <p className="text-sm text-yellow-800">
                आर्थिक सहायता कार्यक्रम सबसे प्रभावी हस्तक्षेप है (85% सफलता दर)। इसका विस्तार करने पर विचार करें। / Financial aid
                program is the most effective intervention (85% success rate). Consider expanding it.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">सकारात्मक रुझान / Positive Trend</h4>
              <p className="text-sm text-green-800">
                मेंटरिंग कार्यक्रम के कारण मध्यम जोखिम वाले छात्रों में 12% सुधार देखा गया है। / 12% improvement observed in
                medium-risk students due to mentoring program.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
