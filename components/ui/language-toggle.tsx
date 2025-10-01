"use client"

import React from 'react'
import { Button } from './button'
import { Globe, Check } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">
        {language === 'en' ? 'English' : 'हिंदी'}
      </span>
      <span className="sm:hidden">
        {language === 'en' ? 'EN' : 'HI'}
      </span>
      <Check className="w-3 h-3" />
    </Button>
  )
}
