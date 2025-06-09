// esbuild.config.js
// Optional: Advanced esbuild configuration for more complex scenarios
// This is not required for the basic setup but provides more control

const esbuild = require('esbuild');
const path = require('path');

const buildOptions = {
  // Common options for both bundles
  format: 'esm',
  target: 'es2020',
  sourcemap: true,
  bundle: true,
  minify: process.env.NODE_ENV === 'production',
  
  // Define globals for the browser environment
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  // Handle external dependencies that shouldn't be bundled
  external: [
    // Keep Telegram WebApp script external since it's loaded via CDN
  ],
  
  // Resolve paths correctly
  resolveExtensions: ['.ts', '.js'],
  
  // Handle different file types
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
    '.gif': 'file',
  },
};

async function build() {
  try {
    console.log('Building mini-app bundles with esbuild...');
    
    // Build main app bundle
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['public/miniapp/main.ts'],
      outfile: 'public/miniapp/dist/main.js',
    });
    console.log('✓ Built main.js bundle');
    
    // Build pet app bundle
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['public/miniapp/pet.ts'],
      outfile: 'public/miniapp/dist/pet.js',
    });
    console.log('✓ Built pet.js bundle');
    
    console.log('All bundles built successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { build, buildOptions };

// Run build if this file is executed directly
if (require.main === module) {
  build();
}