// scripts/debug-frontend-build.js
// Debug script to check frontend build status and fix common issues

const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return `${(stats.size / 1024).toFixed(2)} KB`;
  } catch (error) {
    return 'Unable to get size';
  }
}

function listDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return ['Directory does not exist'];
    }
    return fs.readdirSync(dirPath);
  } catch (error) {
    return [`Error reading directory: ${error.message}`];
  }
}

console.log('🔍 ThyKnow Frontend Build Debug Tool');
console.log('=====================================\n');

// Check project structure
console.log('📁 Project Structure Check:');
console.log('----------------------------');

const projectRoot = process.cwd();
console.log(`Project root: ${projectRoot}`);

// Check if frontend directory exists
const frontendDir = path.join(projectRoot, 'frontend');
console.log(`Frontend directory: ${checkFileExists(frontendDir) ? '✅' : '❌'} ${frontendDir}`);

if (checkFileExists(frontendDir)) {
  const frontendFiles = listDirectory(frontendDir);
  console.log(`Frontend contents: ${frontendFiles.join(', ')}`);
  
  // Check package.json
  const frontendPackageJson = path.join(frontendDir, 'package.json');
  console.log(`Frontend package.json: ${checkFileExists(frontendPackageJson) ? '✅' : '❌'}`);
  
  // Check node_modules
  const frontendNodeModules = path.join(frontendDir, 'node_modules');
  console.log(`Frontend node_modules: ${checkFileExists(frontendNodeModules) ? '✅' : '❌'}`);
}

// Check build output
console.log('\n📦 Build Output Check:');
console.log('----------------------');

const distDir = path.join(projectRoot, 'dist');
console.log(`Dist directory: ${checkFileExists(distDir) ? '✅' : '❌'} ${distDir}`);

if (checkFileExists(distDir)) {
  const distContents = listDirectory(distDir);
  console.log(`Dist contents: ${distContents.join(', ')}`);
}

const frontendDistDir = path.join(projectRoot, 'dist', 'frontend');
console.log(`Frontend dist directory: ${checkFileExists(frontendDistDir) ? '✅' : '❌'} ${frontendDistDir}`);

if (checkFileExists(frontendDistDir)) {
  const frontendDistContents = listDirectory(frontendDistDir);
  console.log(`Frontend dist contents: ${frontendDistContents.join(', ')}`);
  
  // Check critical files
  const indexHtml = path.join(frontendDistDir, 'index.html');
  console.log(`index.html: ${checkFileExists(indexHtml) ? '✅' : '❌'} ${checkFileExists(indexHtml) ? getFileSize(indexHtml) : 'Missing'}`);
  
  // Check assets directory
  const assetsDir = path.join(frontendDistDir, 'assets');
  if (checkFileExists(assetsDir)) {
    const assetFiles = listDirectory(assetsDir);
    console.log(`Assets: ✅ ${assetFiles.length} files (${assetFiles.slice(0, 5).join(', ')}${assetFiles.length > 5 ? '...' : ''})`);
  } else {
    console.log(`Assets directory: ❌ Missing`);
  }
}

// Check old miniapp structure (for comparison)
console.log('\n🗂️  Old MiniApp Structure Check:');
console.log('--------------------------------');

const oldMiniappDir = path.join(projectRoot, 'public', 'miniapp');
console.log(`Old miniapp directory: ${checkFileExists(oldMiniappDir) ? '✅' : '❌'} ${oldMiniappDir}`);

if (checkFileExists(oldMiniappDir)) {
  const oldIndexHtml = path.join(oldMiniappDir, 'index.html');
  console.log(`Old index.html: ${checkFileExists(oldIndexHtml) ? '✅' : '❌'} ${checkFileExists(oldIndexHtml) ? getFileSize(oldIndexHtml) : 'Missing'}`);
}

// Environment check
console.log('\n🌍 Environment Check:');
console.log('---------------------');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Current working directory: ${process.cwd()}`);

// Suggested commands
console.log('\n💡 Suggested Fix Commands:');
console.log('---------------------------');

if (!checkFileExists(frontendDistDir) || !checkFileExists(path.join(frontendDistDir, 'index.html'))) {
  console.log('🔧 Frontend not built. Run these commands:');
  console.log('   cd frontend');
  console.log('   npm install');
  console.log('   npm run build');
  console.log('   cd ..');
  
  console.log('\n🔧 Or use the project build command:');
  console.log('   npm run build:frontend');
}

if (checkFileExists(frontendDistDir) && checkFileExists(path.join(frontendDistDir, 'index.html'))) {
  console.log('✅ Frontend appears to be built correctly!');
  console.log('🔧 If still having issues, try:');
  console.log('   npm run dev (for development)');
  console.log('   npm run build (for production build)');
}

console.log('\n📋 Full Build Command Sequence:');
console.log('--------------------------------');
console.log('npm run clean');
console.log('npm run install:frontend');
console.log('npm run build');

console.log('\n🚀 Development Mode:');
console.log('--------------------');
console.log('npm run dev');
console.log('(This runs both backend and frontend in development mode)');