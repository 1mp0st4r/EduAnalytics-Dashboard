"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Bell, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface MobileLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function MobileLayout({ 
  children, 
  sidebar, 
  header, 
  className 
}: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile) {
    return (
      <div className={cn("min-h-screen bg-slate-50", className)}>
        {header}
        <div className="flex">
          {sidebar}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-slate-50", className)}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {sidebar}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                EduAnalytics
              </h1>
              <p className="text-xs text-slate-500">
                {user?.userType === 'admin' ? 'Admin Dashboard' : 
                 user?.userType === 'mentor' ? 'Mentor Dashboard' : 
                 'Student Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">A</span>
            </div>
            <span className="text-xs">Dashboard</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-slate-600">S</span>
            </div>
            <span className="text-xs">Students</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-slate-600">M</span>
            </div>
            <span className="text-xs">Mentors</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-slate-600">R</span>
            </div>
            <span className="text-xs">Reports</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}

// Mobile-optimized card component
export function MobileCard({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4",
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-optimized table component
export function MobileTable({ 
  data, 
  columns 
}: { 
  data: any[]
  columns: { key: string; label: string; render?: (value: any, item: any) => React.ReactNode }[]
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No data available
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="bg-white rounded-lg border border-slate-200 p-4">
          {columns.map((column) => (
            <div key={column.key} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
              <span className="text-sm font-medium text-slate-600">
                {column.label}
              </span>
              <span className="text-sm text-slate-900">
                {column.render ? column.render(item[column.key], item) : item[column.key]}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Mobile-optimized form component
export function MobileForm({ 
  children, 
  onSubmit 
}: { 
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void 
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
    </form>
  )
}

// Mobile-optimized button group
export function MobileButtonGroup({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      {children}
    </div>
  )
}
