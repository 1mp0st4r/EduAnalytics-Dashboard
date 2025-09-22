"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  GraduationCap, 
  BarChart3, 
  Users, 
  Brain, 
  Bell, 
  Settings, 
  FileText, 
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Mail,
  Database,
  Menu,
  X
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Overview and analytics"
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
    description: "Student management"
  },
  {
    name: "AI Analytics",
    href: "/ai-analytics",
    icon: Brain,
    description: "AI-powered insights"
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    description: "Generate reports"
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    description: "Alerts and messages"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration"
  }
]

const quickActions = [
  {
    name: "High Risk Students",
    href: "/students?filter=high-risk",
    icon: AlertTriangle,
    color: "text-red-600"
  },
  {
    name: "Send Alerts",
    href: "/notifications/send",
    icon: Mail,
    color: "text-blue-600"
  },
  {
    name: "Database Status",
    href: "/admin/database",
    icon: Database,
    color: "text-green-600"
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent pathname={pathname} onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className={cn("hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0", className)}>
        <SidebarContent pathname={pathname} />
      </div>
    </>
  )
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-200">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            EduAnalytics
          </h1>
          <p className="text-sm text-slate-600">Student Success Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-500")} />
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className="text-xs text-slate-500">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                onClick={onNavigate}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <action.icon className={cn("w-4 h-4", action.color)} />
                {action.name}
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}
