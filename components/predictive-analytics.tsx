"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Brain,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"

interface ModelMetrics {
  name: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  status: "training" | "deployed" | "testing"
  lastTrained: string
}

interface PredictionResult {
  studentId: string
  name: string
  currentRisk: number
  predictedRisk: number
  dropoutProbability: number
  timeToDropout: number
  confidence: number
  factors: {
    academic: number
    behavioral: number
    financial: number
    social: number
  }
}

const modelMetrics: ModelMetrics[] = [
  {
    name: "Random Forest Classifier",
    accuracy: 87.3,
    precision: 89.1,
    recall: 85.7,
    f1Score: 87.4,
    auc: 91.2,
    status: "deployed",
    lastTrained: "2024-01-15",
  },
  {
    name: "Gradient Boosting",
    accuracy: 89.7,
    precision: 91.3,
    recall: 88.2,
    f1Score: 89.7,
    auc: 93.5,
    status: "deployed",
    lastTrained: "2024-01-20",
  },
  {
    name: "Neural Network",
    accuracy: 85.2,
    precision: 87.8,
    recall: 82.6,
    f1Score: 85.1,
    auc: 89.3,
    status: "testing",
    lastTrained: "2024-01-25",
  },
  {
    name: "Support Vector Machine",
    accuracy: 83.9,
    precision: 86.2,
    recall: 81.5,
    f1Score: 83.8,
    auc: 87.1,
    status: "training",
    lastTrained: "2024-01-28",
  },
]

const predictionTrends = [
  { month: "Jan", predicted: 45, actual: 42, accuracy: 93.3 },
  { month: "Feb", predicted: 52, actual: 48, accuracy: 92.3 },
  { month: "Mar", predicted: 38, actual: 41, accuracy: 92.7 },
  { month: "Apr", predicted: 61, actual: 58, accuracy: 95.1 },
  { month: "May", predicted: 47, actual: 44, accuracy: 93.6 },
  { month: "Jun", predicted: 55, actual: 52, accuracy: 94.5 },
  { month: "Jul", predicted: 49, actual: 47, accuracy: 95.9 },
]

const featureImportance = [
  { feature: "GPA Trend", importance: 0.28, category: "Academic" },
  { feature: "Attendance Rate", importance: 0.22, category: "Behavioral" },
  { feature: "Financial Aid Status", importance: 0.18, category: "Financial" },
  { feature: "Course Load", importance: 0.15, category: "Academic" },
  { feature: "Social Engagement", importance: 0.12, category: "Social" },
  { feature: "Previous Semester GPA", importance: 0.05, category: "Academic" },
]

const cohortPredictions = [
  { cohort: "2021", predicted: 8.5, actual: 9.2, total: 1250 },
  { cohort: "2022", predicted: 7.8, actual: 8.1, total: 1180 },
  { cohort: "2023", predicted: 6.9, actual: 7.3, total: 1320 },
  { cohort: "2024", predicted: 5.8, actual: null, total: 1247 },
]

const riskDistributionForecast = [
  { period: "Current", low: 924, medium: 234, high: 67, critical: 22 },
  { period: "1 Month", low: 918, medium: 241, high: 72, critical: 16 },
  { period: "3 Months", low: 905, medium: 255, high: 78, critical: 9 },
  { period: "6 Months", low: 892, medium: 268, high: 82, critical: 5 },
]

const mockPredictions: PredictionResult[] = [
  {
    studentId: "STU002",
    name: "Michael Chen",
    currentRisk: 85,
    predictedRisk: 92,
    dropoutProbability: 78,
    timeToDropout: 2.3,
    confidence: 89,
    factors: { academic: 85, behavioral: 75, financial: 90, social: 65 },
  },
  {
    studentId: "STU003",
    name: "Emily Rodriguez",
    currentRisk: 58,
    predictedRisk: 45,
    dropoutProbability: 35,
    timeToDropout: 5.2,
    confidence: 76,
    factors: { academic: 60, behavioral: 55, financial: 40, social: 70 },
  },
]

