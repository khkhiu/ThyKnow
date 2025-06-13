// scripts/copy-static-files.js
/**
 * Copy static files (HTML, CSS, images) to the dist directory
 * Updated to work with simplified miniapp directory structure
 */

const fs = require('fs');
const path = require('path');

/**
 * Copy a file from source to destination, creating directories as needed
 */
function copyFile(src, dest) {
  try {
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied: ${path.relative(process.cwd(), src)} → ${path.relative(process.cwd(), dest)}`);
  } catch (error) {
    console.error(`✗ Error copying ${src} to ${dest}:`, error.message);
  }
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest, exclude = []) {
  try {
    if (!fs.existsSync(src)) {
      console.warn(`⚠ Source directory does not exist: ${src}`);
      return;
    }
    
    // Create destination directory
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Read directory contents
    const items = fs.readdirSync(src);
    
    for (const item of items) {
      // Skip excluded items
      if (exclude.includes(item)) {
        continue;
      }
      
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stats = fs.statSync(srcPath);
      
      if (stats.isDirectory()) {
        copyDirectory(srcPath, destPath, exclude);
      } else {
        copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(`✗ Error copying directory ${src} to ${dest}:`, error.message);
  }
}

function copyStaticFiles() {
  console.log('📦 Copying static files for mini-app...');
  
  const baseDir = process.cwd();
  
  // Simplified directory structure - everything in public/miniapp/
  const miniappDir = path.join(baseDir, 'public/miniapp');
  const distMiniappDir = path.join(baseDir, 'dist/public/miniapp');
  
  // Ensure base directories exist
  const dirsToEnsure = [
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
  
  for (const dir of dirsToEnsure) {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
  
  // Files to copy from miniapp to dist/public/miniapp
  const filesToCopy = [
    'index.html',
    'pet.html',
    'styles.css',
    'pet.css'
  ];
  
  // Copy individual files
  console.log('\n📄 Copying HTML and CSS files...');
  for (const file of filesToCopy) {
    const src = path.join(miniappDir, file);
    const dest = path.join(distMiniappDir, file);
    
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      console.warn(`⚠ File missing: ${path.relative(baseDir, src)}`);
    }
  }
  
  // Copy JavaScript bundles if they exist
  console.log('\n🔧 Copying JavaScript bundles...');
  const jsBundles = ['main.js', 'pet.js'];
  const jsDistSrc = path.join(miniappDir, 'dist');
  const jsDistDest = path.join(distMiniappDir, 'dist');
  
  for (const bundle of jsBundles) {
    const srcFile = path.join(jsDistSrc, bundle);
    const destFile = path.join(jsDistDest, bundle);
    
    if (fs.existsSync(srcFile)) {
      copyFile(srcFile, destFile);
      
      // Also copy source maps if they exist
      const sourceMapSrc = srcFile + '.map';
      const sourceMapDest = destFile + '.map';
      if (fs.existsSync(sourceMapSrc)) {
        copyFile(sourceMapSrc, sourceMapDest);
      }
    } else {
      console.warn(`⚠ Bundle missing: ${path.relative(baseDir, srcFile)}`);
    }
  }
  
  // Copy images directory
  console.log('\n🖼️ Copying images...');
  const imagesSrc = path.join(miniappDir, 'images');
  const imagesDest = path.join(distMiniappDir, 'images');
  
  if (fs.existsSync(imagesSrc)) {
    copyDirectory(imagesSrc, imagesDest);
    const images = fs.readdirSync(imagesSrc);
    console.log(`✓ Copied ${images.length} image files`);
  } else {
    console.warn(`⚠ Images directory missing: ${path.relative(baseDir, imagesSrc)}`);
    // Create default images
    console.log('🎨 Creating default images...');
    try {
      require('./copy-images.js');
    } catch (error) {
      console.warn('⚠ Could not create default images:', error.message);
    }
  }
  
  // Clean up old directory structure if it exists
  console.log('\n🧹 Cleaning up old directory structure...');
  const oldDirs = [
    path.join(miniappDir, 'js'),
    path.join(distMiniappDir, 'js')
  ];
  
  for (const oldDir of oldDirs) {
    if (fs.existsSync(oldDir)) {
      console.log(`🗑️ Removing old directory: ${path.relative(baseDir, oldDir)}`);
      fs.rmSync(oldDir, { recursive: true, force: true });
    }
  }
  
  console.log('\n✅ Static files copying complete');
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Source: ${path.relative(baseDir, miniappDir)}`);
  console.log(`   Destination: ${path.relative(baseDir, distMiniappDir)}`);
  
  // Verify final structure
  if (fs.existsSync(distMiniappDir)) {
    const files = fs.readdirSync(distMiniappDir, { withFileTypes: true });
    console.log(`   Files in destination: ${files.length}`);
    files.forEach(file => {
      const icon = file.isDirectory() ? '📁' : '📄';
      console.log(`     ${icon} ${file.name}`);
    });
  }
}

// Run the copy function
if (require.main === module) {
  copyStaticFiles();
}

module.exports = { copyStaticFiles };