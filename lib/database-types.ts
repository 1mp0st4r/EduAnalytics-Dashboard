export interface Student {
  StudentID: string
  DateOfBirth: Date
  Gender: "Male" | "Female" | "Other"
  AccommodationType: "Hostel" | "DayScholar" | "Rented"
  IsRural: boolean
  CommuteTimeMinutes: number
  CasteCategory: "General" | "OBC" | "SC" | "ST" | "Other"
  AdmissionQuota: "General" | "OBC" | "SC" | "ST" | "EWS" | "Other"
  FamilyAnnualIncome: number
  NumberOfSiblings: number
  FatherEducation:
    | "No Formal Education"
    | "Primary (Up to 5th)"
    | "Middle (Up to 8th)"
    | "High School (10th)"
    | "Senior Secondary (12th)"
    | "Graduate"
    | "Post Graduate"
    | "Doctorate"
  IsFatherLiterate: boolean
  MotherEducation:
    | "No Formal Education"
    | "Primary (Up to 5th)"
    | "Middle (Up to 8th)"
    | "High School (10th)"
    | "Senior Secondary (12th)"
    | "Graduate"
    | "Post Graduate"
    | "Doctorate"
  IsMotherLiterate: boolean
  IsFirstGenerationLearner: boolean
  WorksPartTime: boolean
  IsPreparingCompetitiveExam: boolean
  HasOwnLaptop: boolean
  HasReliableInternet: boolean
}

export interface EducationalHistory {
  HistoryID: number
  StudentID: string
  Qualification: string
  MediumOfInstruction: string
  MarksPercentage: number
}

export interface AcademicRecord {
  RecordID: number
  StudentID: string
  Term: number
  SubjectName: string
  MarksObtained: number
  MaxMarks: number
}

export interface Attendance {
  AttendanceID: number
  StudentID: string
  Term: number
  SubjectName: string
  AttendancePercentage: number
}

export interface StudentStatusRecord {
  StatusID: number
  StudentID: string
  IsDropout: boolean
  StatusDate: Date
  Reason?: string
}

export interface StudentAnalytics {
  StudentID: string
  // Demographic
  Age: number
  Gender: "Male" | "Female" | "Other"
  AccommodationType: "Hostel" | "DayScholar" | "Rented"
  IsRural: boolean
  CommuteTimeMinutes: number

  // Socio-Economic
  CasteCategory: "General" | "OBC" | "SC" | "ST" | "Other"
  AdmissionQuota: "General" | "OBC" | "SC" | "ST" | "EWS" | "Other"
  FamilyAnnualIncome: number
  NumberOfSiblings: number
  FatherEducation: string
  IsFatherLiterate: boolean
  MotherEducation: string
  IsMotherLiterate: boolean
  IsFirstGenerationLearner: boolean

  // Academic (Engineered Features)
  AvgPastPerformance: number
  MediumChanged: boolean
  AvgMarks_LatestTerm: number
  MarksTrend: number
  FailureRate_LatestTerm: number

  // Behavioral
  AvgAttendance_LatestTerm: number
  WorksPartTime: boolean
  IsPreparingCompetitiveExam: boolean
  HasOwnLaptop: boolean
  HasReliableInternet: boolean

  // Target Variable
  IsDropout: boolean

  // Risk Score (Calculated)
  RiskScore: number
  RiskLevel: "Low" | "Medium" | "High" | "Critical"
}
