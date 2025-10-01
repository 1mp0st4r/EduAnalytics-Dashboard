"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation data
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.students': 'Students',
    'nav.analytics': 'Analytics',
    'nav.reports': 'Reports',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Landing Page
    'landing.title': 'EduAnalytics Dashboard',
    'landing.subtitle': 'Advanced Student Success Platform',
    'landing.description': 'Comprehensive educational analytics and dropout prediction system for institutions',
    'landing.getStarted': 'Get Started',
    'landing.learnMore': 'Learn More',
    'landing.features': 'Key Features',
    'landing.predictiveAnalytics': 'Predictive Analytics',
    'landing.predictiveAnalyticsDesc': 'AI-powered dropout risk assessment and early intervention',
    'landing.studentManagement': 'Student Management',
    'landing.studentManagementDesc': 'Comprehensive student data tracking and performance monitoring',
    'landing.realTimeAlerts': 'Real-time Alerts',
    'landing.realTimeAlertsDesc': 'Instant notifications for at-risk students and critical events',
    'landing.reporting': 'Advanced Reporting',
    'landing.reportingDesc': 'Detailed analytics and customizable reports for stakeholders',
    'landing.mentorSupport': 'Mentor Support',
    'landing.mentorSupportDesc': 'Tools for mentors to track and support student progress',
    'landing.aiChatbot': 'AI Chatbot',
    'landing.aiChatbotDesc': 'Intelligent assistant for student queries and support',
    
    // Dashboard
    'dashboard.welcome': 'Welcome to EduAnalytics',
    'dashboard.overview': 'Overview',
    'dashboard.totalStudents': 'Total Students',
    'dashboard.atRiskStudents': 'At-Risk Students',
    'dashboard.avgAttendance': 'Average Attendance',
    'dashboard.avgPerformance': 'Average Performance',
    'dashboard.recentAlerts': 'Recent Alerts',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.viewStudents': 'View Students',
    'dashboard.generateReport': 'Generate Report',
    'dashboard.sendNotification': 'Send Notification',
    'dashboard.viewAnalytics': 'View Analytics',
    
    // Students
    'students.title': 'Student Management',
    'students.search': 'Search students...',
    'students.filter': 'Filter by risk level',
    'students.addStudent': 'Add Student',
    'students.name': 'Name',
    'students.id': 'Student ID',
    'students.class': 'Class',
    'students.attendance': 'Attendance',
    'students.performance': 'Performance',
    'students.riskLevel': 'Risk Level',
    'students.actions': 'Actions',
    'students.view': 'View',
    'students.edit': 'Edit',
    'students.delete': 'Delete',
    
    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.overview': 'Overview',
    'analytics.riskDistribution': 'Risk Distribution',
    'analytics.attendanceTrends': 'Attendance Trends',
    'analytics.performanceMetrics': 'Performance Metrics',
    'analytics.predictiveInsights': 'Predictive Insights',
    
    // Reports
    'reports.title': 'Reports & Analytics',
    'reports.generate': 'Generate Reports',
    'reports.scheduled': 'Scheduled Reports',
    'reports.studentPerformance': 'Student Performance Report',
    'reports.riskAnalysis': 'Dropout Risk Analysis',
    'reports.attendanceSummary': 'Attendance Summary',
    'reports.mentorEffectiveness': 'Mentor Effectiveness Report',
    'reports.generateReport': 'Generate Report',
    'reports.download': 'Download',
    'reports.view': 'View',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.send': 'Send Notifications',
    'notifications.all': 'All Notifications',
    'notifications.unread': 'Unread',
    'notifications.urgent': 'Urgent',
    'notifications.markAllRead': 'Mark All Read',
    'notifications.sendNotification': 'Send Notification',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.preferences': 'Preferences',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    'settings.save': 'Save Changes',
    'settings.cancel': 'Cancel',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.refresh': 'Refresh',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.print': 'Print',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.status': 'Status',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.enabled': 'Enabled',
    'common.disabled': 'Disabled',
    'common.pending': 'Pending',
    'common.completed': 'Completed',
    'common.failed': 'Failed',
    'common.critical': 'Critical',
    'common.high': 'High',
    'common.medium': 'Medium',
    'common.low': 'Low',
    'common.urgent': 'Urgent',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.alert': 'Alert',
    'common.success': 'Success',
    'common.error': 'Error',
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.students': 'छात्र',
    'nav.analytics': 'विश्लेषण',
    'nav.reports': 'रिपोर्ट',
    'nav.notifications': 'सूचनाएं',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉगआउट',
    
    // Landing Page
    'landing.title': 'एजुएनालिटिक्स डैशबोर्ड',
    'landing.subtitle': 'उन्नत छात्र सफलता प्लेटफॉर्म',
    'landing.description': 'संस्थानों के लिए व्यापक शैक्षिक विश्लेषण और ड्रॉपआउट भविष्यवाणी प्रणाली',
    'landing.getStarted': 'शुरू करें',
    'landing.learnMore': 'और जानें',
    'landing.features': 'मुख्य विशेषताएं',
    'landing.predictiveAnalytics': 'भविष्यवाणी विश्लेषण',
    'landing.predictiveAnalyticsDesc': 'AI-संचालित ड्रॉपआउट जोखिम मूल्यांकन और प्रारंभिक हस्तक्षेप',
    'landing.studentManagement': 'छात्र प्रबंधन',
    'landing.studentManagementDesc': 'व्यापक छात्र डेटा ट्रैकिंग और प्रदर्शन निगरानी',
    'landing.realTimeAlerts': 'रियल-टाइम अलर्ट',
    'landing.realTimeAlertsDesc': 'जोखिम में छात्रों और महत्वपूर्ण घटनाओं के लिए तत्काल सूचनाएं',
    'landing.reporting': 'उन्नत रिपोर्टिंग',
    'landing.reportingDesc': 'हितधारकों के लिए विस्तृत विश्लेषण और अनुकूलन योग्य रिपोर्ट',
    'landing.mentorSupport': 'मेंटर सहायता',
    'landing.mentorSupportDesc': 'छात्र प्रगति को ट्रैक करने और समर्थन करने के लिए मेंटर के लिए उपकरण',
    'landing.aiChatbot': 'AI चैटबॉट',
    'landing.aiChatbotDesc': 'छात्र प्रश्नों और सहायता के लिए बुद्धिमान सहायक',
    
    // Dashboard
    'dashboard.welcome': 'एजुएनालिटिक्स में आपका स्वागत है',
    'dashboard.overview': 'अवलोकन',
    'dashboard.totalStudents': 'कुल छात्र',
    'dashboard.atRiskStudents': 'जोखिम में छात्र',
    'dashboard.avgAttendance': 'औसत उपस्थिति',
    'dashboard.avgPerformance': 'औसत प्रदर्शन',
    'dashboard.recentAlerts': 'हाल के अलर्ट',
    'dashboard.quickActions': 'त्वरित कार्य',
    'dashboard.viewStudents': 'छात्र देखें',
    'dashboard.generateReport': 'रिपोर्ट बनाएं',
    'dashboard.sendNotification': 'सूचना भेजें',
    'dashboard.viewAnalytics': 'विश्लेषण देखें',
    
    // Students
    'students.title': 'छात्र प्रबंधन',
    'students.search': 'छात्र खोजें...',
    'students.filter': 'जोखिम स्तर के अनुसार फिल्टर करें',
    'students.addStudent': 'छात्र जोड़ें',
    'students.name': 'नाम',
    'students.id': 'छात्र आईडी',
    'students.class': 'कक्षा',
    'students.attendance': 'उपस्थिति',
    'students.performance': 'प्रदर्शन',
    'students.riskLevel': 'जोखिम स्तर',
    'students.actions': 'कार्य',
    'students.view': 'देखें',
    'students.edit': 'संपादित करें',
    'students.delete': 'हटाएं',
    
    // Analytics
    'analytics.title': 'विश्लेषण डैशबोर्ड',
    'analytics.overview': 'अवलोकन',
    'analytics.riskDistribution': 'जोखिम वितरण',
    'analytics.attendanceTrends': 'उपस्थिति प्रवृत्तियां',
    'analytics.performanceMetrics': 'प्रदर्शन मेट्रिक्स',
    'analytics.predictiveInsights': 'भविष्यवाणी अंतर्दृष्टि',
    
    // Reports
    'reports.title': 'रिपोर्ट और विश्लेषण',
    'reports.generate': 'रिपोर्ट बनाएं',
    'reports.scheduled': 'निर्धारित रिपोर्ट',
    'reports.studentPerformance': 'छात्र प्रदर्शन रिपोर्ट',
    'reports.riskAnalysis': 'ड्रॉपआउट जोखिम विश्लेषण',
    'reports.attendanceSummary': 'उपस्थिति सारांश',
    'reports.mentorEffectiveness': 'मेंटर प्रभावशीलता रिपोर्ट',
    'reports.generateReport': 'रिपोर्ट बनाएं',
    'reports.download': 'डाउनलोड',
    'reports.view': 'देखें',
    
    // Notifications
    'notifications.title': 'सूचनाएं',
    'notifications.send': 'सूचनाएं भेजें',
    'notifications.all': 'सभी सूचनाएं',
    'notifications.unread': 'अपठित',
    'notifications.urgent': 'तत्काल',
    'notifications.markAllRead': 'सभी को पढ़ा हुआ मार्क करें',
    'notifications.sendNotification': 'सूचना भेजें',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.profile': 'प्रोफाइल',
    'settings.preferences': 'प्राथमिकताएं',
    'settings.language': 'भाषा',
    'settings.theme': 'थीम',
    'settings.notifications': 'सूचनाएं',
    'settings.save': 'परिवर्तन सहेजें',
    'settings.cancel': 'रद्द करें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.close': 'बंद करें',
    'common.yes': 'हां',
    'common.no': 'नहीं',
    'common.confirm': 'पुष्टि करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.clear': 'साफ करें',
    'common.apply': 'लागू करें',
    'common.reset': 'रीसेट',
    'common.refresh': 'रिफ्रेश',
    'common.export': 'निर्यात',
    'common.import': 'आयात',
    'common.download': 'डाउनलोड',
    'common.upload': 'अपलोड',
    'common.print': 'प्रिंट',
    'common.email': 'ईमेल',
    'common.phone': 'फोन',
    'common.address': 'पता',
    'common.date': 'तारीख',
    'common.time': 'समय',
    'common.status': 'स्थिति',
    'common.active': 'सक्रिय',
    'common.inactive': 'निष्क्रिय',
    'common.enabled': 'सक्षम',
    'common.disabled': 'अक्षम',
    'common.pending': 'लंबित',
    'common.completed': 'पूर्ण',
    'common.failed': 'असफल',
    'common.critical': 'गंभीर',
    'common.high': 'उच्च',
    'common.medium': 'मध्यम',
    'common.low': 'कम',
    'common.urgent': 'तत्काल',
    'common.warning': 'चेतावनी',
    'common.info': 'जानकारी',
    'common.alert': 'अलर्ट',
    'common.success': 'सफलता',
    'common.error': 'त्रुटि',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
