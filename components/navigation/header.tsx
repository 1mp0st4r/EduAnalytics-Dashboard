"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  RefreshCw,
  Database,
  Mail,
  AlertTriangle
} from "lucide-react"

interface HeaderProps {
  onRefresh?: () => void
  onTestDatabase?: () => void
  onTestEmail?: () => void
  notificationCount?: number
  isLoading?: boolean
}

export function Header({ 
  onRefresh, 
  onTestDatabase, 
  onTestEmail, 
  notificationCount = 0,
  isLoading = false 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search students, reports, or analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10"
            />
          </div>
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-3">
          {/* System Tests */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTestDatabase}
              disabled={isLoading}
              className="h-9"
            >
              <Database className="w-4 h-4 mr-2" />
              Test DB
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTestEmail}
              disabled={isLoading}
              className="h-9"
            >
              <Mail className="w-4 h-4 mr-2" />
              Test Email
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="sm" className="h-9 relative">
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <User className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alert Banner */}
      {notificationCount > 0 && (
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-orange-800">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {notificationCount} high-risk student{notificationCount > 1 ? 's' : ''} require{notificationCount === 1 ? 's' : ''} immediate attention
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
