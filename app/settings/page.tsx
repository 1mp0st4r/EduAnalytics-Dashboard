"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Database,
  Mail,
  Shield,
  Palette,
  Save,
  TestTube,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    schoolName: "Rajasthan Government School",
    schoolCode: "RGS001",
    timezone: "Asia/Kolkata",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    highRiskAlerts: true,
    attendanceWarnings: true,
    performanceAlerts: true,
    reportGeneration: false,
    
    // Risk Assessment Settings
    attendanceThreshold: 75,
    performanceThreshold: 60,
    highRiskThreshold: 70,
    criticalRiskThreshold: 85,
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpSecure: false,
    fromEmail: "noreply@school.edu",
    fromName: "EduAnalytics System",
    
    // Database Settings
    databaseType: "neon",
    connectionString: "postgresql://neondb_owner:...",
    backupFrequency: "daily",
    retentionPeriod: 365,
    
    // Security Settings
    sessionTimeout: 30,
    passwordPolicy: "strong",
    twoFactorAuth: false,
    ipWhitelist: false,
    
    // UI Settings
    theme: "light",
    sidebarCollapsed: false,
    compactMode: false,
    animations: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({})

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert("Settings saved successfully!")
  }

  const handleTest = async (testType: string) => {
    setTestResults(prev => ({ ...prev, [testType]: null }))
    
    // Simulate test operation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock test results
    const success = Math.random() > 0.3 // 70% success rate for demo
    setTestResults(prev => ({ ...prev, [testType]: success }))
  }

  const getTestIcon = (testType: string) => {
    const result = testResults[testType]
    if (result === null) return <RefreshCw className="w-4 h-4 animate-spin" />
    if (result) return <CheckCircle className="w-4 h-4 text-green-600" />
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header 
          onRefresh={() => {}}
          isLoading={isSaving}
        />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-600">Configure system settings and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-slate-600" />
                    <span>General Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure basic system information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={settings.schoolName}
                        onChange={(e) => handleSettingChange('schoolName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolCode">School Code</Label>
                      <Input
                        id="schoolCode"
                        value={settings.schoolCode}
                        onChange={(e) => handleSettingChange('schoolCode', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                          <SelectItem value="te">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span>Notification Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-slate-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-slate-600">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-slate-600">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Alert Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="highRiskAlerts">High Risk Alerts</Label>
                          <p className="text-sm text-slate-600">Get notified about high-risk students</p>
                        </div>
                        <Switch
                          id="highRiskAlerts"
                          checked={settings.highRiskAlerts}
                          onCheckedChange={(checked) => handleSettingChange('highRiskAlerts', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="attendanceWarnings">Attendance Warnings</Label>
                          <p className="text-sm text-slate-600">Get notified about low attendance</p>
                        </div>
                        <Switch
                          id="attendanceWarnings"
                          checked={settings.attendanceWarnings}
                          onCheckedChange={(checked) => handleSettingChange('attendanceWarnings', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="performanceAlerts">Performance Alerts</Label>
                          <p className="text-sm text-slate-600">Get notified about poor performance</p>
                        </div>
                        <Switch
                          id="performanceAlerts"
                          checked={settings.performanceAlerts}
                          onCheckedChange={(checked) => handleSettingChange('performanceAlerts', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Assessment Settings */}
            <TabsContent value="risk">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-slate-600" />
                    <span>Risk Assessment Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure thresholds and parameters for risk assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="attendanceThreshold">Attendance Threshold (%)</Label>
                      <Input
                        id="attendanceThreshold"
                        type="number"
                        value={settings.attendanceThreshold}
                        onChange={(e) => handleSettingChange('attendanceThreshold', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-slate-600">Minimum attendance percentage before warning</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="performanceThreshold">Performance Threshold (%)</Label>
                      <Input
                        id="performanceThreshold"
                        type="number"
                        value={settings.performanceThreshold}
                        onChange={(e) => handleSettingChange('performanceThreshold', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-slate-600">Minimum performance percentage before warning</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="highRiskThreshold">High Risk Threshold</Label>
                      <Input
                        id="highRiskThreshold"
                        type="number"
                        value={settings.highRiskThreshold}
                        onChange={(e) => handleSettingChange('highRiskThreshold', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-slate-600">Risk score threshold for high risk classification</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="criticalRiskThreshold">Critical Risk Threshold</Label>
                      <Input
                        id="criticalRiskThreshold"
                        type="number"
                        value={settings.criticalRiskThreshold}
                        onChange={(e) => handleSettingChange('criticalRiskThreshold', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-slate-600">Risk score threshold for critical risk classification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-slate-600" />
                    <span>Email Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure SMTP settings for email notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.fromName}
                        onChange={(e) => handleSettingChange('fromName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                      <p className="text-sm text-slate-600">Enable secure connection</p>
                    </div>
                    <Switch
                      id="smtpSecure"
                      checked={settings.smtpSecure}
                      onCheckedChange={(checked) => handleSettingChange('smtpSecure', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => handleTest('email')}
                      disabled={testResults.email === null}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {getTestIcon('email')}
                      Test Email
                    </Button>
                    {testResults.email === true && (
                      <span className="text-sm text-green-600">✓ Email test successful</span>
                    )}
                    {testResults.email === false && (
                      <span className="text-sm text-red-600">✗ Email test failed</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Database Settings */}
            <TabsContent value="database">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-slate-600" />
                    <span>Database Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure database connection and backup settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="databaseType">Database Type</Label>
                      <Select value={settings.databaseType} onValueChange={(value) => handleSettingChange('databaseType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neon">Neon PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                      <Input
                        id="retentionPeriod"
                        type="number"
                        value={settings.retentionPeriod}
                        onChange={(e) => handleSettingChange('retentionPeriod', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="connectionString">Connection String</Label>
                    <Input
                      id="connectionString"
                      value={settings.connectionString}
                      onChange={(e) => handleSettingChange('connectionString', e.target.value)}
                      type="password"
                    />
                    <p className="text-sm text-slate-600">Database connection string (hidden for security)</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => handleTest('database')}
                      disabled={testResults.database === null}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {getTestIcon('database')}
                      Test Connection
                    </Button>
                    {testResults.database === true && (
                      <span className="text-sm text-green-600">✓ Database connection successful</span>
                    )}
                    {testResults.database === false && (
                      <span className="text-sm text-red-600">✗ Database connection failed</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-slate-600" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure security policies and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordPolicy">Password Policy</Label>
                      <Select value={settings.passwordPolicy} onValueChange={(value) => handleSettingChange('passwordPolicy', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (6+ characters)</SelectItem>
                          <SelectItem value="strong">Strong (8+ chars, mixed case, numbers)</SelectItem>
                          <SelectItem value="very-strong">Very Strong (12+ chars, special chars)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                        <p className="text-sm text-slate-600">Require 2FA for all users</p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                        <p className="text-sm text-slate-600">Restrict access to specific IP addresses</p>
                      </div>
                      <Switch
                        id="ipWhitelist"
                        checked={settings.ipWhitelist}
                        onCheckedChange={(checked) => handleSettingChange('ipWhitelist', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
