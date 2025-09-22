// scripts/fix-html-imports.js
/**
 * Fix JavaScript import paths in HTML files
 * This script updates import paths in the mini-app HTML files to ensure they point to the correct locations
 * Updated to work with the new src/ directory structure and modern bundling approach
 */

const fs = require('fs');
const path = require('path');

/**
 * Fix HTML import paths for the new directory structure
 * This function handles path corrections needed after reorganizing the miniapp into src/ folders
 */
function fixHtmlImports() {
  console.log('Fixing JavaScript and CSS import paths in HTML files...');
  console.log('Working with updated miniapp structure (src/ organization)');
  
  // Define the HTML files that need to be processed
  // These are the main entry points for the miniapp
  const htmlFiles = [
    {
      path: path.join(__dirname, '../public/miniapp/index.html'),
      name: 'Main miniapp HTML',
      expectedPaths: {
        script: 'dist/main.js',      // Built TypeScript output
        css: 'src/css/styles.css'    // CSS in new location
      }
    },
    {
      path: path.join(__dirname, '../public/miniapp/pet.html'),
      name: 'Pet app HTML', 
      expectedPaths: {
        script: 'dist/pet.js',       // Built TypeScript output
        css: 'src/css/pet.css'       // Pet-specific CSS
      }
    }
  ];
  
  htmlFiles.forEach(fileInfo => {
    const { path: filePath, name, expectedPaths } = fileInfo;
    
    if (fs.existsSync(filePath)) {
      console.log(`\nProcessing ${name}: ${filePath}`);
      
      try {
        // Read the current content of the HTML file
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fix JavaScript import paths
        // This handles cases where paths might be pointing to old locations
        console.log('  Checking JavaScript imports...');
        
        // Pattern 1: Fix any references to old main.js or pet.js locations
        const oldJsPattern = /src="(?:\.\/)?(?:dist\/js\/|js\/|src\/)?([mp](?:ain|et))\.js"/g;
        const newContent1 = content.replace(oldJsPattern, (match, filename) => {
          const newPath = `dist/${filename}.js`;
          console.log(`    Fixed JS path: ${match} -> src="${newPath}"`);
          modified = true;
          return `src="${newPath}"`;
        });
        content = newContent1;
        
        // Pattern 2: Ensure module type is specified for ES6 modules
        const moduleScriptPattern = /<script\s+src="dist\/(main|pet)\.js"(?!\s+type="module")/g;
        const newContent2 = content.replace(moduleScriptPattern, (match, filename) => {
          const replacement = `<script type="module" src="dist/${filename}.js"`;
          console.log(`    Added module type: ${match} -> ${replacement}`);
          modified = true;
          return replacement;
        });
        content = newContent2;
        
        // Fix CSS import paths for the new src/css structure
        console.log('  Checking CSS imports...');
        
        // Pattern 3: Fix CSS paths that might be pointing to old locations
        const oldCssPattern = /href="(?:\.\/)?(?:css\/|styles\/)?([^"]*\.css)"/g;
        const newContent3 = content.replace(oldCssPattern, (match, filename) => {
          // Determine the correct CSS path based on the filename
          let newPath;
          if (filename.includes('pet')) {
            newPath = 'src/css/pet.css';
          } else if (filename.includes('styles') || filename === 'styles.css') {
            newPath = 'src/css/styles.css';
          } else {
            // Keep the filename but put it in the src/css directory
            newPath = `src/css/${filename}`;
          }
          
          console.log(`    Fixed CSS path: ${match} -> href="${newPath}"`);
          modified = true;
          return `href="${newPath}"`;
        });
        content = newContent3;
        
        // Verify that expected paths are present in the content
        console.log('  Verifying expected paths are present...');
        
        // Check for JavaScript path
        if (expectedPaths.script && !content.includes(`src="${expectedPaths.script}"`)) {
          console.warn(`    Warning: Expected script path not found: ${expectedPaths.script}`);
        } else {
          console.log(`    ✓ Found expected script: ${expectedPaths.script}`);
        }
        
        // Check for CSS path
        if (expectedPaths.css && !content.includes(`href="${expectedPaths.css}"`)) {
          console.warn(`    Warning: Expected CSS path not found: ${expectedPaths.css}`);
        } else {
          console.log(`    ✓ Found expected CSS: ${expectedPaths.css}`);
        }
        
        // Save the modified content if changes were made
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  ✅ Updated ${name} with corrected paths`);
        } else {
          console.log(`  ✓ ${name} already has correct paths`);
        }
        
      } catch (error) {
        console.error(`  ✗ Error processing ${name}:`, error.message);
      }
      
    } else {
      console.warn(`File not found: ${filePath}`);
      console.log('  This might be expected if the HTML files are generated or located elsewhere.');
    }
  });
  
  console.log('\n🔧 HTML import path fixing complete');
  console.log('\nWhat this script accomplished:');
  console.log('- Updated JavaScript imports to point to dist/ directory (built outputs)');
  console.log('- Updated CSS imports to point to src/css/ directory (organized source files)');
  console.log('- Ensured proper module type attributes for ES6 module loading');
  console.log('- Verified expected paths are present in the HTML files');
}

/**
 * Additional helper function to validate HTML structure
 * This can be called separately to check if HTML files have the expected structure
 */
function validateHtmlStructure() {
  console.log('\n🔍 Validating HTML structure...');
  
  const htmlFiles = [
    path.join(__dirname, '../public/miniapp/index.html'),
    path.join(__dirname, '../public/miniapp/pet.html')
  ];
  
  htmlFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      console.log(`\nValidating ${fileName}:`);
      
      // Check for essential elements
      const checks = [
        { 
          test: content.includes('type="module"'), 
          message: 'ES6 module script tag' 
        },
        { 
          test: content.includes('src/css/'), 
          message: 'CSS in src/css/ directory' 
        },
        { 
          test: content.includes('dist/'), 
          message: 'JavaScript in dist/ directory' 
        },
        { 
          test: content.includes('telegram-web-app.js'), 
          message: 'Telegram WebApp script' 
        }
      ];
      
      checks.forEach(({ test, message }) => {
        console.log(`  ${test ? '✓' : '✗'} ${message}`);
      });
    }
  });
}

// Execute the function when this script is run directly
if (require.main === module) {
  fixHtmlImports();
  
  // Also run validation if --validate flag is passed
  if (process.argv.includes('--validate')) {
    validateHtmlStructure();
  }
}

// Export functions for use by other scripts
module.exports = {
  fixHtmlImports,
  validateHtmlStructure
};