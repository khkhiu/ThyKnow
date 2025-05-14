// scripts/fix-html-imports.js
const fs = require('fs');
const path = require('path');

/**
 * Fix JavaScript import paths in HTML files
 * This script updates import paths in the mini-app HTML files
 * to ensure they point to the correct locations
 */
function fixHtmlImports() {
  console.log('Fixing JavaScript import paths in HTML files...');
  
  const htmlFiles = [
    path.join(__dirname, '../public/miniapp/index.html'),
    path.join(__dirname, '../public/miniapp/pet.html')
  ];
  
  htmlFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`Processing ${filePath}...`);
      
      // Read the file content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace import paths for module scripts
      // This adjusts paths that look like: src="dist/js/app/main.js"
      // to use the correct relative path: src="dist/main.js"
      content = content.replace(
        /src="dist\/js\/(.*?)\.js"/g, 
        'src="dist/$1.js"'
      );
      
      // Save the modified content
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  });
  
  console.log('HTML import paths fixed');
}

// Execute the function
fixHtmlImports();