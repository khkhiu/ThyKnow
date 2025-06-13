// src/routes/debugRoutes.ts
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import config from '../config';

const router = Router();

/**
 * GET /debug/paths
 * Provides debugging information about file paths
 */
router.get('/paths', (_req: Request, res: Response) => {
  try {
    const cwd = process.cwd();
    const debug: {
      environment: string;
      currentDirectory: string;
      directories: Record<string, any>;
      railwayInfo: {
        service: string;
        environment: string;
        publicDomain: string;
        privateDomain: string;
      };
      files: Record<string, any>;
    } = {
      environment: config.nodeEnv,
      currentDirectory: cwd,
      directories: {} as Record<string, any>,
      railwayInfo: {
        service: process.env.RAILWAY_SERVICE_NAME || 'N/A',
        environment: process.env.RAILWAY_ENVIRONMENT_NAME || 'N/A',
        publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || 'N/A',
        privateDomain: process.env.RAILWAY_PRIVATE_DOMAIN || 'N/A',
      },
      files: {} as Record<string, any>
    };

    // Check important directories
    const dirsToCheck = [
      'public',
      'public/miniapp',
      'dist',
      'dist/public',
      'dist/public/miniapp',
      'dist/src',
    ];

    for (const dir of dirsToCheck) {
      const fullPath = path.join(cwd, dir);
      debug.directories[dir] = {
        exists: fs.existsSync(fullPath),
        path: fullPath,
      };

      if (fs.existsSync(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          debug.directories[dir].isDirectory = stats.isDirectory();
          
          if (stats.isDirectory()) {
            const files = fs.readdirSync(fullPath);
            debug.directories[dir].files = files.map(file => {
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
      'public/miniapp/index.html',
      'public/miniapp/pet.html',
      'dist/public/miniapp/index.html',
      'dist/public/miniapp/pet.html',
      'public/miniapp/dist/main.js',
      'public/miniapp/dist/pet.js',
      'dist/public/miniapp/dist/main.js',
      'dist/public/miniapp/dist/pet.js'
    ];

    debug.files = {};
    for (const file of filesToCheck) {
      const fullPath = path.join(cwd, file);
      debug.files[file] = {
        exists: fs.existsSync(fullPath),
        path: fullPath,
      };

      if (fs.existsSync(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          debug.files[file].isFile = stats.isFile();
          debug.files[file].size = stats.size;
          
          // For HTML files, check the first 100 characters
          if (stats.isFile() && path.extname(file) === '.html') {
            const content = fs.readFileSync(fullPath, 'utf8');
            debug.files[file].preview = content.substring(0, 100) + '...';
          }
        } catch (error) {
          debug.files[file].error = (error as Error).message;
        }
      }
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
 * Attempts to fix the directory structure
 */
router.get('/fix', async (_req: Request, res: Response) => {
  try {
    const cwd = process.cwd();
    const result = {
      actions: [] as string[],
      success: true,
    };

    // Ensure directories exist
    const dirsToEnsure = [
      'public',
      'public/miniapp',
      'public/miniapp/js',
      'public/miniapp/js/app',
      'public/miniapp/js/pet',
      'public/miniapp/dist',
      'public/miniapp/images',
      'dist/public',
      'dist/public/miniapp',
    ];

    for (const dir of dirsToEnsure) {
      const fullPath = path.join(cwd, dir);
      if (!fs.existsSync(fullPath)) {
        try {
          fs.mkdirSync(fullPath, { recursive: true });
          result.actions.push(`Created directory: ${dir}`);
        } catch (error) {
          result.success = false;
          result.actions.push(`Failed to create directory ${dir}: ${(error as Error).message}`);
        }
      } else {
        result.actions.push(`Directory already exists: ${dir}`);
      }
    }

    // Create symbolic links if needed
    if (fs.existsSync(path.join(cwd, 'public/miniapp/index.html')) &&
        !fs.existsSync(path.join(cwd, 'dist/public/miniapp/index.html'))) {
      try {
        fs.cpSync(
          path.join(cwd, 'public/miniapp'), 
          path.join(cwd, 'dist/public/miniapp'),
          { recursive: true }
        );
        result.actions.push('Copied files from public/miniapp to dist/public/miniapp');
      } catch (error) {
        result.success = false;
        result.actions.push(`Failed to copy miniapp files: ${(error as Error).message}`);
      }
    }

    res.json(result);
    logger.info('Directory fix attempt completed');
  } catch (error) {
    logger.error('Error fixing directory structure:', error);
    res.status(500).json({ error: 'Failed to fix directory structure' });
  }
});

export default router;