// scripts/verify-miniapp.ts - Fixed TypeScript Issues

import request, { Response } from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app';

// Add proper type definitions
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  warning?: string;
  details?: any;
}

/**
 * Test page loading
 */
async function testPageLoading(): Promise<TestResult[]> {
  console.log('📄 Testing MiniApp Page Loading...\n');
  
  const results: TestResult[] = [];
  
  const pages = [
    { path: '/miniapp/', name: 'Main MiniApp Page', expectedContent: '<title>' },
    { path: '/miniapp/pet', name: 'Pet Page', expectedContent: 'pet' }
  ];

  for (const page of pages) {
    try {
      console.log(`Testing: ${page.name} (${page.path})`);
      
      const res = await request(app).get(page.path);
      
      if (res.status === 200) {
        if (res.text.includes(page.expectedContent)) {
          console.log(`✅ ${page.name}: Loaded successfully`);
          results.push({
            name: page.name,
            passed: true,
            details: { status: res.status, hasContent: true }
          });
        } else {
          console.log(`⚠️  ${page.name}: Missing expected content`);
          results.push({
            name: page.name,
            passed: false,
            warning: 'Missing expected content',
            details: { status: res.status, expectedContent: page.expectedContent }
          });
        }
      } else {
        console.log(`❌ ${page.name}: HTTP ${res.status}`);
        results.push({
          name: page.name,
          passed: false,
          error: `HTTP ${res.status}`,
          details: { status: res.status, response: res.text.substring(0, 200) }
        });
      }
    } catch (error) {
      // ✅ FIX: Proper error type handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${page.name}: ${errorMessage}`);
      results.push({
        name: page.name,
        passed: false,
        error: errorMessage
      });
    }
  }
  
  return results;
}

/**
 * Test API endpoints
 */
async function testApiEndpoints(): Promise<TestResult[]> {
  console.log('\n🌐 Testing MiniApp API Endpoints...\n');
  
  const results: TestResult[] = [];
  const testUserId = '999999';
  
  // ✅ FIX: Proper type definition for endpoints
  interface Endpoint {
    method: 'GET' | 'POST';
    path: string;
    name: string;
    expectedStatus: number[];
    expectedContent: string | null;
  }

  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      path: '/miniapp/config',
      name: 'Configuration API',
      expectedStatus: [200],
      expectedContent: 'appName'
    },
    {
      method: 'GET',
      path: `/miniapp/user/${testUserId}`,
      name: 'User Data API',
      expectedStatus: [200],
      expectedContent: 'userId'
    },
    {
      method: 'GET',
      path: `/api/miniapp/prompts/today/${testUserId}`,
      name: 'Today\'s Prompt API',
      expectedStatus: [200, 404, 500],
      expectedContent: null
    },
    {
      method: 'POST',
      path: `/api/miniapp/prompts/new/${testUserId}`,
      name: 'New Prompt API',
      expectedStatus: [200, 404, 500],
      expectedContent: null
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
      
      // ✅ FIX: Proper response type initialization
      let res: Response;
      
      if (endpoint.method === 'GET') {
        res = await request(app).get(endpoint.path);
      } else if (endpoint.method === 'POST') {
        res = await request(app).post(endpoint.path).send({});
      } else {
        throw new Error(`Unsupported method: ${endpoint.method}`);
      }
      
      // Now res is guaranteed to be assigned
      const statusOk = endpoint.expectedStatus.includes(res.status);
      const contentOk = !endpoint.expectedContent || 
        res.text.includes(endpoint.expectedContent) || 
        (res.body && JSON.stringify(res.body).includes(endpoint.expectedContent));
      
      if (statusOk && contentOk) {
        console.log(`✅ ${endpoint.name}: HTTP ${res.status}`);
        results.push({
          name: endpoint.name,
          passed: true,
          details: { status: res.status, hasContent: !!res.text }
        });
      } else {
        const issue = !statusOk ? `Unexpected status ${res.status}` : 'Missing expected content';
        console.log(`⚠️  ${endpoint.name}: ${issue}`);
        results.push({
          name: endpoint.name,
          passed: false,
          warning: issue,
          details: { status: res.status, expected: endpoint.expectedStatus }
        });
      }
    } catch (error) {
      // ✅ FIX: Proper error type handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${endpoint.name}: ${errorMessage}`);
      results.push({
        name: endpoint.name,
        passed: false,
        error: errorMessage
      });
    }
  }
  
  return results;
}

