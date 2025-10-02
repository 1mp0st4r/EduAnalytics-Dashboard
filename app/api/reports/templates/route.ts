import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// In-memory storage for demo purposes (in production, use a database)
let reportTemplates: any[] = [
  {
    id: 'template_1',
    name: 'Student Risk Assessment Report',
    description: 'Comprehensive risk analysis for individual students',
    type: 'student',
    sections: [
      {
        id: 'section_1',
        type: 'summary',
        title: 'Student Overview',
        config: {
          metrics: ['total_students', 'at_risk_students', 'avg_attendance', 'avg_performance']
        },
        order: 0
      },
      {
        id: 'section_2',
        type: 'chart',
        title: 'Risk Distribution',
        config: {
          chartType: 'pie',
          dataSource: 'risk_distribution',
          title: 'Risk Distribution',
          showLegend: true
        },
        order: 1
      },
      {
        id: 'section_3',
        type: 'table',
        title: 'High Risk Students',
        config: {
          columns: ['name', 'class', 'attendance', 'performance', 'risk_level'],
          sortBy: 'risk_level',
          sortOrder: 'desc',
          limit: 50
        },
        order: 2
      }
    ],
    filters: [
      {
        id: 'filter_1',
        field: 'risk_level',
        operator: 'equals',
        value: 'High',
        label: 'Risk Level equals High'
      }
    ],
    schedule: {
      enabled: true,
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      time: '09:00',
      recipients: ['admin@school.edu'],
      format: 'pdf'
    },
    created: '2025-01-01T00:00:00Z',
    updated: '2025-01-09T00:00:00Z'
  },
  {
    id: 'template_2',
    name: 'Monthly Analytics Dashboard',
    description: 'Monthly overview of student performance and attendance trends',
    type: 'analytics',
    sections: [
      {
        id: 'section_4',
        type: 'metrics',
        title: 'Key Metrics',
        config: {
          metrics: [
            { key: 'total_students', label: 'Total Students', format: 'number' },
            { key: 'avg_attendance', label: 'Average Attendance', format: 'percentage' },
            { key: 'avg_performance', label: 'Average Performance', format: 'percentage' },
            { key: 'at_risk_count', label: 'At Risk Students', format: 'number' }
          ]
        },
        order: 0
      },
      {
        id: 'section_5',
        type: 'chart',
        title: 'Attendance Trends',
        config: {
          chartType: 'line',
          dataSource: 'attendance_trends',
          title: 'Monthly Attendance Trends',
          showLegend: true
        },
        order: 1
      },
      {
        id: 'section_6',
        type: 'chart',
        title: 'Performance by Class',
        config: {
          chartType: 'bar',
          dataSource: 'class_performance',
          title: 'Average Performance by Class',
          showLegend: false
        },
        order: 2
      }
    ],
    filters: [],
    schedule: {
      enabled: true,
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '08:00',
      recipients: ['admin@school.edu', 'principal@school.edu'],
      format: 'pdf'
    },
    created: '2025-01-01T00:00:00Z',
    updated: '2025-01-09T00:00:00Z'
  },
  {
    id: 'template_3',
    name: 'Attendance Summary Report',
    description: 'Detailed attendance analysis and trends',
    type: 'attendance',
    sections: [
      {
        id: 'section_7',
        type: 'summary',
        title: 'Attendance Overview',
        config: {
          metrics: ['total_attendance_rate', 'absent_students', 'tardy_students', 'perfect_attendance']
        },
        order: 0
      },
      {
        id: 'section_8',
        type: 'chart',
        title: 'Attendance by Day',
        config: {
          chartType: 'line',
          dataSource: 'daily_attendance',
          title: 'Daily Attendance Rate',
          showLegend: false
        },
        order: 1
      },
      {
        id: 'section_9',
        type: 'table',
        title: 'Students with Poor Attendance',
        config: {
          columns: ['name', 'class', 'attendance_rate', 'days_absent', 'last_attended'],
          sortBy: 'attendance_rate',
          sortOrder: 'asc',
          limit: 100
        },
        order: 2
      }
    ],
    filters: [
      {
        id: 'filter_2',
        field: 'attendance',
        operator: 'less_than',
        value: 80,
        label: 'Attendance less than 80%'
      }
    ],
    schedule: {
      enabled: false,
      frequency: 'weekly',
      dayOfWeek: 5, // Friday
      time: '16:00',
      recipients: [],
      format: 'excel'
    },
    created: '2025-01-01T00:00:00Z',
    updated: '2025-01-09T00:00:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    let templates = reportTemplates

    // Filter by type if specified
    if (type) {
      templates = templates.filter(template => template.type === type)
    }

    // Get specific template if ID is provided
    if (id) {
      const template = templates.find(t => t.id === id)
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: template })
    }

    // Return all templates
    return NextResponse.json({ 
      success: true, 
      data: templates,
      count: templates.length 
    })

  } catch (error) {
    console.error('[API] Error fetching report templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Create new template
    const newTemplate = {
      id: `template_${Date.now()}`,
      name: body.name,
      description: body.description || '',
      type: body.type,
      sections: body.sections || [],
      filters: body.filters || [],
      schedule: body.schedule || {
        enabled: false,
        frequency: 'weekly',
        time: '09:00',
        recipients: [],
        format: 'pdf'
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }

    reportTemplates.push(newTemplate)

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully'
    })

  } catch (error) {
    console.error('[API] Error creating report template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const templateIndex = reportTemplates.findIndex(t => t.id === body.id)
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Update template
    const updatedTemplate = {
      ...reportTemplates[templateIndex],
      ...body,
      updated: new Date().toISOString()
    }

    reportTemplates[templateIndex] = updatedTemplate

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'Template updated successfully'
    })

  } catch (error) {
    console.error('[API] Error updating report template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const templateIndex = reportTemplates.findIndex(t => t.id === id)
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    reportTemplates.splice(templateIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })

  } catch (error) {
    console.error('[API] Error deleting report template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
