"use client"

import React from 'react'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  type: 'bar' | 'pie' | 'line'
  title?: string
  height?: number
}

export function SimpleChart({ data, type, title, height = 200 }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']

  const renderBarChart = () => (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-slate-600 truncate">{item.label}</div>
          <div className="flex-1 bg-slate-200 rounded-full h-4 relative">
            <div
              className="h-4 rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || colors[index % colors.length]
              }}
            />
          </div>
          <div className="w-12 text-sm font-medium text-slate-900">{item.value}</div>
        </div>
      ))}
    </div>
  )

  const renderPieChart = () => {
    let currentAngle = 0
    const radius = 60
    const centerX = 70
    const centerY = 70

    return (
      <div className="flex items-center space-x-6">
        <svg width="140" height="140" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / data.reduce((sum, d) => sum + d.value, 0)
            const angle = percentage * 360
            const endAngle = currentAngle + angle
            
            const startAngleRad = (currentAngle * Math.PI) / 180
            const endAngleRad = (endAngle * Math.PI) / 180
            
            const x1 = centerX + radius * Math.cos(startAngleRad)
            const y1 = centerY + radius * Math.sin(startAngleRad)
            const x2 = centerX + radius * Math.cos(endAngleRad)
            const y2 = centerY + radius * Math.sin(endAngleRad)
            
            const largeArcFlag = angle > 180 ? 1 : 0
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ')
            
            currentAngle = endAngle
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || colors[index % colors.length]}
                stroke="white"
                strokeWidth="2"
              />
            )
          })}
        </svg>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderLineChart = () => (
    <div className="space-y-2">
      <div className="flex items-end justify-between h-32 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-1">
            <div
              className="w-8 rounded-t transition-all duration-500"
              style={{
                height: `${(item.value / maxValue) * 100}px`,
                backgroundColor: item.color || colors[index % colors.length]
              }}
            />
            <div className="text-xs text-slate-600 transform rotate-45 origin-bottom-left">
              {item.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span>{maxValue}</span>
      </div>
    </div>
  )

  return (
    <div className="bg-white p-4 rounded-lg border">
      {title && (
        <h3 className="text-lg font-medium text-slate-900 mb-4">{title}</h3>
      )}
      <div style={{ minHeight: `${height}px` }}>
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  )
}

export default SimpleChart
