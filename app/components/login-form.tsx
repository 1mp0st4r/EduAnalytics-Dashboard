"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Eye, EyeOff, GraduationCap, Shield, UserPlus } from "lucide-react"

interface LoginFormProps {
  onLogin: (userType: "student" | "admin", credentials: any) => void
  onSignUp: () => void
}

export default function LoginForm({ onLogin, onSignUp }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState("")
  const [generatedCaptcha] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase())
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    captcha: "",
  })

  const handleSubmit = (userType: "student" | "admin") => {
    if (formData.captcha !== generatedCaptcha) {
      alert("कैप्चा गलत है / Captcha is incorrect")
      return
    }
    onLogin(userType, formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-balance">शिक्षा सहायक / EduSupport</CardTitle>
            <CardDescription className="text-base mt-2">
              छात्र सफलता के लिए आपका साथी / Your partner for student success
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="student" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                छात्र / Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                प्रशासक / Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-id">छात्र आईडी / Student ID</Label>
                  <Input
                    id="student-id"
                    placeholder="अपनी छात्र आईडी दर्ज करें / Enter your student ID"
                    value={formData.loginId}
                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password">पासवर्ड / Password</Label>
                  <div className="relative">
                    <Input
                      id="student-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="अपना पासवर्ड दर्ज करें / Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="text-base pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="captcha">सुरक्षा कोड / Security Code</Label>
                  <div className="flex gap-2">
                    <div className="bg-muted p-3 rounded border-2 border-dashed border-border font-mono text-lg font-bold tracking-wider">
                      {generatedCaptcha}
                    </div>
                    <Input
                      id="captcha"
                      placeholder="कोड दर्ज करें / Enter code"
                      value={formData.captcha}
                      onChange={(e) => setFormData({ ...formData, captcha: e.target.value.toUpperCase() })}
                      className="text-base"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSubmit("student")} className="w-full text-base py-6" size="lg">
                  छात्र लॉगिन / Student Login
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-id">प्रशासक आईडी / Admin ID</Label>
                  <Input
                    id="admin-id"
                    placeholder="अपनी प्रशासक आईडी दर्ज करें / Enter your admin ID"
                    value={formData.loginId}
                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">पासवर्ड / Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="अपना पासवर्ड दर्ज करें / Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="text-base pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-captcha">सुरक्षा कोड / Security Code</Label>
                  <div className="flex gap-2">
                    <div className="bg-muted p-3 rounded border-2 border-dashed border-border font-mono text-lg font-bold tracking-wider">
                      {generatedCaptcha}
                    </div>
                    <Input
                      id="admin-captcha"
                      placeholder="कोड दर्ज करें / Enter code"
                      value={formData.captcha}
                      onChange={(e) => setFormData({ ...formData, captcha: e.target.value.toUpperCase() })}
                      className="text-base"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSubmit("admin")} className="w-full text-base py-6" size="lg">
                  प्रशासक लॉगिन / Admin Login
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">नया उपयोगकर्ता हैं? / New user?</p>
            <Button variant="outline" onClick={onSignUp} className="w-full text-base py-6 bg-transparent" size="lg">
              <UserPlus className="w-4 h-4 mr-2" />
              नया खाता बनाएं / Create New Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
