"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import StudentAnalyzer from "../components/student-analyzer"
import PredictiveAnalytics from "../components/predictive-analytics"

export default function AIAnalyticsPage() {
  // Mock student data for demonstration
  const mockStudentData = {
    id: "STU001",
    name: "राहुल शर्मा / Rahul Sharma",
    class: "10",
    attendance: 65,
    performance: 58,
    familyIncome: "low" as const,
    parentEducation: "primary" as const,
    location: "rural" as const,
    previousDropouts: 0,
    extracurricular: false,
    mentorInteractions: 3,
    issuesReported: ["पारिवारिक दबाव / Family Pressure", "आर्थिक समस्या / Financial Issue"],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-balance">AI विश्लेषण केंद्र / AI Analytics Center</h1>
              <p className="text-sm text-muted-foreground">
                उन्नत छात्र विश्लेषण और भविष्यवाणी / Advanced student analysis and predictions
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">व्यक्तिगत विश्लेषण / Individual Analysis</TabsTrigger>
            <TabsTrigger value="predictive">भविष्यवाणी विश्लेषण / Predictive Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <StudentAnalyzer studentData={mockStudentData} />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
