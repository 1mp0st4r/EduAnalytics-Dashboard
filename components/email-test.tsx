"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function EmailTest() {
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const testSMTP = async () => {
    if (!testEmail) {
      alert("Please enter a test email address")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail })
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          details: data.data
        })
      } else {
        setResult({
          success: false,
          message: data.error,
          details: data.details
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to test email configuration",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Configuration Test
        </CardTitle>
        <CardDescription>
          Test your SMTP configuration by sending a test email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="your-email@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        <Button 
          onClick={testSMTP} 
          disabled={loading || !testEmail}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing SMTP Configuration...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                <div className="font-semibold">{result.message}</div>
                {result.details && (
                  <div className="mt-2 text-sm">
                    <p><strong>SMTP Host:</strong> {result.details.smtpHost}</p>
                    <p><strong>SMTP Port:</strong> {result.details.smtpPort}</p>
                    <p><strong>From Email:</strong> {result.details.fromEmail}</p>
                    {result.details.testEmail && (
                      <p><strong>Test Email:</strong> {result.details.testEmail}</p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">SMTP Configuration Required</h4>
          <p className="text-sm text-blue-800 mb-3">
            Add these environment variables to your <code>.env.local</code> file:
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            <div>FROM_EMAIL=your-email@gmail.com</div>
            <div>EMAIL_API_KEY=your_app_password</div>
            <div>SMTP_HOST=smtp.gmail.com</div>
            <div>SMTP_PORT=587</div>
            <div>SMTP_SECURE=false</div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            See <code>EMAIL_SETUP.md</code> for detailed instructions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
