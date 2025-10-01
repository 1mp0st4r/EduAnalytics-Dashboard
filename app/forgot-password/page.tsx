"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, CheckCircle, XCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage('Email is required')
      setIsError(true)
      return
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address')
      setIsError(true)
      return
    }

    setIsLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('If an account with that email exists, a password reset link has been sent to your email address.')
        setIsSuccess(true)
      } else {
        setMessage(data.error || 'Failed to send reset email')
        setIsError(true)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
            </div>

            {message && (
              <Alert className={isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                <div className="flex items-center">
                  {isError ? (
                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  )}
                  <AlertDescription className={isError ? "text-red-800" : "text-green-800"}>
                    {message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/login')}
                className="text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Button>
              
              {isSuccess && (
                <div className="text-sm text-gray-600">
                  <p>Didn't receive the email? Check your spam folder or</p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setMessage('')
                      setIsSuccess(false)
                      setIsError(false)
                    }}
                    className="text-sm p-0 h-auto"
                  >
                    try again
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
