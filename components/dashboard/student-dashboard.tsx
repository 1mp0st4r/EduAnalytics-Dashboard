"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  MessageCircle,
  User,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  LogOut,
  Send,
  CheckCircle,
  Clock,
  Target,
  Heart,
} from "lucide-react"

interface StudentDashboardProps {
  user: any
  onLogout: () => void
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [feedbackText, setFeedbackText] = useState("")
  const [selectedIssue, setSelectedIssue] = useState("")

  // Mock student data - in real app, this would come from API
  const studentData = {
    name: "राहुल शर्मा / Rahul Sharma",
    class: "10वीं / 10th Grade",
    school: "सरकारी उच्च माध्यमिक विद्यालय / Govt. Higher Secondary School",
    attendance: 78,
    performance: 72,
    riskLevel: "medium",
    mentor: {
      name: "प्रिया सिंह / Priya Singh",
      phone: "+91 98765 43210",
      email: "priya.singh@edusupport.gov.in",
    },
    recentGrades: [
      { subject: "गणित / Math", grade: "B+", score: 78 },
      { subject: "विज्ञान / Science", grade: "A-", score: 85 },
      { subject: "हिंदी / Hindi", grade: "B", score: 72 },
      { subject: "अंग्रेजी / English", grade: "C+", score: 68 },
      { subject: "सामाजिक विज्ञान / Social Science", grade: "B+", score: 80 },
    ],
    aiSummary:
      "राहुल एक मेधावी छात्र है जो गणित और विज्ञान में अच्छा प्रदर्शन कर रहा है। हालांकि, उसकी उपस्थिति में कमी चिंता का विषय है। पारिवारिक आर्थिक स्थिति के कारण वह कभी-कभी स्कूल नहीं आ पाता।",
    proposedSolutions: [
      "नियमित उपस्थिति के लिए प्रेरणा कार्यक्रम में भाग लें",
      "गणित और विज्ञान में अपनी मजबूती का फायदा उठाकर अन्य विषयों में सुधार करें",
      "आर्थिक सहायता के लिए छात्रवृत्ति योजनाओं की जानकारी लें",
      "अंग्रेजी भाषा के लिए अतिरिक्त अभ्यास करें",
    ],
  }

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim() || !selectedIssue) {
      alert("कृपया समस्या का प्रकार चुनें और विवरण दें / Please select issue type and provide details")
      return
    }

    // Mock API call - in real app, this would save to database
    console.log("Feedback submitted:", { issue: selectedIssue, details: feedbackText })
    alert(
      "आपकी समस्या दर्ज की गई है। आपके मेंटर को सूचना भेज दी गई है। / Your issue has been recorded. Your mentor has been notified.",
    )
    setFeedbackText("")
    setSelectedIssue("")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-balance">स्वागत है / Welcome, {studentData.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {studentData.class} • {studentData.school}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              लॉग आउट / Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              अवलोकन / Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              प्रदर्शन / Performance
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              मेंटर / Mentor
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              सहायता / Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* AI Summary Card */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  आपके बारे में AI विश्लेषण / AI Analysis About You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed mb-4">{studentData.aiSummary}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">ड्रॉपआउट जोखिम स्तर / Dropout Risk Level:</span>
                  {getRiskBadge(studentData.riskLevel)}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    उपस्थिति / Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{studentData.attendance}%</span>
                      <Badge variant={studentData.attendance >= 80 ? "default" : "destructive"}>
                        {studentData.attendance >= 80 ? "अच्छा / Good" : "सुधार चाहिए / Needs Improvement"}
                      </Badge>
                    </div>
                    <Progress value={studentData.attendance} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    समग्र प्रदर्शन / Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{studentData.performance}%</span>
                      <Badge variant={studentData.performance >= 75 ? "default" : "secondary"}>
                        {studentData.performance >= 75 ? "अच्छा / Good" : "औसत / Average"}
                      </Badge>
                    </div>
                    <Progress value={studentData.performance} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    इस महीने के लक्ष्य / This Month's Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3" />
                      85% उपस्थिति / 85% Attendance
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-3 h-3" />
                      अंग्रेजी में सुधार / Improve English
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-3 h-3" />
                      सभी असाइनमेंट पूरे करें / Complete all assignments
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Proposed Solutions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                  आपके लिए सुझाव / Suggestions for You
                </CardTitle>
                <CardDescription>
                  आपके प्रदर्शन के आधार पर ये सुझाव दिए गए हैं / These suggestions are based on your performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentData.proposedSolutions.map((solution, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary-foreground">{index + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{solution}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>हाल के ग्रेड / Recent Grades</CardTitle>
                <CardDescription>आपके हाल के विषयवार अंक / Your recent subject-wise scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.recentGrades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{grade.subject}</p>
                          <p className="text-sm text-muted-foreground">Grade: {grade.grade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{grade.score}%</p>
                        <Progress value={grade.score} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  आपके मेंटर / Your Mentor
                </CardTitle>
                <CardDescription>
                  आपकी सहायता के लिए नियुक्त मेंटर से संपर्क करें / Contact your assigned mentor for assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{studentData.mentor.name}</h3>
                      <p className="text-sm text-muted-foreground">शिक्षा सलाहकार / Education Counselor</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="flex items-center gap-2 h-12" size="lg">
                      <Phone className="w-4 h-4" />
                      फोन करें / Call: {studentData.mentor.phone}
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 h-12 bg-transparent" size="lg">
                      <Mail className="w-4 h-4" />
                      ईमेल भेजें / Email: {studentData.mentor.email}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  समस्या रिपोर्ट करें / Report an Issue
                </CardTitle>
                <CardDescription>कोई भी कठिनाई हो तो यहाँ बताएं / Share any difficulties you're facing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>समस्या का प्रकार / Issue Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "पढ़ाई में कठिनाई / Study Difficulty",
                      "पारिवारिक दबाव / Family Pressure",
                      "आर्थिक समस्या / Financial Issue",
                      "अन्य / Other",
                    ].map((issue) => (
                      <Button
                        key={issue}
                        variant={selectedIssue === issue ? "default" : "outline"}
                        onClick={() => setSelectedIssue(issue)}
                        className="text-xs h-auto py-2 px-3 text-left"
                      >
                        {issue}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">विस्तार से बताएं / Provide Details</Label>
                  <Textarea
                    id="feedback"
                    placeholder="अपनी समस्या के बारे में विस्तार से बताएं... / Describe your issue in detail..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[120px] text-base"
                  />
                </div>

                <Button onClick={handleFeedbackSubmit} className="w-full flex items-center gap-2" size="lg">
                  <Send className="w-4 h-4" />
                  समस्या भेजें / Submit Issue
                </Button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">तत्काल सहायता / Immediate Help</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    यदि आपको तुरंत सहायता चाहिए तो इन नंबरों पर संपर्क करें / If you need immediate help, contact these numbers:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>हेल्पलाइन / Helpline:</strong> 1800-XXX-XXXX
                    </p>
                    <p>
                      <strong>आपातकाल / Emergency:</strong> {studentData.mentor.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
