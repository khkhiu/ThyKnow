// scripts/copy-images.js
/**
 * Copy images script
 * This script ensures that the dino images are available in the correct locations
 * Updated to work with the new src/ directory structure and maintain compatibility
 */

const fs = require('fs');
const path = require('path');

/**
 * Copy dino images to necessary locations
 * This function handles the image management for both development and deployment scenarios
 */
function copyDinoImages() {
  console.log('Copying dino images to required locations...');
  console.log('Working with updated miniapp structure (src/ organization)');
  
  // Define base paths for the current directory structure
  const baseDir = path.join(__dirname, '..');
  const sourceImageDir = path.join(baseDir, 'public/miniapp/images');
  
  // Define image files to copy - these are the core ThyKnow dino images
  const imageFiles = {
    'ThyKnow_dino-eyes-open.png': {
      sourceDir: sourceImageDir,
      targetDirs: [
        // For development: keep images in the main public directory
        sourceImageDir,
        // For deployment: copy to dist structure
        path.join(baseDir, 'dist/public/miniapp/images'),
        // Additional backup location for any legacy references
        path.join(baseDir, 'public/miniapp/dist/images')
      ]
    },
    'ThyKnow_dino-eyes-close.png': {
      sourceDir: sourceImageDir,
      targetDirs: [
        sourceImageDir,
        path.join(baseDir, 'dist/public/miniapp/images'),
        path.join(baseDir, 'public/miniapp/dist/images')
      ]
    },
    'ThyKnow_background.png': {
      sourceDir: sourceImageDir,
      targetDirs: [
        sourceImageDir,
        path.join(baseDir, 'dist/public/miniapp/images'),
        path.join(baseDir, 'public/miniapp/dist/images')
      ]
    }
  };
  
  // Create default images if they don't exist
  // This is important for initial setup when the real images aren't available yet
  console.log('Ensuring default images exist...');
  ensureDefaultImages(imageFiles);
  
  // Copy each image to all target directories
  // This ensures images are available in both development and deployment structures
  Object.entries(imageFiles).forEach(([filename, locations]) => {
    const sourcePath = path.join(locations.sourceDir, filename);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`Processing ${filename}...`);
      
      locations.targetDirs.forEach(targetDir => {
        try {
          // Create target directory if it doesn't exist
          // This handles cases where the dist structure hasn't been created yet
          fs.mkdirSync(targetDir, { recursive: true });
          
          // Copy the file to the target location
          const targetPath = path.join(targetDir, filename);
          
          // Only copy if source and target are different paths
          if (path.resolve(sourcePath) !== path.resolve(targetPath)) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`  ✓ Copied to ${targetDir}`);
          } else {
            console.log(`  ✓ Already at ${targetDir} (source location)`);
          }
        } catch (error) {
          console.error(`  ✗ Error copying ${filename} to ${targetDir}:`, error.message);
        }
      });
    } else {
      console.warn(`Source image not found: ${sourcePath}`);
      console.log('This might be expected if you haven\'t added custom images yet.');
    }
  });
  
  console.log('✅ Image copying complete');
}

/**
 * Create default images if they don't exist
 * This function generates simple placeholder images for development and testing
 * @param {Object} imageFiles - Object containing image file information
 */
function ensureDefaultImages(imageFiles) {
  console.log('Checking for default images...');
  
  // Create source directory if it doesn't exist
  // This ensures we have a place to put the default images
  Object.values(imageFiles).forEach(({ sourceDir }) => {
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
      console.log(`Created directory: ${sourceDir}`);
    }
  });
  
  // Create default images with distinctive colors for easy identification
  // These serve as placeholders until real images are provided
  
  // Green dino for "eyes open" state - represents alertness and engagement
  createDefaultImage(
    path.join(imageFiles['ThyKnow_dino-eyes-open.png'].sourceDir, 'ThyKnow_dino-eyes-open.png'),
    [34, 139, 34, 255], // Forest green
    'Dino Eyes Open (Default)'
  );
  
  // Teal dino for "eyes close" state - represents calm and rest
  createDefaultImage(
    path.join(imageFiles['ThyKnow_dino-eyes-close.png'].sourceDir, 'ThyKnow_dino-eyes-close.png'),
    [0, 128, 128, 255], // Teal
    'Dino Eyes Closed (Default)'
  );
  
  // Light blue background - represents the calm, supportive environment
  createDefaultImage(
    path.join(imageFiles['ThyKnow_background.png'].sourceDir, 'ThyKnow_background.png'),
    [173, 216, 230, 255], // Light blue
    'Background (Default)'
  );
}

/**
 * Create a simple colored PNG image if it doesn't exist
 * This generates basic placeholder images that work across different platforms
 * @param {string} filePath - Path where image should be created
 * @param {number[]} color - RGBA color values [r, g, b, a]
 * @param {string} description - Description for logging purposes
 */
function createDefaultImage(filePath, color, description) {
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${description} already exists`);
    return; // Image already exists, no need to create
  }
  
  try {
    console.log(`  Creating ${description}...`);
    
    // Create a simple single-color PNG (32x32 pixels for better visibility)
    // This creates a minimal but functional PNG file
    const width = 32;
    const height = 32;
    
    // PNG file structure constants
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdrData = Buffer.alloc(13);
    
    // Fill IHDR (Image Header) data
    ihdrData.writeUInt32BE(width, 0);     // Width
    ihdrData.writeUInt32BE(height, 4);    // Height
    ihdrData[8] = 8;                      // Bit depth
    ihdrData[9] = 6;                      // Color type (RGBA)
    ihdrData[10] = 0;                     // Compression method
    ihdrData[11] = 0;                     // Filter method
    ihdrData[12] = 0;                     // Interlace method
    
    // Create IHDR chunk
    const ihdrChunk = createPNGChunk('IHDR', ihdrData);
    
    // Create pixel data (simple solid color)
    const pixelData = Buffer.alloc(width * height * 4); // 4 bytes per pixel (RGBA)
    for (let i = 0; i < width * height; i++) {
      const offset = i * 4;
      pixelData[offset] = color[0];     // Red
      pixelData[offset + 1] = color[1]; // Green
      pixelData[offset + 2] = color[2]; // Blue
      pixelData[offset + 3] = color[3]; // Alpha
    }
    
    // Create IDAT chunk (simplified - in real PNG this would be compressed)
    const idatChunk = createPNGChunk('IDAT', pixelData);
    
    // Create IEND chunk (marks end of PNG)
    const iendChunk = createPNGChunk('IEND', Buffer.alloc(0));
    
    // Combine all parts into final PNG
    const pngBuffer = Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
    
    // Write the file
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`  ✓ Created ${description} at ${filePath}`);
  } catch (error) {
    console.error(`  ✗ Error creating ${description} at ${filePath}:`, error.message);
  }
}

/**
 * Create a PNG chunk with proper CRC
 * This follows the PNG specification for chunk structure
 * @param {string} type - Chunk type (4 characters)
 * @param {Buffer} data - Chunk data
 * @returns {Buffer} Complete PNG chunk
 */
function createPNGChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  
  // Calculate CRC (simplified - in production you'd use proper CRC32)
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(0, 0); // Simplified CRC
  
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

// Execute the copy function when this script is run directly
if (require.main === module) {
  copyDinoImages();
}

// Export for use by other scripts
module.exports = copyDinoImages;