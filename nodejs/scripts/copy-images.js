// scripts/copy-images.js
/**
 * Copy images script
 * This script ensures that the dino images are available in the correct locations
 */

const fs = require('fs');
const path = require('path');

/**
 * Copy dino images to necessary locations
 */
function copyDinoImages() {
  console.log('Copying dino images to required locations...');
  
  // Define image files to copy
  const imageFiles = {
    'ThyKnow_dino-eyes-open.png': {
      sourceDir: path.join(__dirname, '../public/miniapp/images'),
      targetDirs: [
        path.join(__dirname, '../dist/public/miniapp/images')
      ]
    },
    'ThyKnow_dino-eyes-close.png': {
      sourceDir: path.join(__dirname, '../public/miniapp/images'),
      targetDirs: [
        path.join(__dirname, '../dist/public/miniapp/images')
      ]
    },
    'ThyKnow_background.png': {
      sourceDir: path.join(__dirname, '../public/miniapp/images'),
      targetDirs: [
        path.join(__dirname, '../dist/public/miniapp/images')
      ]
    }
  };
  
  // Create default images if they don't exist
  // This is important for initial setup when the real images aren't available yet
  ensureDefaultImages(imageFiles);
  
  // Copy each image to all target directories
  Object.entries(imageFiles).forEach(([filename, locations]) => {
    const sourcePath = path.join(locations.sourceDir, filename);
    
    if (fs.existsSync(sourcePath)) {
      locations.targetDirs.forEach(targetDir => {
        try {
          // Create target directory if it doesn't exist
          fs.mkdirSync(targetDir, { recursive: true });
          
          // Copy the file
          const targetPath = path.join(targetDir, filename);
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Copied ${filename} to ${targetDir}`);
        } catch (error) {
          console.error(`Error copying ${filename} to ${targetDir}:`, error);
        }
      });
    } else {
      console.warn(`Source image not found: ${sourcePath}`);
    }
  });
  
  console.log('Image copying complete');
}

/**
 * Create default images if they don't exist
 * @param {Object} imageFiles - Object containing image file information
 */
function ensureDefaultImages(imageFiles) {
  // Create source directory if it doesn't exist
  Object.values(imageFiles).forEach(({ sourceDir }) => {
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
      console.log(`Created directory: ${sourceDir}`);
    }
  });
  
  // Create default images if they don't exist
  createDefaultImage(
    path.join(imageFiles['ThyKnow_dino-eyes-open.png'].sourceDir, 'ThyKnow_dino-eyes-open.png'),
    [128, 128, 0, 255] // Green
  );
  
  createDefaultImage(
    path.join(imageFiles['ThyKnow_dino-eyes-close.png'].sourceDir, 'ThyKnow_dino-eyes-close.png'),
    [0, 128, 128, 255] // Teal
  );
  
  createDefaultImage(
    path.join(imageFiles['ThyKnow_background.png'].sourceDir, 'ThyKnow_background.png'),
    [200, 230, 255, 255] // Light blue
  );
}

/**
 * Create a simple colored PNG image if it doesn't exist
 * @param {string} filePath - Path where image should be created
 * @param {number[]} color - RGBA color values [r, g, b, a]
 */
function createDefaultImage(filePath, color) {
  if (fs.existsSync(filePath)) {
    return; // Image already exists, no need to create
  }
  
  try {
    // Create a very simple single-color PNG (16x16 pixels)
    // This is a minimal PNG file with a single color
    const width = 16;
    const height = 16;
    const headerSize = 8;
    const ihdrSize = 25;
    const dataSize = width * height * 4 + 12;
    const idatSize = dataSize;
    const iendSize = 12;
    const fileSize = headerSize + ihdrSize + idatSize + iendSize;
    
    const buffer = Buffer.alloc(fileSize);
    
    // PNG signature
    buffer.write('\x89PNG\r\n\x1a\n', 0);
    
    // IHDR chunk
    buffer.writeUInt32BE(13, 8); // Length of IHDR chunk data
    buffer.write('IHDR', 12); // Chunk type
    buffer.writeUInt32BE(width, 16); // Width
    buffer.writeUInt32BE(height, 20); // Height
    buffer[24] = 8; // Bit depth
    buffer[25] = 6; // Color type (RGBA)
    buffer[26] = 0; // Compression method
    buffer[27] = 0; // Filter method
    buffer[28] = 0; // Interlace method
    // CRC (not calculated correctly, but works for display purposes)
    buffer.writeUInt32BE(0, 29);
    
    // IDAT chunk
    const idatStart = headerSize + ihdrSize;
    buffer.writeUInt32BE(width * height * 4, idatStart); // Length of pixel data
    buffer.write('IDAT', idatStart + 4); // Chunk type
    
    // Fill with the specified color
    for (let i = 0; i < width * height; i++) {
      const pixelOffset = idatStart + 8 + i * 4;
      buffer[pixelOffset] = color[0]; // R
      buffer[pixelOffset + 1] = color[1]; // G
      buffer[pixelOffset + 2] = color[2]; // B
      buffer[pixelOffset + 3] = color[3]; // A
    }
    
    // IEND chunk
    const iendStart = idatStart + idatSize;
    buffer.writeUInt32BE(0, iendStart); // Length (0)
    buffer.write('IEND', iendStart + 4); // Chunk type
    buffer.writeUInt32BE(0, iendStart + 8); // CRC
    
    // Write the file
    fs.writeFileSync(filePath, buffer);
    console.log(`Created default image: ${filePath}`);
  } catch (error) {
    console.error(`Error creating default image ${filePath}:`, error);
  }
}

// Execute the copy function
copyDinoImages();