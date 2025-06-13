// esbuild.config.js
// Advanced esbuild configuration for the ThyKnow miniapp
// Updated to work with the new src/ directory structure for better organization
// This configuration provides more control than the basic esbuild CLI commands

const esbuild = require('esbuild');
const path = require('path');

// Define the build options that will be shared between all bundles
// This ensures consistency across your main app and pet app builds
const buildOptions = {
  // Output format as ES modules - this is modern and works well with browsers
  format: 'esm',
  
  // Target ES2020 for good browser support while maintaining modern features
  target: 'es2020',
  
  // Generate source maps for easier debugging during development
  sourcemap: true,
  
  // Bundle all dependencies into a single file for each entry point
  bundle: true,
  
  // Only minify in production to keep development builds readable
  minify: process.env.NODE_ENV === 'production',
  
  // Define environment variables that your code can access
  // This allows your TypeScript code to know whether it's running in production
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  // Keep certain dependencies external (loaded separately)
  // The Telegram WebApp script is loaded via CDN, so we don't bundle it
  external: [
    // Add any other external dependencies here if needed
  ],
  
  // File extensions that esbuild should resolve when importing
  // This allows you to import TypeScript files without specifying the .ts extension
  resolveExtensions: ['.ts', '.js'],
  
  // Configure how different file types should be handled during bundling
  loader: {
    '.png': 'file',    // Image files are treated as file references
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
    '.gif': 'file',
    '.css': 'text',    // CSS files are loaded as text for inline handling
  },
  
  // Set up path aliases for cleaner imports in your TypeScript code
  // This allows you to use @types/miniapp instead of relative paths like ../../types/miniapp
  alias: {
    '@': path.resolve(__dirname, 'public/miniapp/src'),
    '@types': path.resolve(__dirname, 'public/miniapp/src/types'),
    '@services': path.resolve(__dirname, 'public/miniapp/src/services'),
    '@utils': path.resolve(__dirname, 'public/miniapp/src/utils'),
    '@ui': path.resolve(__dirname, 'public/miniapp/src/ui'),
    '@config': path.resolve(__dirname, 'public/miniapp/src/config'),
    '@components': path.resolve(__dirname, 'public/miniapp/src/components'),
  },
  
  // Target the browser platform specifically
  platform: 'browser',
  
  // Enable tree shaking to remove unused code in production builds
  treeShaking: true,
};

/**
 * Main build function that creates both app bundles
 * This function handles the complete build process for your miniapp
 */
async function build() {
  try {
    console.log('🏗️  Building mini-app bundles with esbuild...');
    console.log('📁 Using new src/ directory structure');
    
    // Build the main app bundle from the organized source structure
    // This bundle contains all the code for your main miniapp functionality
    console.log('Building main app bundle...');
    await esbuild.build({
      ...buildOptions,
      // Updated entry point to use the new src/ directory structure
      entryPoints: ['public/miniapp/src/main.ts'],
      outfile: 'public/miniapp/dist/main.js',
      
      // Add any main-app-specific configuration here if needed
      // For example, you might want different optimization settings
    });
    console.log('✅ Built main.js bundle successfully');
    
    // Build the pet app bundle with the same configuration
    // This creates a separate bundle for your pet/dino functionality
    console.log('Building pet app bundle...');
    await esbuild.build({
      ...buildOptions,
      // Updated entry point for the pet app
      entryPoints: ['public/miniapp/src/pet.ts'],
      outfile: 'public/miniapp/dist/pet.js',
      
      // Pet app might have different requirements than main app
      // You can override specific options here if needed
    });
    console.log('✅ Built pet.js bundle successfully');
    
    console.log('🎉 All bundles built successfully!');
    
    // Provide useful information about the build output
    const fs = require('fs');
    
    // Check the size of the generated bundles to help with optimization
    try {
      const mainStats = fs.statSync('public/miniapp/dist/main.js');
      const petStats = fs.statSync('public/miniapp/dist/pet.js');
      
      console.log(`📊 Bundle sizes:`);
      console.log(`   main.js: ${(mainStats.size / 1024).toFixed(2)} KB`);
      console.log(`   pet.js: ${(petStats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log('📊 Could not determine bundle sizes');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    
    // Provide more detailed error information to help with debugging
    if (error.errors && error.errors.length > 0) {
      console.error('\n🔍 Build errors details:');
      error.errors.forEach((err, index) => {
        console.error(`${index + 1}. ${err.text}`);
        if (err.location) {
          console.error(`   📍 Location: ${err.location.file}:${err.location.line}:${err.location.column}`);
        }
      });
    }
    
    if (error.warnings && error.warnings.length > 0) {
      console.warn('\n⚠️  Build warnings:');
      error.warnings.forEach((warning, index) => {
        console.warn(`${index + 1}. ${warning.text}`);
      });
    }
    
    process.exit(1);
  }
}

/**
 * Development build with watch mode
 * This function sets up file watching for development, rebuilding when files change
 */
async function buildWatch() {
  try {
    console.log('👀 Starting development build with watch mode...');
    
    // Create contexts for both bundles to enable watching
    const mainContext = await esbuild.context({
      ...buildOptions,
      entryPoints: ['public/miniapp/src/main.ts'],
      outfile: 'public/miniapp/dist/main.js',
    });
    
    const petContext = await esbuild.context({
      ...buildOptions,
      entryPoints: ['public/miniapp/src/pet.ts'],
      outfile: 'public/miniapp/dist/pet.js',
    });
    
    // Initial build
    await mainContext.rebuild();
    await petContext.rebuild();
    console.log('✅ Initial build complete');
    
    // Start watching for changes
    await mainContext.watch();
    await petContext.watch();
    console.log('👀 Watching for changes... Press Ctrl+C to stop');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping watch mode...');
      await mainContext.dispose();
      await petContext.dispose();
      process.exit(0);
    });
    
    // Keep the process running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Watch mode failed:', error);
    process.exit(1);
  }
}

// Export the configuration and functions for use by other scripts
// This allows other parts of your build system to use the same configuration
module.exports = { 
  build, 
  buildWatch,
  buildOptions 
};

// Run the appropriate function based on command line arguments
// This allows the script to be used in different ways: build, watch, etc.
if (require.main === module) {
  // Check if watch mode was requested
  if (process.argv.includes('--watch')) {
    buildWatch();
  } else {
    build();
  }
}