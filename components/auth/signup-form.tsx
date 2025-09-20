"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, GraduationCap, Eye, EyeOff } from "lucide-react"

interface SignUpFormProps {
  onBack: () => void
  onSignUp: (userData: any) => void
}

export default function SignUpForm({ onBack, onSignUp }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "",
    studentClass: "",
    school: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    district: "",
    state: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("पासवर्ड मेल नहीं खाते / Passwords do not match")
      return
    }
    onSignUp(formData)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="w-10"></div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-balance">नया खाता बनाएं / Create New Account</CardTitle>
            <CardDescription className="text-base mt-2">शिक्षा सहायक में शामिल हों / Join EduSupport</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">पूरा नाम / Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="अपना पूरा नाम दर्ज करें / Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">उपयोगकर्ता प्रकार / User Type *</Label>
                <Select value={formData.userType} onValueChange={(value) => updateFormData("userType", value)}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="चुनें / Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">छात्र / Student</SelectItem>
                    <SelectItem value="parent">अभिभावक / Parent</SelectItem>
                    <SelectItem value="teacher">शिक्षक / Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">ईमेल / Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">मोबाइल नंबर / Mobile Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  required
                  className="text-base"
                />
              </div>
            </div>

            {formData.userType === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentClass">कक्षा / Class *</Label>
                  <Select
                    value={formData.studentClass}
                    onValueChange={(value) => updateFormData("studentClass", value)}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="कक्षा चुनें / Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={`${i + 1}`}>
                          कक्षा {i + 1} / Class {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">स्कूल का नाम / School Name *</Label>
                  <Input
                    id="school"
                    placeholder="अपने स्कूल का नाम दर्ज करें / Enter your school name"
                    value={formData.school}
                    onChange={(e) => updateFormData("school", e.target.value)}
                    className="text-base"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">पासवर्ड / Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="एक मजबूत पासवर्ड बनाएं / Create a strong password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
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
                <Label htmlFor="confirmPassword">पासवर्ड पुष्टि / Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="पासवर्ड दोबारा दर्ज करें / Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  required
                  className="text-base"
                />
              </div>
            </div>

            {formData.userType === "student" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">अभिभावक का नाम / Parent's Name</Label>
                    <Input
                      id="parentName"
                      placeholder="अभिभावक का नाम दर्ज करें / Enter parent's name"
                      value={formData.parentName}
                      onChange={(e) => updateFormData("parentName", e.target.value)}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">अभिभावक का मोबाइल / Parent's Mobile</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      placeholder="अभिभावक का मोबाइल नंबर / Parent's mobile number"
                      value={formData.parentPhone}
                      onChange={(e) => updateFormData("parentPhone", e.target.value)}
                      className="text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">अभिभावक का ईमेल / Parent's Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="अभिभावक का ईमेल पता / Parent's email address"
                    value={formData.parentEmail}
                    onChange={(e) => updateFormData("parentEmail", e.target.value)}
                    className="text-base"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">पता / Address</Label>
              <Textarea
                id="address"
                placeholder="अपना पूरा पता दर्ज करें / Enter your complete address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                className="text-base min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">जिला / District</Label>
                <Input
                  id="district"
                  placeholder="अपना जिला दर्ज करें / Enter your district"
                  value={formData.district}
                  onChange={(e) => updateFormData("district", e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">राज्य / State</Label>
                <Input
                  id="state"
                  placeholder="अपना राज्य दर्ज करें / Enter your state"
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value)}
                  className="text-base"
                />
              </div>
            </div>

            <Button type="submit" className="w-full text-base py-6" size="lg">
              खाता बनाएं / Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
