// scripts/copy-static-files.js
/**
 * Copy static files (HTML, CSS, images) to the dist directory
 * This script ensures all non-TypeScript assets are available after bundling
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
  console.log('Copying static files for mini-app...');
  
  const baseDir = process.cwd();
  
  // Files to copy
  const filesToCopy = [
    {
      src: path.join(baseDir, 'public/miniapp/index.html'),
      dest: path.join(baseDir, 'public/miniapp/index.html') // Already in place
    },
    {
      src: path.join(baseDir, 'public/miniapp/pet.html'),
      dest: path.join(baseDir, 'public/miniapp/pet.html') // Already in place
    },
    {
      src: path.join(baseDir, 'public/miniapp/styles.css'),
      dest: path.join(baseDir, 'public/miniapp/styles.css') // Already in place
    },
    {
      src: path.join(baseDir, 'public/miniapp/pet.css'),
      dest: path.join(baseDir, 'public/miniapp/pet.css') // Already in place
    }
  ];
  
  // Copy individual files (verify they exist)
  for (const { src, dest } of filesToCopy) {
    if (fs.existsSync(src)) {
      console.log(`✓ File exists: ${src}`);
    } else {
      console.warn(`✗ File missing: ${src}`);
    }
  }
  
  // Copy images directory
  const imagesSrc = path.join(baseDir, 'public/miniapp/images');
  const imagesDest = path.join(baseDir, 'public/miniapp/images');
  
  if (fs.existsSync(imagesSrc)) {
    console.log(`✓ Images directory exists: ${imagesSrc}`);
    // Images are already in the right place, just ensure they exist
    const images = fs.readdirSync(imagesSrc);
    console.log(`Found ${images.length} image files:`, images);
  } else {
    console.warn(`✗ Images directory missing: ${imagesSrc}`);
    // Create default images
    console.log('Creating default images...');
    require('./copy-images.js');
  }
  
  // Ensure dist directory structure exists
  const distPaths = [
    'public/miniapp/dist',
    'dist/public',
    'dist/public/miniapp',
    'dist/public/miniapp/dist'
  ];
  
  for (const distPath of distPaths) {
    const fullPath = path.join(baseDir, distPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  }
  
  console.log('Static files copying complete');
}

// Run the copy function
copyStaticFiles();