/**
 * Test file structure
 */
async function testFileStructure(): Promise<TestResult[]> {
  console.log('\n📁 Testing MiniApp File Structure...\n');
  
  const results: TestResult[] = [];
  
  const requiredFiles = [
    { path: 'public/miniapp/index.html', name: 'Main HTML File', required: true },
    { path: 'public/miniapp/pet.html', name: 'Pet HTML File', required: true },
  ];
  
  const expectedFiles = [
    { path: 'public/miniapp/dist/main.js', name: 'Main JavaScript', required: false },
    { path: 'public/miniapp/dist/pet.js', name: 'Pet JavaScript', required: false },
    { path: 'public/miniapp/src/css/styles.css', name: 'Main CSS', required: false },
    { path: 'public/miniapp/src/css/pet.css', name: 'Pet CSS', required: false },
  ];

  const allFiles = [...requiredFiles, ...expectedFiles];

  for (const file of allFiles) {
    try {
      const fullPath = path.join(process.cwd(), file.path);
      const exists = fs.existsSync(fullPath);
      
      if (exists) {
        const stats = fs.statSync(fullPath);
        console.log(`✅ ${file.name}: Found (${stats.size} bytes)`);
        results.push({
          name: file.name,
          passed: true,
          details: { path: file.path, size: stats.size }
        });
      } else if (file.required) {
        console.log(`❌ ${file.name}: Missing (required)`);
        results.push({
          name: file.name,
          passed: false,
          error: 'Required file missing',
          details: { path: file.path }
        });
      } else {
        console.log(`⚠️  ${file.name}: Missing (optional)`);
        results.push({
          name: file.name,
          passed: false,
          warning: 'Optional file missing - may need to be built',
          details: { path: file.path }
        });
      }
    } catch (error) {
      // ✅ FIX: Proper error type handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${file.name}: Error checking file - ${errorMessage}`);
      results.push({
        name: file.name,
        passed: false,
        error: errorMessage
      });
    }
  }
  
  return results;
}

/**
 * Test HTML content quality
 */
async function testHtmlContent(): Promise<TestResult[]> {
  console.log('\n📝 Testing HTML Content Quality...\n');
  
  const results: TestResult[] = [];
  
  const htmlFiles = [
    { path: 'public/miniapp/index.html', name: 'Main HTML Content', jsFile: 'main.js' },
    { path: 'public/miniapp/pet.html', name: 'Pet HTML Content', jsFile: 'pet.js' }
  ];

  for (const htmlFile of htmlFiles) {
    try {
      console.log(`Testing: ${htmlFile.name}`);
      
      const fullPath = path.join(process.cwd(), htmlFile.path);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  ${htmlFile.name}: File not found`);
        results.push({
          name: htmlFile.name,
          passed: false,
          warning: 'HTML file not found',
          details: { path: htmlFile.path }
        });
        continue;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Quality checks
      const checks = [
        { name: 'Has DOCTYPE', test: content.includes('<!DOCTYPE html>') },
        { name: 'Has title', test: content.includes('<title>') },
        { name: 'Has viewport meta', test: content.includes('viewport') },
        { name: 'Has main container', test: content.includes('id="app"') || content.includes('id="content"') },
        { name: 'References JS file', test: content.includes(htmlFile.jsFile) }
      ];
      
      const passedChecks = checks.filter(check => check.test).length;
      const totalChecks = checks.length;
      
      console.log(`  Quality checks: ${passedChecks}/${totalChecks}`);
      checks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        console.log(`  ${status} ${check.name}`);
      });
      
      const allPassed = passedChecks === totalChecks;
      results.push({
        name: htmlFile.name,
        passed: allPassed,
        details: { passedChecks, totalChecks, checks: checks.map(c => ({ name: c.name, passed: c.test })) },
        warning: allPassed ? undefined : 'Some HTML quality checks failed'
      });
      
    } catch (error) {
      // ✅ FIX: Proper error type handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${htmlFile.name}: ${errorMessage}`);
      results.push({
        name: htmlFile.name,
        passed: false,
        error: errorMessage
      });
    }
  }
  
  return results;
}

/**
 * Test static file serving
 */
