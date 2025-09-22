#!/usr/bin/env node

/**
 * Test Vercel Environment Variables
 * Run this after setting up environment variables in Vercel
 */

const BASE_URL = 'https://eduanalytics-dashboard.vercel.app'

async function testEndpoint(endpoint, name) {
  try {
    console.log(`🧪 Testing ${name}...`)
    const response = await fetch(`${BASE_URL}${endpoint}`)
    const data = await response.json()
    
    if (data.success) {
      console.log(`   ✅ ${name}: SUCCESS`)
      if (data.data) {
        console.log(`   📊 Data:`, Object.keys(data.data).join(', '))
      }
    } else {
      console.log(`   ❌ ${name}: FAILED`)
      console.log(`   🔍 Error:`, data.error)
    }
  } catch (error) {
    console.log(`   ❌ ${name}: ERROR`)
    console.log(`   🔍 Error:`, error.message)
  }
  console.log('')
}

async function runTests() {
  console.log('🚀 VERCEL ENVIRONMENT VARIABLES TEST')
  console.log('=====================================')
  console.log('')
  
  await testEndpoint('/api/test-db', 'Database Connection')
  await testEndpoint('/api/test-email', 'Email Service')
  await testEndpoint('/api/students?limit=5', 'Students API')
  await testEndpoint('/api/analytics', 'Analytics API')
  
  console.log('🎯 TEST COMPLETE')
  console.log('')
  console.log('If all tests pass, your Vercel deployment is working correctly!')
  console.log('If any test fails, check the environment variables in Vercel dashboard.')
}

runTests().catch(console.error)
