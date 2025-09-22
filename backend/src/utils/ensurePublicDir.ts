// src/utils/ensurePublicDir.ts
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Ensures public directory exists in the correct location for Railway deployment
 * This function checks if the public directory exists, and if not, creates symbolic links
 * to ensure the files can be found at runtime.
 */
export function ensurePublicDirectory(): void {
  try {
    // Define possible locations for the public directory
    const cwd = process.cwd();
    const publicPaths = [
      // The expected path in production
      path.join(cwd, 'public'),
      // Other possible paths
      path.join(cwd, 'dist', 'public'),
      path.join(cwd, '..', 'public'),
      path.join(cwd, 'src', 'public')
    ];

    // Location for the mini-app directories we need
    const miniAppPaths = [
      'public/miniapp',
      'public/miniapp/js',
      'public/miniapp/js/app',
      'public/miniapp/js/pet',
      'public/miniapp/dist',
      'public/miniapp/images'
    ];

    // Check if public directory exists
    const mainPublicPath = publicPaths[0]; // cwd/public
    let publicExists = fs.existsSync(mainPublicPath);
    
    // If the main public directory doesn't exist, try to find it in other locations
    if (!publicExists) {
      for (let i = 1; i < publicPaths.length; i++) {
        if (fs.existsSync(publicPaths[i])) {
          // Found an existing public directory - create a symbolic link
          try {
            // Create symbolic link
            fs.symlinkSync(publicPaths[i], mainPublicPath, 'dir');
            logger.info(`Created symbolic link from ${publicPaths[i]} to ${mainPublicPath}`);
            publicExists = true;
            break;
          } catch (err) {
            logger.error(`Failed to create symbolic link from ${publicPaths[i]} to ${mainPublicPath}:`, err);
          }
        }
      }
    }

    // If we still don't have a public directory, create one
    if (!publicExists) {
      logger.info(`Public directory not found. Creating at ${mainPublicPath}`);
      fs.mkdirSync(mainPublicPath, { recursive: true });
    }

    // Ensure mini-app directories exist
    for (const dirPath of miniAppPaths) {
      const fullPath = path.join(cwd, dirPath);
      if (!fs.existsSync(fullPath)) {
        logger.info(`Creating directory: ${fullPath}`);
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }

    // List all directories for debugging
    logger.info('Public directory structure:');
    function listDir(dirPath: string, indent = 0) {
      if (fs.existsSync(dirPath)) {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          logger.info(`${' '.repeat(indent * 2)}${item} ${stats.isDirectory() ? '(dir)' : '(file)'}`);
          if (stats.isDirectory()) {
            listDir(itemPath, indent + 1);
          }
        }
      }
    }
    listDir(mainPublicPath);

  } catch (error) {
    logger.error('Error ensuring public directory exists:', error);
  }
}