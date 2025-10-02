#!/usr/bin/env node

/**
 * Test script for new features
 * Tests all the newly implemented functionality
 */

const http = require('http')
const https = require('https')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Test configuration
const tests = [
  {
    name: 'Advanced Analytics API',
    endpoint: '/api/analytics/insights?type=trends',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Predictive Analytics API',
    endpoint: '/api/analytics/insights?type=predictions',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Intervention Analytics API',
    endpoint: '/api/analytics/insights?type=interventions',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Comparative Analytics API',
    endpoint: '/api/analytics/insights?type=comparative',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Report Templates API',
    endpoint: '/api/reports/templates',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Report Preview API',
    endpoint: '/api/reports/preview',
    method: 'POST',
    body: {
      template: {
        id: 'test',
        name: 'Test Report',
        type: 'custom',
        sections: [
          {
            id: 'section1',
            type: 'summary',
            title: 'Test Section',
            config: { metrics: ['total_students'] },
            order: 0
          }
        ],
        filters: []
      },
      filters: []
    },
    expectedStatus: 200
  },
  {
    name: 'Audit Events API',
    endpoint: '/api/audit?action=events&limit=10',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Audit Statistics API',
    endpoint: '/api/audit?action=statistics&timeframe=day',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Performance Stats API',
    endpoint: '/api/performance/stats',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'ML Service Health Check',
    endpoint: '/health',
    method: 'GET',
    baseUrl: 'http://localhost:8001',
    expectedStatus: 200
  }
]

// HTTP request helper
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.endpoint, options.baseUrl || BASE_URL)
    const isHttps = url.protocol === 'https:'
    const client = isHttps ? https : http
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EduAnalytics-Test-Suite/1.0'
      }
    }
    
    if (options.body) {
      const bodyString = JSON.stringify(options.body)
      requestOptions.headers['Content-Length'] = Buffer.byteLength(bodyString)
    }
    
    const req = client.request(requestOptions, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          })
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

// Run tests
async function runTests() {
  console.log('🧪 Testing EduAnalytics New Features\n')
  console.log(`Base URL: ${BASE_URL}`)
  console.log('=' .repeat(50))
  
  const results = []
  
  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.name}`)
      console.log(`   Endpoint: ${test.method} ${test.endpoint}`)
      
      const startTime = Date.now()
      const response = await makeRequest(test)
      const duration = Date.now() - startTime
      
      const success = response.statusCode === test.expectedStatus
      const status = success ? '✅ PASS' : '❌ FAIL'
      
      console.log(`   Status: ${status} (${response.statusCode})`)
      console.log(`   Duration: ${duration}ms`)
      
      if (success) {
        if (response.data.success !== undefined) {
          console.log(`   Response: ${response.data.success ? 'Success' : 'Failed'}`)
          if (response.data.data) {
            console.log(`   Data: ${JSON.stringify(response.data.data).substring(0, 100)}...`)
          }
        }
      } else {
        console.log(`   Error: ${response.data.error || 'Unknown error'}`)
      }
      
      results.push({
        name: test.name,
        success,
        statusCode: response.statusCode,
        duration,
        error: success ? null : (response.data.error || 'Unknown error')
      })
      
    } catch (error) {
      console.log(`   Status: ❌ ERROR`)
      console.log(`   Error: ${error.message}`)
      
      results.push({
        name: test.name,
        success: false,
        statusCode: 0,
        duration: 0,
        error: error.message
      })
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 Test Summary')
  console.log('=' .repeat(50))
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  
  console.log(`Total Tests: ${results.length}`)
  console.log(`Passed: ${passed} ✅`)
  console.log(`Failed: ${failed} ❌`)
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`)
  console.log(`Total Duration: ${totalDuration}ms`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => !r.success).forEach(result => {
      console.log(`   • ${result.name}: ${result.error}`)
    })
  }
  
  console.log('\n🎯 Feature Status:')
  console.log('   • Advanced Analytics: ' + (results[0]?.success ? '✅' : '❌'))
  console.log('   • Predictive Analytics: ' + (results[1]?.success ? '✅' : '❌'))
  console.log('   • Intervention Analytics: ' + (results[2]?.success ? '✅' : '❌'))
  console.log('   • Comparative Analytics: ' + (results[3]?.success ? '✅' : '❌'))
  console.log('   • Custom Reports: ' + (results[4]?.success ? '✅' : '❌'))
  console.log('   • Report Preview: ' + (results[5]?.success ? '✅' : '❌'))
  console.log('   • Audit Logging: ' + (results[6]?.success ? '✅' : '❌'))
  console.log('   • Audit Statistics: ' + (results[7]?.success ? '✅' : '❌'))
  console.log('   • Performance Monitoring: ' + (results[8]?.success ? '✅' : '❌'))
  console.log('   • ML Service: ' + (results[9]?.success ? '✅' : '❌'))
  
  console.log('\n✨ All new features have been tested!')
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0)
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  process.exit(1)
})

// Run tests
runTests().catch((error) => {
  console.error('Test runner error:', error)
  process.exit(1)
})
