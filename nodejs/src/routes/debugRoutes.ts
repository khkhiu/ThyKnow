// src/routes/debugRoutes.ts
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /debug/paths
 * Provides detailed information about file and directory structure
 * Updated to work with simplified miniapp structure
 */
router.get('/paths', async (_req: Request, res: Response) => {
  try {
    const cwd = process.cwd();
    const debug: any = {
      cwd,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      directories: {},
      files: {},
      summary: {}
    };

    // Check key directories with simplified structure
    const directoriesToCheck = [
      'public',
      'public/miniapp',
      'public/miniapp/dist',
      'public/miniapp/images',
      'dist',
      'dist/public',
      'dist/public/miniapp',
      'dist/public/miniapp/dist',
      'dist/public/miniapp/images',
      // Legacy directories (should not exist anymore)
      'public/miniapp/js',
      'public/miniapp/js/app',
      'public/miniapp/js/pet'
    ];

    for (const dir of directoriesToCheck) {
      const fullPath = path.join(cwd, dir);
      debug.directories[dir] = {
        exists: fs.existsSync(fullPath),
        path: fullPath,
        isLegacy: dir.includes('/js/')
      };

      if (fs.existsSync(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          debug.directories[dir].isDirectory = stats.isDirectory();
          
          if (stats.isDirectory()) {
            const items = fs.readdirSync(fullPath);
            debug.directories[dir].itemCount = items.length;
            debug.directories[dir].items = items.map(file => {
              const filePath = path.join(fullPath, file);
              const fileStats = fs.statSync(filePath);
              return {
                name: file,
                isDirectory: fileStats.isDirectory(),
                size: fileStats.size,
              };
            });
          }
        } catch (error) {
          debug.directories[dir].error = (error as Error).message;
        }
      }
    }

    // Check important files
    const filesToCheck = [
      // HTML files
      'public/miniapp/index.html',
      'public/miniapp/pet.html',
      'dist/public/miniapp/index.html',
      'dist/public/miniapp/pet.html',
      
      // CSS files
      'public/miniapp/styles.css',
      'public/miniapp/pet.css',
      'dist/public/miniapp/styles.css',
      'dist/public/miniapp/pet.css',
      
      // TypeScript source files
      'public/miniapp/main.ts',
      'public/miniapp/pet.ts',
      
      // JavaScript bundles
      'public/miniapp/dist/main.js',
      'public/miniapp/dist/pet.js',
      'dist/public/miniapp/dist/main.js',
      'dist/public/miniapp/dist/pet.js',
      
      // Server files
      'dist/src/server.js',
      'src/server.ts'
    ];

    debug.files = {};
    for (const file of filesToCheck) {
      const fullPath = path.join(cwd, file);
      debug.files[file] = {
        exists: fs.existsSync(fullPath),
        path: fullPath,
        type: path.extname(file)
      };

      if (fs.existsSync(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          debug.files[file].isFile = stats.isFile();
          debug.files[file].size = stats.size;
          debug.files[file].modified = stats.mtime;
          
          // For HTML files, check the first 200 characters and import statements
          if (stats.isFile() && path.extname(file) === '.html') {
            const content = fs.readFileSync(fullPath, 'utf8');
            debug.files[file].preview = content.substring(0, 200) + '...';
            
            // Check for script imports
            const scriptMatches = content.match(/<script[^>]*src="([^"]+)"[^>]*>/g);
            if (scriptMatches) {
              debug.files[file].scriptImports = scriptMatches.map(match => {
                const srcMatch = match.match(/src="([^"]+)"/);
                return srcMatch ? srcMatch[1] : match;
              });
            }
          }
          
          // For JS files, check if they're proper ES modules
          if (stats.isFile() && path.extname(file) === '.js') {
            const content = fs.readFileSync(fullPath, 'utf8');
            debug.files[file].hasExports = content.includes('export');
            debug.files[file].hasImports = content.includes('import');
            debug.files[file].preview = content.substring(0, 100) + '...';
          }
        } catch (error) {
          debug.files[file].error = (error as Error).message;
        }
      }
    }

    // Generate summary
    const existingFiles = Object.keys(debug.files).filter(f => debug.files[f].exists);
    const missingFiles = Object.keys(debug.files).filter(f => !debug.files[f].exists);
    const legacyDirs = Object.keys(debug.directories).filter(d => debug.directories[d].isLegacy && debug.directories[d].exists);
    
    debug.summary = {
      totalFilesChecked: Object.keys(debug.files).length,
      existingFiles: existingFiles.length,
      missingFiles: missingFiles.length,
      legacyDirectoriesFound: legacyDirs.length,
      buildStatus: {
        hasSourceFiles: debug.files['public/miniapp/main.ts']?.exists && debug.files['public/miniapp/pet.ts']?.exists,
        hasBundles: debug.files['public/miniapp/dist/main.js']?.exists && debug.files['public/miniapp/dist/pet.js']?.exists,
        hasDistribution: debug.files['dist/public/miniapp/index.html']?.exists,
        hasServer: debug.files['dist/src/server.js']?.exists,
        needsCleanup: legacyDirs.length > 0
      },
      recommendations: []
    };

    // Add recommendations
    if (!debug.summary.buildStatus.hasSourceFiles) {
      debug.summary.recommendations.push('Missing TypeScript source files (main.ts, pet.ts)');
    }
    if (!debug.summary.buildStatus.hasBundles) {
      debug.summary.recommendations.push('Run frontend build to generate JavaScript bundles');
    }
    if (!debug.summary.buildStatus.hasDistribution) {
      debug.summary.recommendations.push('Run copy-public to create distribution files');
    }
    if (debug.summary.buildStatus.needsCleanup) {
      debug.summary.recommendations.push('Clean up legacy js/ directories');
    }

    res.json(debug);
    logger.info('Debug paths information accessed');
  } catch (error) {
    logger.error('Error generating debug paths info:', error);
    res.status(500).json({ error: 'Failed to generate debug information' });
  }
});

