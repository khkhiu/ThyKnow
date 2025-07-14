// scripts/verify-build.js
/**
 * Build verification script for Railway deployment
 * This script checks if all required files exist after the build process
 */

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

function listDirectory(dirPath, recursive = false) {
  try {
    if (!fs.existsSync(dirPath)) {
      return ['Directory does not exist'];
    }
    
    const items = fs.readdirSync(dirPath);
    if (!recursive) {
      return items;
    }
    
    const allItems = [];
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        allItems.push(`${item}/`);
        const subItems = listDirectory(itemPath, true);
        subItems.forEach(subItem => {
          if (subItem !== 'Directory does not exist') {
            allItems.push(`${item}/${subItem}`);
          }
        });
      } else {
        allItems.push(item);
      }
    });
    
    return allItems;
  } catch (error) {
    return [`Error reading directory: ${error.message}`];
  }
}

function verifyBuild() {
  console.log('🔍 ThyKnow Build Verification');
  console.log('=============================\n');

  const projectRoot = process.cwd();
  console.log(`Project root: ${projectRoot}\n`);

  // Critical files that must exist for the app to start
  const criticalFiles = [
    'dist/src/server.js',
    'package.json',
    'dist/frontend/index.html'
  ];

  // Important directories
  const importantDirs = [
    'dist',
    'dist/src',
    'dist/frontend',
    'frontend/public',
    'public'
  ];

  console.log('🎯 Checking Critical Files:');
  console.log('----------------------------');
  
  let criticalFilesMissing = 0;
  
  criticalFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    const exists = checkFileExists(fullPath);
    const status = exists ? '✅' : '❌';
    const size = exists ? getFileSize(fullPath) : 'Missing';
    
    console.log(`${status} ${file}: ${size}`);
    
    if (!exists) {
      criticalFilesMissing++;
    }
  });

  console.log('\n📁 Checking Important Directories:');
  console.log('-----------------------------------');
  
  importantDirs.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    const exists = checkFileExists(fullPath);
    const status = exists ? '✅' : '❌';
    
    console.log(`${status} ${dir}/`);
    
    if (exists) {
      const contents = listDirectory(fullPath);
      console.log(`    Contents: ${contents.slice(0, 5).join(', ')}${contents.length > 5 ? '...' : ''} (${contents.length} items)`);
    }
  });

  // Detailed dist/src analysis
  console.log('\n🔍 Detailed dist/src Analysis:');
  console.log('------------------------------');
  
  const distSrcPath = path.join(projectRoot, 'dist', 'src');
  if (checkFileExists(distSrcPath)) {
    const distSrcContents = listDirectory(distSrcPath, true);
    console.log('✅ dist/src directory exists');
    console.log('Files found:');
    distSrcContents.forEach(file => {
      console.log(`  - ${file}`);
    });
  } else {
    console.log('❌ dist/src directory missing');
    
    // Check if any dist directory exists
    const distPath = path.join(projectRoot, 'dist');
    if (checkFileExists(distPath)) {
      console.log('dist directory exists, contents:');
      const distContents = listDirectory(distPath, true);
      distContents.forEach(file => {
        console.log(`  - ${file}`);
      });
    } else {
      console.log('❌ No dist directory found at all');
    }
  }

  // TypeScript configuration check
  console.log('\n⚙️  TypeScript Configuration Check:');
  console.log('-----------------------------------');
  
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  if (checkFileExists(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      console.log('✅ tsconfig.json found');
      console.log(`    outDir: ${tsconfig.compilerOptions?.outDir || 'not specified'}`);
      console.log(`    rootDir: ${tsconfig.compilerOptions?.rootDir || 'not specified'}`);
      console.log(`    include: ${JSON.stringify(tsconfig.include || 'not specified')}`);
    } catch (error) {
      console.log('❌ Error reading tsconfig.json:', error.message);
    }
  } else {
    console.log('❌ tsconfig.json not found');
  }

  // Build summary
  console.log('\n📊 Build Summary:');
  console.log('=================');
  
  if (criticalFilesMissing === 0) {
    console.log('✅ All critical files present - deployment should work!');
  } else {
    console.log(`❌ ${criticalFilesMissing} critical files missing - deployment will fail`);
    
    console.log('\n🔧 Suggested fixes:');
    console.log('- Run: npm run build');
    console.log('- Check TypeScript compilation errors');
    console.log('- Ensure tsconfig.json outDir is set to "./dist"');
    console.log('- Verify src/server.ts exists');
  }
  
  // Environment check
  console.log('\n🌍 Environment:');
  console.log('---------------');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Node.js: ${process.version}`);
  
  return criticalFilesMissing === 0;
}

// Run verification if called directly
if (require.main === module) {
  const success = verifyBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { verifyBuild };