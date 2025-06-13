// scripts/cleanup-and-build.js
/**
 * Comprehensive cleanup and build script for the miniapp
 * This script handles the complete build process with proper cleanup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = process.cwd();

function log(message) {
  console.log(`🔧 ${message}`);
}

function warn(message) {
  console.log(`⚠️ ${message}`);
}

function error(message) {
  console.log(`❌ ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

/**
 * Remove directory and all contents
 */
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    log(`Removing directory: ${path.relative(baseDir, dirPath)}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Ensure directory exists
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    log(`Creating directory: ${path.relative(baseDir, dirPath)}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Clean old build artifacts and deprecated directory structure
 */
function cleanup() {
  log('Starting cleanup...');
  
  // Remove old build outputs
  const toRemove = [
    path.join(baseDir, 'dist'),
    path.join(baseDir, 'public/miniapp/dist'),
    // Remove old directory structure
    path.join(baseDir, 'public/miniapp/js'),
    path.join(baseDir, 'public/miniapp/js/app'),
    path.join(baseDir, 'public/miniapp/js/pet'),
  ];
  
  for (const dir of toRemove) {
    removeDirectory(dir);
  }
  
  success('Cleanup completed');
}

/**
 * Setup the correct directory structure
 */
function setupDirectories() {
  log('Setting up directory structure...');
  
  const directories = [
    'public',
    'public/miniapp',
    'public/miniapp/dist',
    'public/miniapp/images',
    'dist',
    'dist/public',
    'dist/public/miniapp',
    'dist/public/miniapp/dist',
    'dist/public/miniapp/images'
  ];
  
  for (const dir of directories) {
    ensureDirectory(path.join(baseDir, dir));
  }
  
  success('Directory structure setup completed');
}

/**
 * Build the TypeScript backend
 */
function buildBackend() {
  log('Building TypeScript backend...');
  try {
    execSync('npm run build:backend', { stdio: 'inherit' });
    success('Backend build completed');
  } catch (err) {
    error('Backend build failed');
    throw err;
  }
}

/**
 * Build the frontend JavaScript bundles
 */
function buildFrontend() {
  log('Building frontend bundles...');
  try {
    // Check if TypeScript files exist
    const mainTs = path.join(baseDir, 'public/miniapp/main.ts');
    const petTs = path.join(baseDir, 'public/miniapp/pet.ts');
    
    if (!fs.existsSync(mainTs)) {
      warn(`main.ts not found at ${mainTs}`);
    }
    if (!fs.existsSync(petTs)) {
      warn(`pet.ts not found at ${petTs}`);
    }
    
    execSync('npm run build:frontend', { stdio: 'inherit' });
    success('Frontend build completed');
  } catch (err) {
    error('Frontend build failed');
    throw err;
  }
}

/**
 * Copy static files and create final distribution
 */
function copyFiles() {
  log('Copying static files...');
  try {
    execSync('npm run copy-public', { stdio: 'inherit' });
    success('File copying completed');
  } catch (err) {
    error('File copying failed');
    throw err;
  }
}

/**
 * Fix HTML import paths to match new structure
 */
function fixHtmlImports() {
  log('Fixing HTML import paths...');
  
  const htmlFiles = [
    path.join(baseDir, 'public/miniapp/index.html'),
    path.join(baseDir, 'public/miniapp/pet.html'),
    path.join(baseDir, 'dist/public/miniapp/index.html'),
    path.join(baseDir, 'dist/public/miniapp/pet.html')
  ];
  
  for (const filePath of htmlFiles) {
    if (fs.existsSync(filePath)) {
      log(`Processing ${path.relative(baseDir, filePath)}...`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace old import paths
      // From: src="dist/js/app/main.js" or similar
      // To: src="dist/main.js"
      content = content.replace(
        /src="dist\/js\/(app|pet)\/(.*?)\.js"/g, 
        'src="dist/$2.js"'
      );
      
      // Also fix any remaining js/ references
      content = content.replace(
        /src="dist\/js\/(.*?)\.js"/g, 
        'src="dist/$1.js"'
      );
      
      // Save the updated content
      fs.writeFileSync(filePath, content);
      log(`Updated ${path.relative(baseDir, filePath)}`);
    }
  }
  
  success('HTML import paths fixed');
}

/**
 * Verify the build output
 */
function verifyBuild() {
  log('Verifying build output...');
  
  const criticalFiles = [
    'dist/src/server.js',
    'public/miniapp/index.html',
    'public/miniapp/pet.html',
    'public/miniapp/dist/main.js',
    'public/miniapp/dist/pet.js',
    'dist/public/miniapp/index.html',
    'dist/public/miniapp/pet.html',
    'dist/public/miniapp/dist/main.js',
    'dist/public/miniapp/dist/pet.js'
  ];
  
  let allGood = true;
  
  for (const file of criticalFiles) {
    const fullPath = path.join(baseDir, file);
    if (fs.existsSync(fullPath)) {
      success(`✓ ${file}`);
    } else {
      error(`✗ ${file} - MISSING!`);
      allGood = false;
    }
  }
  
  if (allGood) {
    success('Build verification passed!');
  } else {
    error('Build verification failed - some critical files are missing');
    process.exit(1);
  }
}

/**
 * Main build function
 */
function main() {
  console.log('🏗️ Starting comprehensive miniapp build process...\n');
  
  try {
    cleanup();
    console.log('');
    
    setupDirectories();
    console.log('');
    
    buildBackend();
    console.log('');
    
    buildFrontend();
    console.log('');
    
    copyFiles();
    console.log('');
    
    fixHtmlImports();
    console.log('');
    
    verifyBuild();
    console.log('');
    
    success('🎉 Complete build process finished successfully!');
    
  } catch (err) {
    error('Build process failed:');
    console.error(err.message);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  cleanup,
  setupDirectories,
  buildBackend,
  buildFrontend,
  copyFiles,
  fixHtmlImports,
  verifyBuild,
  main
};

// Run if called directly
if (require.main === module) {
  main();
}