/**
 * GET /debug/fix
 * Attempts to fix the directory structure and clean up legacy files
 */
router.get('/fix', async (_req: Request, res: Response) => {
  try {
    const cwd = process.cwd();
    const result = {
      actions: [] as string[],
      success: true,
      timestamp: new Date().toISOString()
    };

    // Ensure correct directory structure exists
    const dirsToEnsure = [
      'public',
      'public/miniapp',
      'public/miniapp/dist',
      'public/miniapp/images',
      'dist/public',
      'dist/public/miniapp',
      'dist/public/miniapp/dist',
      'dist/public/miniapp/images'
    ];

    for (const dir of dirsToEnsure) {
      const fullPath = path.join(cwd, dir);
      if (!fs.existsSync(fullPath)) {
        try {
          fs.mkdirSync(fullPath, { recursive: true });
          result.actions.push(`✅ Created directory: ${dir}`);
        } catch (error) {
          result.success = false;
          result.actions.push(`❌ Failed to create directory ${dir}: ${(error as Error).message}`);
        }
      } else {
        result.actions.push(`📁 Directory already exists: ${dir}`);
      }
    }

    // Remove legacy directory structure
    const legacyDirs = [
      'public/miniapp/js',
      'dist/public/miniapp/js'
    ];

    for (const legacyDir of legacyDirs) {
      const fullPath = path.join(cwd, legacyDir);
      if (fs.existsSync(fullPath)) {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          result.actions.push(`🗑️ Removed legacy directory: ${legacyDir}`);
        } catch (error) {
          result.success = false;
          result.actions.push(`❌ Failed to remove legacy directory ${legacyDir}: ${(error as Error).message}`);
        }
      }
    }

    // Copy files from public/miniapp to dist/public/miniapp if source exists
    if (fs.existsSync(path.join(cwd, 'public/miniapp/index.html'))) {
      try {
        // Copy HTML files
        const htmlFiles = ['index.html', 'pet.html', 'styles.css', 'pet.css'];
        for (const file of htmlFiles) {
          const src = path.join(cwd, 'public/miniapp', file);
          const dest = path.join(cwd, 'dist/public/miniapp', file);
          
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            result.actions.push(`📄 Copied ${file} to dist`);
          }
        }

        // Copy JavaScript bundles if they exist
        const bundlesDir = path.join(cwd, 'public/miniapp/dist');
        const destBundlesDir = path.join(cwd, 'dist/public/miniapp/dist');
        
        if (fs.existsSync(bundlesDir)) {
          const bundles = fs.readdirSync(bundlesDir).filter(f => f.endsWith('.js') || f.endsWith('.js.map'));
          for (const bundle of bundles) {
            const src = path.join(bundlesDir, bundle);
            const dest = path.join(destBundlesDir, bundle);
            fs.copyFileSync(src, dest);
            result.actions.push(`🔧 Copied bundle ${bundle} to dist`);
          }
        }

        // Copy images if they exist
        const imagesDir = path.join(cwd, 'public/miniapp/images');
        const destImagesDir = path.join(cwd, 'dist/public/miniapp/images');
        
        if (fs.existsSync(imagesDir)) {
          const images = fs.readdirSync(imagesDir);
          for (const image of images) {
            const src = path.join(imagesDir, image);
            const dest = path.join(destImagesDir, image);
            fs.copyFileSync(src, dest);
          }
          result.actions.push(`🖼️ Copied ${images.length} images to dist`);
        }

        result.actions.push('✅ Files synchronized from public/miniapp to dist/public/miniapp');
      } catch (error) {
        result.success = false;
        result.actions.push(`❌ Failed to copy miniapp files: ${(error as Error).message}`);
      }
    } else {
      result.actions.push('⚠️ Source miniapp files not found - build may be needed');
    }

    // Fix HTML import paths
    const htmlFiles = [
      path.join(cwd, 'public/miniapp/index.html'),
      path.join(cwd, 'public/miniapp/pet.html'),
      path.join(cwd, 'dist/public/miniapp/index.html'),
      path.join(cwd, 'dist/public/miniapp/pet.html')
    ];

    for (const htmlFile of htmlFiles) {
      if (fs.existsSync(htmlFile)) {
        try {
          let content = fs.readFileSync(htmlFile, 'utf8');
          const originalContent = content;
          
          // Fix import paths
          content = content.replace(
            /src="dist\/js\/(app|pet)\/(.*?)\.js"/g, 
            'src="dist/$2.js"'
          );
          content = content.replace(
            /src="dist\/js\/(.*?)\.js"/g, 
            'src="dist/$1.js"'
          );
          
          if (content !== originalContent) {
            fs.writeFileSync(htmlFile, content);
            result.actions.push(`🔧 Fixed import paths in ${path.relative(cwd, htmlFile)}`);
          }
        } catch (error) {
          result.actions.push(`⚠️ Could not fix imports in ${path.relative(cwd, htmlFile)}: ${(error as Error).message}`);
        }
      }
    }

    // Final verification
    const criticalFiles = [
      'public/miniapp/index.html',
      'public/miniapp/pet.html'
    ];

    let verified = 0;
    for (const file of criticalFiles) {
      if (fs.existsSync(path.join(cwd, file))) {
        verified++;
      }
    }

    result.actions.push(`📊 Verification: ${verified}/${criticalFiles.length} critical files present`);

    if (result.success && verified === criticalFiles.length) {
      result.actions.push('🎉 Directory structure fix completed successfully!');
    } else if (result.success) {
      result.actions.push('⚠️ Fix completed with warnings - some files may need to be rebuilt');
    }

    res.json(result);
    logger.info('Directory fix attempt completed');
  } catch (error) {
    logger.error('Error fixing directory structure:', error);
    res.status(500).json({ error: 'Failed to fix directory structure', details: (error as Error).message });
  }
});

/**
 * GET /debug/build
 * Triggers a complete rebuild of the miniapp
 */
router.get('/build', async (_req: Request, res: Response) => {
  try {
    const { exec } = require('child_process');
    const result = {
      success: false,
      output: '',
      error: '',
      timestamp: new Date().toISOString()
    };

    // Run the cleanup and build script
    exec('node scripts/cleanup-and-build.js', { cwd: process.cwd() }, (error: any, stdout: string, stderr: string) => {
      result.output = stdout;
      result.error = stderr;
      result.success = !error;

      if (error) {
        logger.error('Build command failed:', error);
        res.status(500).json({ ...result, error: error.message });
      } else {
        logger.info('Build command completed successfully');
        res.json(result);
      }
    });

  } catch (error) {
    logger.error('Error triggering build:', error);
    res.status(500).json({ error: 'Failed to trigger build', details: (error as Error).message });
  }
});

export default router;