// scripts/dev-build-frontend.js
/**
 * Development build script for the frontend
 * Builds the frontend bundles and watches for changes
 * Updated for the new src/ directory structure
 */

const esbuild = require('esbuild');
const path = require('path');

const buildOptions = {
  format: 'esm',
  target: 'es2020',
  sourcemap: true,
  bundle: true,
  minify: false, // Don't minify in development
  
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  
  resolveExtensions: ['.ts', '.js'],
  
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
    '.gif': 'file',
    '.css': 'text', // Load CSS as text for inline handling
  },

  // Enable external module resolution for better tree-shaking
  external: [],
  
  // Platform target
  platform: 'browser',
};

async function buildDev() {
  try {
    console.log('Building frontend in development mode...');
    console.log('Source structure: public/miniapp/src/');
    
    // Build main app bundle - updated entry point
    console.log('Building main app bundle...');
    const mainContext = await esbuild.context({
      ...buildOptions,
      entryPoints: ['public/miniapp/src/main.ts'], // Updated path
      outfile: 'public/miniapp/dist/main.js',
      alias: {
        // Add path aliases for cleaner imports if needed
        '@': path.resolve(__dirname, '../public/miniapp/src'),
        '@types': path.resolve(__dirname, '../public/miniapp/src/types'),
        '@services': path.resolve(__dirname, '../public/miniapp/src/services'),
        '@utils': path.resolve(__dirname, '../public/miniapp/src/utils'),
        '@ui': path.resolve(__dirname, '../public/miniapp/src/ui'),
        '@config': path.resolve(__dirname, '../public/miniapp/src/config'),
      }
    });
    
    // Build pet app bundle - updated entry point
    console.log('Building pet app bundle...');
    const petContext = await esbuild.context({
      ...buildOptions,
      entryPoints: ['public/miniapp/src/pet.ts'], // Updated path
      outfile: 'public/miniapp/dist/pet.js',
      alias: {
        // Same aliases for consistent imports
        '@': path.resolve(__dirname, '../public/miniapp/src'),
        '@types': path.resolve(__dirname, '../public/miniapp/src/types'),
        '@services': path.resolve(__dirname, '../public/miniapp/src/services'),
        '@utils': path.resolve(__dirname, '../public/miniapp/src/utils'),
        '@ui': path.resolve(__dirname, '../public/miniapp/src/ui'),
        '@config': path.resolve(__dirname, '../public/miniapp/src/config'),
      }
    });
    
    // Initial build
    console.log('Performing initial build...');
    await mainContext.rebuild();
    console.log('✓ Main app built successfully');
    
    await petContext.rebuild();
    console.log('✓ Pet app built successfully');
    
    console.log('✓ Initial build complete');
    
    // Watch for changes if --watch flag is passed
    if (process.argv.includes('--watch')) {
      console.log('👀 Watching for changes in public/miniapp/src/...');
      await mainContext.watch();
      await petContext.watch();
      
      // Keep the process alive
      process.on('SIGINT', async () => {
        console.log('\nStopping watch mode...');
        await mainContext.dispose();
        await petContext.dispose();
        process.exit(0);
      });
      
      // Keep process running
      await new Promise(() => {});
    } else {
      // Dispose contexts if not watching
      await mainContext.dispose();
      await petContext.dispose();
      console.log('✓ Build complete');
    }
    
  } catch (error) {
    console.error('Build failed:', error);
    
    // More detailed error information
    if (error.errors && error.errors.length > 0) {
      console.error('Build errors:');
      error.errors.forEach((err, index) => {
        console.error(`${index + 1}. ${err.text}`);
        if (err.location) {
          console.error(`   Location: ${err.location.file}:${err.location.line}:${err.location.column}`);
        }
      });
    }
    
    process.exit(1);
  }
}

// Run the build
buildDev();