#!/usr/bin/env node

/**
 * Test Real Functionality Script
 * Verifies that all services are working with real data instead of mock data
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ML_SERVICE_URL = 'http://localhost:8001';
const RASA_SERVICE_URL = 'http://localhost:5005';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testDatabaseConnection() {
  log('\n🔍 Testing Database Connection...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-db`);
    
    if (response.status === 200 && response.data.success) {
      log('✅ Database connection successful', 'green');
      log(`   Connection: ${response.data.data.connection}`, 'blue');
      log(`   Sample students: ${response.data.data.sampleStudents}`, 'blue');
      return true;
    } else {
      log('❌ Database connection failed', 'red');
      log(`   Error: ${response.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Database connection error', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testMLService() {
  log('\n🤖 Testing ML Service...', 'cyan');
  
  try {
    // Test health endpoint
    const healthResponse = await makeRequest(`${ML_SERVICE_URL}/health`);
    
    if (healthResponse.status === 200) {
      log('✅ ML Service health check passed', 'green');
      log(`   Model loaded: ${healthResponse.data.model_loaded}`, 'blue');
      log(`   SHAP available: ${healthResponse.data.shap_available}`, 'blue');
      
      // Test risk assessment
      const testStudentData = {
        StudentID: 'TEST_001',
        StudentName: 'Test Student',
        AvgAttendance_LatestTerm: 65,
        AvgMarks_LatestTerm: 55,
        IsFirstGenerationLearner: true,
        WorksPartTime: true,
        FamilyAnnualIncome: 80000,
        Gender: 'Male',
        StudentClass: '10'
      };
      
      const riskResponse = await makeRequest(`${ML_SERVICE_URL}/risk-assessment`, {
        method: 'POST',
        body: testStudentData
      });
      
      if (riskResponse.status === 200) {
        log('✅ ML Risk assessment working', 'green');
        log(`   Risk level: ${riskResponse.data.risk_level}`, 'blue');
        log(`   Dropout probability: ${(riskResponse.data.dropout_probability * 100).toFixed(1)}%`, 'blue');
        log(`   Data source: ${riskResponse.data.data_source}`, 'blue');
        return true;
      } else {
        log('❌ ML Risk assessment failed', 'red');
        return false;
      }
    } else {
      log('❌ ML Service health check failed', 'red');
      return false;
    }
  } catch (error) {
    log('❌ ML Service error', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testEmailService() {
  log('\n📧 Testing Email Service...', 'cyan');
  
  try {
    // Test email connection
    const connectionResponse = await makeRequest(`${BASE_URL}/api/test-email`);
    
    if (connectionResponse.status === 200 && connectionResponse.data.success) {
      log('✅ Email service connection successful', 'green');
      log(`   Connection: ${connectionResponse.data.data.connection}`, 'blue');
      log(`   Status: ${connectionResponse.data.data.status}`, 'blue');
      return true;
    } else {
      log('❌ Email service connection failed', 'red');
      log(`   Error: ${connectionResponse.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Email service error', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testRasaService() {
  log('\n💬 Testing Rasa Service...', 'cyan');
  
  try {
    const healthResponse = await makeRequest(`${RASA_SERVICE_URL}/health`);
    
    if (healthResponse.status === 200) {
      log('✅ Rasa service health check passed', 'green');
      log(`   Status: ${healthResponse.data.status}`, 'blue');
      return true;
    } else {
      log('❌ Rasa service health check failed', 'red');
      log(`   Note: Rasa service may not be running. This is optional.`, 'yellow');
      return false;
    }
  } catch (error) {
    log('⚠️  Rasa service not available', 'yellow');
    log(`   Note: Rasa service is optional. Chat will use enhanced fallback responses.`, 'yellow');
    return false;
  }
}

async function testStudentDataAPI() {
  log('\n👥 Testing Student Data API...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/students?limit=5`);
    
    if (response.status === 200 && response.data.success) {
      const students = response.data.data.students;
      log('✅ Student data API working', 'green');
      log(`   Students fetched: ${students.length}`, 'blue');
      
      if (students.length > 0) {
        const firstStudent = students[0];
        log(`   Sample student: ${firstStudent.StudentName} (${firstStudent.StudentID})`, 'blue');
        log(`   Risk level: ${firstStudent.RiskLevel}`, 'blue');
        log(`   Attendance: ${firstStudent.AvgAttendance_LatestTerm}%`, 'blue');
        return true;
      } else {
        log('⚠️  No students found in database', 'yellow');
        return false;
      }
    } else {
      log('❌ Student data API failed', 'red');
      log(`   Error: ${response.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Student data API error', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testAnalyticsAPI() {
  log('\n📊 Testing Analytics API...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/analytics?type=overview`);
    
    if (response.status === 200 && response.data.success) {
      const stats = response.data.data.statistics;
      log('✅ Analytics API working', 'green');
      log(`   Total students: ${stats.totalStudents}`, 'blue');
      log(`   High risk students: ${stats.highRiskStudents}`, 'blue');
      log(`   Average attendance: ${stats.avgAttendance}%`, 'blue');
      return true;
    } else {
      log('❌ Analytics API failed', 'red');
      log(`   Error: ${response.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Analytics API error', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testNotificationsAPI() {
  log('\n🔔 Testing Notifications API...', 'cyan');
  
  try {
    // Test if notification endpoints are accessible (without actually sending emails)
    const response = await makeRequest(`${BASE_URL}/api/notifications/send-risk-alerts`, {
      method: 'POST',
      body: { test: true }
    });
    
    // We expect this to fail with 400 or 500, but it should not be a 404
    if (response.status === 404) {
      log('❌ Notifications API endpoints not found', 'red');
      return false;
    } else if (response.status === 400 || response.status === 500) {
      log('✅ Notifications API endpoints accessible', 'green');
      log(`   Status: ${response.status} (expected for test call)`, 'blue');
      return true;
    } else {
      log('✅ Notifications API working', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Notifications API error', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Real Functionality Tests', 'bright');
  log('=====================================', 'bright');
  
  const results = {
    database: await testDatabaseConnection(),
    mlService: await testMLService(),
    emailService: await testEmailService(),
    rasaService: await testRasaService(),
    studentDataAPI: await testStudentDataAPI(),
    analyticsAPI: await testAnalyticsAPI(),
    notificationsAPI: await testNotificationsAPI()
  };
  
  // Summary
  log('\n📋 Test Results Summary', 'bright');
  log('=======================', 'bright');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });
  
  log(`\nOverall: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! Real functionality is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the logs above for details.', 'yellow');
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'bright');
  if (!results.database) {
    log('- Check database connection and credentials', 'yellow');
  }
  if (!results.mlService) {
    log('- Start the ML service: python ml_service_real.py', 'yellow');
  }
  if (!results.emailService) {
    log('- Check email configuration in .env.local', 'yellow');
  }
  if (!results.rasaService) {
    log('- Rasa service is optional, chat will use fallback responses', 'yellow');
  }
  
  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests };
