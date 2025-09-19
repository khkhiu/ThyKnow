// scripts/copy-static-files.js
/**
 * Copy static files (HTML, CSS, images) to the dist directory
 * This script ensures all non-TypeScript assets are available after bundling
 * Updated for the new src/ directory structure with organized CSS files
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
    console.log(`Copied: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
  }
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest, exclude = []) {
  try {
    if (!fs.existsSync(src)) {
      console.warn(`Source directory does not exist: ${src}`);
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
    console.error(`Error copying directory ${src} to ${dest}:`, error.message);
  }
}

function copyStaticFiles() {
  console.log('Copying static files for mini-app with new src structure...');
  
  const baseDir = process.cwd();
  
  // Core HTML files that need to be accessible
  const htmlFilesToCheck = [
    {
      src: path.join(baseDir, 'public/miniapp/index.html'),
      desc: 'Main miniapp HTML file'
    },
    {
      src: path.join(baseDir, 'public/miniapp/pet.html'),
      desc: 'Pet app HTML file'
    }
  ];
  
  // CSS files in the new src/css structure
  const cssFilesToCheck = [
    {
      src: path.join(baseDir, 'public/miniapp/src/css/styles.css'),
      desc: 'Main styles CSS file'
    },
    {
      src: path.join(baseDir, 'public/miniapp/src/css/pet.css'),
      desc: 'Pet-specific styles CSS file'
    }
  ];
  
  // Check HTML files
  console.log('\n📄 Checking HTML files...');
  for (const { src, desc } of htmlFilesToCheck) {
    if (fs.existsSync(src)) {
      console.log(`✓ ${desc}: ${src}`);
    } else {
      console.warn(`✗ ${desc} missing: ${src}`);
    }
  }
  
  // Check CSS files in new structure
  console.log('\n🎨 Checking CSS files in src/css/...');
  for (const { src, desc } of cssFilesToCheck) {
    if (fs.existsSync(src)) {
      console.log(`✓ ${desc}: ${src}`);
    } else {
      console.warn(`✗ ${desc} missing: ${src}`);
      
      // Create CSS directory structure if it doesn't exist
      const cssDir = path.dirname(src);
      if (!fs.existsSync(cssDir)) {
        fs.mkdirSync(cssDir, { recursive: true });
        console.log(`Created CSS directory: ${cssDir}`);
      }
    }
  }
  
  // Handle images directory
  const imagesSrc = path.join(baseDir, 'public/miniapp/images');
  console.log(`\n🖼️  Checking images directory: ${imagesSrc}`);
  
  if (fs.existsSync(imagesSrc)) {
    console.log(`✓ Images directory exists: ${imagesSrc}`);
    // Images are already in the right place, just log what we found
    try {
      const images = fs.readdirSync(imagesSrc);
      console.log(`Found ${images.length} image files:`, images);
    } catch (error) {
      console.warn('Could not read images directory:', error.message);
    }
  } else {
    console.warn(`✗ Images directory missing: ${imagesSrc}`);
    // Create default images using the copy-images script
    console.log('Creating default images...');
    try {
      require('./copy-images.js');
    } catch (error) {
      console.error('Failed to create default images:', error.message);
    }
  }
  
  // Ensure dist directory structure exists for bundled output
  console.log('\n📁 Ensuring dist directory structure...');
  const distPaths = [
    'public/miniapp/dist',           // Where esbuild outputs bundles
    'dist/public',                   // For deployment structure
    'dist/public/miniapp',           // Miniapp in deployment
    'dist/public/miniapp/dist',      // Bundles in deployment
    'dist/public/miniapp/src',       // Source structure in deployment (for CSS)
    'dist/public/miniapp/src/css',   // CSS files in deployment
    'dist/public/miniapp/images'     // Images in deployment
  ];
  
  for (const distPath of distPaths) {
    const fullPath = path.join(baseDir, distPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  }
  
  // Copy CSS files to dist for deployment if they exist
  console.log('\n📋 Copying CSS files to dist structure...');
  const cssSourceDir = path.join(baseDir, 'public/miniapp/src/css');
  const cssDestDir = path.join(baseDir, 'dist/public/miniapp/src/css');
  
  if (fs.existsSync(cssSourceDir)) {
    copyDirectory(cssSourceDir, cssDestDir);
  }
  
  // Copy HTML files to dist structure
  console.log('\n📋 Copying HTML files to dist structure...');
  for (const { src } of htmlFilesToCheck) {
    if (fs.existsSync(src)) {
      const fileName = path.basename(src);
      const dest = path.join(baseDir, 'dist/public/miniapp', fileName);
      copyFile(src, dest);
    }
  }
  
  // Copy images to dist structure
  if (fs.existsSync(imagesSrc)) {
    const imagesDestDir = path.join(baseDir, 'dist/public/miniapp/images');
    copyDirectory(imagesSrc, imagesDestDir);
  }
  
  console.log('\n✅ Static files copying complete');
  console.log('Structure is ready for both development and deployment');
}

// Run the copy function
copyStaticFiles();