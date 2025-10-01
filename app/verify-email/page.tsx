"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const userId = searchParams.get('userId')

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (token && userId) {
      handleVerification()
    }
  }, [token, userId])

  const handleVerification = async () => {
    if (!token || !userId) {
      setMessage('Invalid verification link')
      setIsError(true)
      return
    }

    setIsLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Email verified successfully! You can now log in to your account.')
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setMessage(data.error || 'Failed to verify email')
        setIsError(true)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: searchParams.get('email') || ''
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Verification email sent! Please check your inbox.')
        setIsSuccess(true)
      } else {
        setMessage(data.error || 'Failed to send verification email')
        setIsError(true)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">Invalid Verification Link</CardTitle>
            <CardDescription>
              This email verification link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {isLoading ? (
              <RefreshCw className="w-16 h-16 text-blue-600 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : isError ? (
              <XCircle className="w-16 h-16 text-red-500" />
            ) : (
              <Mail className="w-16 h-16 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Verifying Email...' : 
             isSuccess ? 'Email Verified!' : 
             isError ? 'Verification Failed' : 
             'Email Verification'}
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Please wait while we verify your email address.' :
             isSuccess ? 'Your email has been successfully verified.' :
             isError ? 'We encountered an issue verifying your email.' :
             'Click the button below to verify your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          <div className="space-y-3 mt-6">
            {!isSuccess && !isLoading && (
              <Button 
                onClick={handleVerification}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            )}

            {isError && (
              <Button 
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>
            )}

            <Button
              type="button"
              variant="link"
              onClick={() => router.push('/login')}
              className="w-full text-sm"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">Loading...</CardTitle>
            <CardDescription>Please wait while we load the verification page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
