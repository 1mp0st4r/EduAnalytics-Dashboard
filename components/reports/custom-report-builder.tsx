"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Download,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Settings,
  Clock,
  Mail
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'student' | 'analytics' | 'risk' | 'attendance' | 'performance' | 'custom'
  sections: ReportSection[]
  filters: ReportFilter[]
  schedule?: ReportSchedule
  created: string
  updated: string
}

interface ReportSection {
  id: string
  type: 'summary' | 'chart' | 'table' | 'text' | 'metrics'
  title: string
  config: any
  order: number
}

interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
  label: string
}

interface ReportSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
}

export function CustomReportBuilder() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<ReportTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('builder')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/reports/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load report templates",
        variant: "destructive"
      })
    }
  }

  const createNewTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: `template_${Date.now()}`,
      name: 'New Report Template',
      description: '',
      type: 'custom',
      sections: [],
      filters: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
    setCurrentTemplate(newTemplate)
  }

  const addSection = (type: ReportSection['type']) => {
    if (!currentTemplate) return

    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      config: getDefaultSectionConfig(type),
      order: currentTemplate.sections.length
    }

    setCurrentTemplate({
      ...currentTemplate,
      sections: [...currentTemplate.sections, newSection],
      updated: new Date().toISOString()
    })
  }

  const getDefaultSectionConfig = (type: ReportSection['type']) => {
    switch (type) {
      case 'summary':
        return { metrics: ['total_students', 'at_risk_students', 'avg_attendance', 'avg_performance'] }
      case 'chart':
        return { 
          chartType: 'bar',
          dataSource: 'risk_distribution',
          title: 'Risk Distribution',
          showLegend: true
        }
      case 'table':
        return { 
          columns: ['name', 'class', 'attendance', 'performance', 'risk_level'],
          sortBy: 'risk_level',
          sortOrder: 'desc',
          limit: 100
        }
      case 'text':
        return { content: 'Enter your text content here...' }
      case 'metrics':
        return { 
          metrics: [
            { key: 'total_students', label: 'Total Students', format: 'number' },
            { key: 'avg_attendance', label: 'Average Attendance', format: 'percentage' }
          ]
        }
      default:
        return {}
    }
  }

  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    if (!currentTemplate) return

    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
      updated: new Date().toISOString()
    })
  }

  const removeSection = (sectionId: string) => {
    if (!currentTemplate) return

    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.filter(section => section.id !== sectionId),
      updated: new Date().toISOString()
    })
  }

  const addFilter = () => {
    if (!currentTemplate) return

    const newFilter: ReportFilter = {
      id: `filter_${Date.now()}`,
      field: 'risk_level',
      operator: 'equals',
      value: 'High',
      label: 'Risk Level equals High'
    }

    setCurrentTemplate({
      ...currentTemplate,
      filters: [...currentTemplate.filters, newFilter],
      updated: new Date().toISOString()
    })
  }

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    if (!currentTemplate) return

    setCurrentTemplate({
      ...currentTemplate,
      filters: currentTemplate.filters.map(filter =>
        filter.id === filterId ? { ...filter, ...updates } : filter
      ),
      updated: new Date().toISOString()
    })
  }

  const removeFilter = (filterId: string) => {
    if (!currentTemplate) return

    setCurrentTemplate({
      ...currentTemplate,
      filters: currentTemplate.filters.filter(filter => filter.id !== filterId),
      updated: new Date().toISOString()
    })
  }

  const saveTemplate = async () => {
    if (!currentTemplate) return

    setLoading(true)
    try {
      const response = await fetch('/api/reports/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTemplate)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report template saved successfully"
        })
        loadTemplates()
      } else {
        throw new Error('Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: "Error",
        description: "Failed to save report template",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePreview = async () => {
    if (!currentTemplate) return

    setLoading(true)
    try {
      const response = await fetch('/api/reports/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: currentTemplate,
          filters: currentTemplate.filters
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewMode(true)
        toast({
          title: "Preview Generated",
          description: "Report preview is ready"
        })
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getSectionIcon = (type: ReportSection['type']) => {
    switch (type) {
      case 'summary': return <FileText className="h-4 w-4" />
      case 'chart': return <BarChart3 className="h-4 w-4" />
      case 'table': return <Users className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      case 'metrics': return <TrendingUp className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Report Builder</h2>
          <p className="text-muted-foreground">Create and manage custom report templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          {currentTemplate && (
            <>
              <Button variant="outline" onClick={generatePreview} disabled={loading}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveTemplate} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          {currentTemplate ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template Configuration */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Template Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Name</Label>
                      <Input
                        id="template-name"
                        value={currentTemplate.name}
                        onChange={(e) => setCurrentTemplate({
                          ...currentTemplate,
                          name: e.target.value,
                          updated: new Date().toISOString()
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-description">Description</Label>
                      <Textarea
                        id="template-description"
                        value={currentTemplate.description}
                        onChange={(e) => setCurrentTemplate({
                          ...currentTemplate,
                          description: e.target.value,
                          updated: new Date().toISOString()
                        })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Type</Label>
                      <Select
                        value={currentTemplate.type}
                        onValueChange={(value) => setCurrentTemplate({
                          ...currentTemplate,
                          type: value as ReportTemplate['type'],
                          updated: new Date().toISOString()
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student Report</SelectItem>
                          <SelectItem value="analytics">Analytics Report</SelectItem>
                          <SelectItem value="risk">Risk Analysis</SelectItem>
                          <SelectItem value="attendance">Attendance Report</SelectItem>
                          <SelectItem value="performance">Performance Report</SelectItem>
                          <SelectItem value="custom">Custom Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Filters</CardTitle>
                      <Button size="sm" onClick={addFilter}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {currentTemplate.filters.map((filter) => (
                      <div key={filter.id} className="flex items-center gap-2 p-2 border rounded">
                        <Select
                          value={filter.field}
                          onValueChange={(value) => updateFilter(filter.id, { field: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="risk_level">Risk Level</SelectItem>
                            <SelectItem value="class">Class</SelectItem>
                            <SelectItem value="attendance">Attendance</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="gender">Gender</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => updateFilter(filter.id, { operator: value as any })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">=</SelectItem>
                            <SelectItem value="contains">contains</SelectItem>
                            <SelectItem value="greater_than">&gt;</SelectItem>
                            <SelectItem value="less_than">&lt;</SelectItem>
                            <SelectItem value="between">between</SelectItem>
                            <SelectItem value="in">in</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {currentTemplate.filters.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No filters added. Click + to add a filter.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Report Sections */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Report Sections</CardTitle>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => addSection('summary')}>
                          <FileText className="h-4 w-4 mr-1" />
                          Summary
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addSection('chart')}>
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Chart
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addSection('table')}>
                          <Users className="h-4 w-4 mr-1" />
                          Table
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addSection('metrics')}>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Metrics
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentTemplate.sections.map((section, index) => (
                        <div key={section.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {getSectionIcon(section.type)}
                              <span className="font-medium">{section.title}</span>
                              <Badge variant="outline">{section.type}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => removeSection(section.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <Label>Section Title</Label>
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              />
                            </div>
                            
                            {section.type === 'chart' && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Chart Type</Label>
                                  <Select
                                    value={section.config.chartType}
                                    onValueChange={(value) => updateSection(section.id, {
                                      config: { ...section.config, chartType: value }
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bar">Bar Chart</SelectItem>
                                      <SelectItem value="pie">Pie Chart</SelectItem>
                                      <SelectItem value="line">Line Chart</SelectItem>
                                      <SelectItem value="area">Area Chart</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Data Source</Label>
                                  <Select
                                    value={section.config.dataSource}
                                    onValueChange={(value) => updateSection(section.id, {
                                      config: { ...section.config, dataSource: value }
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="risk_distribution">Risk Distribution</SelectItem>
                                      <SelectItem value="attendance_trends">Attendance Trends</SelectItem>
                                      <SelectItem value="performance_metrics">Performance Metrics</SelectItem>
                                      <SelectItem value="class_comparison">Class Comparison</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                            
                            {section.type === 'table' && (
                              <div>
                                <Label>Columns</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {['name', 'class', 'attendance', 'performance', 'risk_level', 'email', 'phone'].map((col) => (
                                    <div key={col} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${section.id}_${col}`}
                                        checked={section.config.columns?.includes(col) || false}
                                        onCheckedChange={(checked) => {
                                          const columns = section.config.columns || []
                                          const newColumns = checked
                                            ? [...columns, col]
                                            : columns.filter((c: string) => c !== col)
                                          updateSection(section.id, {
                                            config: { ...section.config, columns: newColumns }
                                          })
                                        }}
                                      />
                                      <Label htmlFor={`${section.id}_${col}`} className="text-sm">
                                        {col.replace('_', ' ')}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {currentTemplate.sections.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No sections added yet. Add sections to build your report.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Template Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Create a new template or select an existing one to start building your report.
                </p>
                <Button onClick={createNewTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {template.sections.length} sections
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {template.filters.length} filters
                    </div>
                    {template.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Scheduled {template.schedule.frequency}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentTemplate(template)}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Scheduler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure automated report generation and delivery.
              </p>
              {/* Scheduler configuration would go here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
