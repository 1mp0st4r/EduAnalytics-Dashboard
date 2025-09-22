"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignUpForm from "@/components/auth/signup-form"
import StudentDashboard from "@/components/dashboard/student-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import DatabaseTest from "@/components/database-test"
import EmailTest from "@/components/email-test"

type AuthState = "login" | "signup" | "student-dashboard" | "admin-dashboard" | "database-test" | "email-test"

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
      return (
        <div className="space-y-6">
          <LoginForm onLogin={handleLogin} onSignUp={() => setAuthState("signup")} />
          <div className="text-center space-y-2">
            <button
              onClick={() => setAuthState("database-test")}
              className="text-sm text-muted-foreground hover:text-primary underline block"
            >
              Test Database Connection
            </button>
            <button
              onClick={() => setAuthState("email-test")}
              className="text-sm text-muted-foreground hover:text-primary underline block"
            >
              Test Email Configuration
            </button>
          </div>
        </div>
      )
    case "signup":
      return <SignUpForm onBack={() => setAuthState("login")} onSignUp={handleSignUp} />
    case "student-dashboard":
      return <StudentDashboard user={currentUser} onLogout={handleLogout} />
    case "admin-dashboard":
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />
    case "database-test":
      return (
        <div className="space-y-6">
          <DatabaseTest />
          <div className="text-center">
            <button
              onClick={() => setAuthState("login")}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      )
    case "email-test":
      return (
        <div className="space-y-6">
          <EmailTest />
          <div className="text-center">
            <button
              onClick={() => setAuthState("login")}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      )
    default:
      return null
  }
}
