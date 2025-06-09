// scripts/dev-build-frontend.js
/**
 * Development build script for the frontend
 * Builds the frontend bundles and watches for changes
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
  },
};

async function buildDev() {
  try {
    console.log('Building frontend in development mode...');
    
    // Build main app bundle
    const mainContext = await esbuild.context({
      ...buildOptions,
      entryPoints: ['public/miniapp/main.ts'],
      outfile: 'public/miniapp/dist/main.js',
    });
    
    // Build pet app bundle
    const petContext = await esbuild.context({
      ...buildOptions,
      entryPoints: ['public/miniapp/pet.ts'],
      outfile: 'public/miniapp/dist/pet.js',
    });
    
    // Initial build
    await mainContext.rebuild();
    await petContext.rebuild();
    console.log('✓ Initial build complete');
    
    // Watch for changes if --watch flag is passed
    if (process.argv.includes('--watch')) {
      console.log('👀 Watching for changes...');
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
    process.exit(1);
  }
}

// Run the build
buildDev();