export default function PredictiveAnalytics() {
  const [selectedModel, setSelectedModel] = useState("Gradient Boosting")
  const [predictionHorizon, setPredictionHorizon] = useState([6])
  const [confidenceThreshold, setConfidenceThreshold] = useState([75])
  const [isRetraining, setIsRetraining] = useState(false)

  const currentModel = modelMetrics.find((m) => m.name === selectedModel)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-100 text-green-600"
      case "training":
        return "bg-blue-100 text-blue-600"
      case "testing":
        return "bg-yellow-100 text-yellow-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "deployed":
        return <CheckCircle className="h-4 w-4" />
      case "training":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "testing":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const retrainModel = async () => {
    setIsRetraining(true)
    // Simulate model retraining
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsRetraining(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics Dashboard</h2>
          <p className="text-gray-600">Advanced machine learning models for dropout prediction and forecasting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={retrainModel} disabled={isRetraining}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetraining ? "animate-spin" : ""}`} />
            {isRetraining ? "Retraining..." : "Retrain Models"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Predictions
          </Button>
        </div>
      </div>

      {/* Model Selection & Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-500" />
            Model Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="model-select">Active Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {modelMetrics.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      {model.name} ({model.accuracy}% accuracy)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="horizon-slider">Prediction Horizon (months): {predictionHorizon[0]}</Label>
              <Slider
                id="horizon-slider"
                min={1}
                max={12}
                step={1}
                value={predictionHorizon}
                onValueChange={setPredictionHorizon}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confidence-slider">Confidence Threshold: {confidenceThreshold[0]}%</Label>
              <Slider
                id="confidence-slider"
                min={50}
                max={95}
                step={5}
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modelMetrics.map((model, index) => (
          <Card key={index} className={selectedModel === model.name ? "ring-2 ring-blue-500" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{model.name}</h3>
                <Badge className={getStatusColor(model.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(model.status)}
                    {model.status}
                  </div>
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy:</span>
                  <span className="font-semibold">{model.accuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>F1-Score:</span>
                  <span className="font-semibold">{model.f1Score}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>AUC:</span>
                  <span className="font-semibold">{model.auc}%</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Accuracy Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Prediction Accuracy Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={predictionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="predicted" fill="#3B82F6" name="Predicted Dropouts" />
                  <Bar yAxisId="left" dataKey="actual" fill="#10B981" name="Actual Dropouts" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#EF4444"
                    strokeWidth={3}
                    name="Accuracy %"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Importance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Feature Importance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Importance"]} />
                  <Bar dataKey="importance" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Advanced Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="forecasting" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forecasting">Risk Forecasting</TabsTrigger>
              <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
              <TabsTrigger value="individual">Individual Predictions</TabsTrigger>
              <TabsTrigger value="model-comparison">Model Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="forecasting" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Risk Distribution Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={riskDistributionForecast}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="critical" stackId="1" stroke="#DC2626" fill="#DC2626" />
                          <Area type="monotone" dataKey="high" stackId="1" stroke="#EF4444" fill="#EF4444" />
                          <Area type="monotone" dataKey="medium" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                          <Area type="monotone" dataKey="low" stackId="1" stroke="#10B981" fill="#10B981" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Intervention Impact Simulation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">89</div>
                          <p className="text-sm text-gray-600">Without Intervention</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">34</div>
                          <p className="text-sm text-gray-600">With Intervention</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">62%</div>
                        <p className="text-sm text-gray-600">Predicted Reduction in Dropouts</p>
                      </div>
                      <Progress value={62} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cohort" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cohort Dropout Predictions vs Actuals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cohortPredictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cohort" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                        <Legend />
                        <Bar dataKey="predicted" fill="#3B82F6" name="Predicted %" />
                        <Bar dataKey="actual" fill="#10B981" name="Actual %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individual" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockPredictions.map((prediction, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{prediction.name}</span>
                        <Badge
                          className={
                            prediction.dropoutProbability >= 70
                              ? "bg-red-100 text-red-600"
                              : prediction.dropoutProbability >= 40
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
                          }
                        >
                          {prediction.dropoutProbability}% Risk
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{prediction.confidence}%</div>
                            <p className="text-xs text-gray-500">Confidence</p>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">{prediction.timeToDropout}m</div>
                            <p className="text-xs text-gray-500">Time to Risk</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Academic:</span>
                            <span>{prediction.factors.academic}%</span>
                          </div>
                          <Progress value={prediction.factors.academic} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Behavioral:</span>
                            <span>{prediction.factors.behavioral}%</span>
                          </div>
                          <Progress value={prediction.factors.behavioral} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Financial:</span>
                            <span>{prediction.factors.financial}%</span>
                          </div>
                          <Progress value={prediction.factors.financial} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Social:</span>
                            <span>{prediction.factors.social}%</span>
                          </div>
                          <Progress value={prediction.factors.social} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="model-comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Model Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={modelMetrics}>
                        <RadialBar
                          minAngle={15}
                          label={{ position: "insideStart", fill: "#fff" }}
                          background
                          clockWise
                          dataKey="accuracy"
                        />
                        <Legend iconSize={18} layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Model Details */}
      {currentModel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Active Model: {currentModel.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentModel.accuracy}%</div>
                <p className="text-sm text-gray-500">Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentModel.precision}%</div>
                <p className="text-sm text-gray-500">Precision</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentModel.recall}%</div>
                <p className="text-sm text-gray-500">Recall</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{currentModel.f1Score}%</div>
                <p className="text-sm text-gray-500">F1-Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{currentModel.auc}%</div>
                <p className="text-sm text-gray-500">AUC-ROC</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Last trained: {new Date(currentModel.lastTrained).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
