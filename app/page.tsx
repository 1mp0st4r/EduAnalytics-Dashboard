"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignUpForm from "@/components/auth/signup-form"
import StudentDashboard from "@/components/dashboard/student-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"

type AuthState = "login" | "signup" | "student-dashboard" | "admin-dashboard"

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [currentUser, setCurrentUser] = useState<any>(null)

  const handleLogin = (userType: "student" | "admin", credentials: any) => {
    // Mock authentication - in real app, this would call an API
    setCurrentUser({ type: userType, ...credentials })
    setAuthState(userType === "student" ? "student-dashboard" : "admin-dashboard")
  }

  const handleSignUp = (userData: any) => {
    // Mock signup - in real app, this would call an API
    console.log("New user registered:", userData)
    alert("खाता सफलतापूर्वक बनाया गया! / Account created successfully!")
    setAuthState("login")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthState("login")
  }

  switch (authState) {
    case "login":
      return <LoginForm onLogin={handleLogin} onSignUp={() => setAuthState("signup")} />
    case "signup":
      return <SignUpForm onBack={() => setAuthState("login")} onSignUp={handleSignUp} />
    case "student-dashboard":
      return <StudentDashboard user={currentUser} onLogout={handleLogout} />
    case "admin-dashboard":
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />
    default:
      return null
  }
}