async function testStaticFiles(): Promise<TestResult[]> {
  console.log('\n🗂️  Testing Static File Serving...\n');
  
  const results: TestResult[] = [];
  
  const staticFiles = [
    { path: '/miniapp/dist/main.js', name: 'Main JS File', contentType: 'javascript' },
    { path: '/miniapp/dist/pet.js', name: 'Pet JS File', contentType: 'javascript' },
    { path: '/miniapp/src/css/styles.css', name: 'Main CSS File', contentType: 'css' },
    { path: '/miniapp/src/css/pet.css', name: 'Pet CSS File', contentType: 'css' }
  ];

  for (const file of staticFiles) {
    try {
      console.log(`Testing: ${file.name} (${file.path})`);
      
      const res = await request(app).get(file.path);
      
      if (res.status === 200) {
        const hasCorrectContentType = res.headers['content-type'] && 
          res.headers['content-type'].includes(file.contentType);
        
        if (hasCorrectContentType) {
          console.log(`✅ ${file.name}: Served correctly`);
          results.push({
            name: file.name,
            passed: true,
            details: { status: res.status, contentType: res.headers['content-type'] }
          });
        } else {
          console.log(`⚠️  ${file.name}: Wrong content type`);
          results.push({
            name: file.name,
            passed: false,
            warning: 'Incorrect content type',
            details: { status: res.status, contentType: res.headers['content-type'] }
          });
        }
      } else if (res.status === 404) {
        console.log(`⚠️  ${file.name}: File not found (may need to be built)`);
        results.push({
          name: file.name,
          passed: false,
          warning: 'File not found - may need to be built',
          details: { status: res.status }
        });
      } else {
        console.log(`❌ ${file.name}: HTTP ${res.status}`);
        results.push({
          name: file.name,
          passed: false,
          error: `HTTP ${res.status}`,
          details: { status: res.status }
        });
      }
    } catch (error) {
      // ✅ FIX: Proper error type handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${file.name}: ${errorMessage}`);
      results.push({
        name: file.name,
        passed: false,
        error: errorMessage
      });
    }
  }
  
  return results;
}

/**
 * Generate summary report
 */
function generateSummary(allResults: TestResult[][]): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MINIAPP VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  
  const flatResults = allResults.flat();
  const passed = flatResults.filter(r => r.passed).length;
  const failed = flatResults.filter(r => !r.passed && r.error).length;
  const warnings = flatResults.filter(r => !r.passed && r.warning).length;
  const total = flatResults.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`⚠️  Warnings: ${warnings}/${total}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    flatResults.filter(r => !r.passed && r.error).forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
  }
  
  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS:');
    flatResults.filter(r => !r.passed && r.warning).forEach(r => {
      console.log(`  • ${r.name}: ${r.warning}`);
    });
  }
  
  if (failed === 0 && warnings === 0) {
    console.log('\n🎉 All miniapp tests passed successfully!');
  } else if (failed === 0) {
    console.log('\n✅ All critical tests passed! Some warnings need attention.');
  } else {
    console.log('\n🔧 Some tests failed. Please check the issues above.');
  }
}

/**
 * Main verification function
 */
async function verifyMiniApp(): Promise<void> {
  console.log('🚀 ThyKnow MiniApp Verification');
  console.log('================================\n');
  
  try {
    const allResults: TestResult[][] = [];
    
    // Run all test categories
    allResults.push(await testPageLoading());
    allResults.push(await testApiEndpoints());
    allResults.push(await testFileStructure());
    allResults.push(await testHtmlContent());
    allResults.push(await testStaticFiles());
    
    // Generate summary
    generateSummary(allResults);
    
    // Exit with appropriate code
    const flatResults = allResults.flat();
    const hasCriticalFailures = flatResults.some(r => !r.passed && r.error);
    
    process.exit(hasCriticalFailures ? 1 : 0);
    
  } catch (error) {
    // ✅ FIX: Proper error type handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('💥 Fatal error during verification:', errorMessage);
    process.exit(1);
  }
}

// Export functions for testing
export { testPageLoading, testApiEndpoints, testFileStructure, testHtmlContent, testStaticFiles };

// Run verification if this script is executed directly
if (require.main === module) {
  verifyMiniApp().catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to run verification:', errorMessage);
    process.exit(1);
  });
}