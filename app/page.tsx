"use client"

import { useState } from "react"

type AuthState = "login" | "signup" | "student-dashboard" | "admin-dashboard" | "database-test" | "email-test"

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [currentUser, setCurrentUser] = useState<any>(null)

  const handleLogin = (userType: "student" | "admin", credentials: any) => {
    setCurrentUser({ userType, ...credentials })
    setAuthState(userType === "student" ? "student-dashboard" : "admin-dashboard")
  }

  const handleSignUp = () => {
    setAuthState("signup")
  }

  const handleBackToLogin = () => {
    setAuthState("login")
  }

  const handleDatabaseTest = () => {
    setAuthState("database-test")
  }

  const handleEmailTest = () => {
    setAuthState("email-test")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {authState === "login" && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">EduAnalytics Dashboard</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={() => handleLogin("admin", { username: "admin" })}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login as Admin
              </button>
              <button
                onClick={() => handleLogin("student", { username: "student" })}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Login as Student
              </button>
              <div className="text-center">
                <button
                  onClick={handleSignUp}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Sign Up
                </button>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleDatabaseTest}
                className="text-blue-600 hover:text-blue-800 text-sm mr-4"
              >
                Test Database
              </button>
              <button
                onClick={handleEmailTest}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Test Email
              </button>
            </div>
          </div>
        </div>
      )}

      {authState === "student-dashboard" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
          <p>Welcome, {currentUser?.username || 'Student'}!</p>
          <button
            onClick={handleBackToLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      )}

      {authState === "admin-dashboard" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p>Welcome, {currentUser?.username || 'Admin'}!</p>
          <button
            onClick={handleBackToLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      )}

      {authState === "database-test" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Database Test</h1>
          <p>Database connection test would be here.</p>
          <button
            onClick={handleBackToLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      )}

      {authState === "email-test" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Email Test</h1>
          <p>Email functionality test would be here.</p>
          <button
            onClick={handleBackToLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  )
}