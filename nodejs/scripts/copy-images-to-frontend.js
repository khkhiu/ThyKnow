// scripts/copy-images-to-frontend.js
/**
 * Copy dino images from miniapp to frontend public directory
 * This script ensures the PNG files are available for the React frontend
 */

const fs = require('fs');
const path = require('path');

function copyImagesToFrontend() {
  console.log('🖼️  Copying dino images to frontend public directory...');
  
  const projectRoot = path.join(__dirname, '..');
  const sourceDir = path.join(projectRoot, 'public', 'miniapp', 'images');
  const targetDir = path.join(projectRoot, 'frontend', 'public', 'miniapp', 'images');
  
  // Image files to copy
  const imageFiles = [
    'ThyKnow_dino-eyes-open.png',
    'ThyKnow_dino-eyes-close.png',
    'ThyKnow_background.png'
  ];
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✓ Created directory: ${targetDir}`);
  }
  
  // Copy each image file
  imageFiles.forEach(filename => {
    const sourcePath = path.join(sourceDir, filename);
    const targetPath = path.join(targetDir, filename);
    
    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✓ Copied: ${filename}`);
      } catch (error) {
        console.error(`✗ Error copying ${filename}:`, error.message);
      }
    } else {
      console.warn(`⚠️  Source file not found: ${sourcePath}`);
      
      // Create a placeholder image if source doesn't exist
      createPlaceholderImage(targetPath, filename);
    }
  });
  
  console.log('✅ Image copying complete!');
  console.log(`Images are now available in: ${targetDir}`);
}

function createPlaceholderImage(targetPath, filename) {
  console.log(`🎨 Creating placeholder for: ${filename}`);
  
  // Create a simple SVG placeholder that can be used as PNG
  const svgContent = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#4CAF50"/>
  <text x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="14">
    ${filename.includes('open') ? 'DINO OPEN' : filename.includes('close') ? 'DINO CLOSED' : 'BACKGROUND'}
  </text>
  <text x="100" y="120" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="10">
    Placeholder
  </text>
</svg>`;
  
  try {
    // For now, create a simple text file as placeholder
    // In a real scenario, you'd want to use a proper image generation library
    fs.writeFileSync(targetPath.replace('.png', '.svg'), svgContent);
    console.log(`✓ Created SVG placeholder: ${targetPath.replace('.png', '.svg')}`);
  } catch (error) {
    console.error(`✗ Error creating placeholder:`, error.message);
  }
}

// Run the copy function
if (require.main === module) {
  copyImagesToFrontend();
}

module.exports = { copyImagesToFrontend };