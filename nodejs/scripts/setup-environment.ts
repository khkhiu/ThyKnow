// scripts/setup-environment.ts
// Setup script for environment variables and configuration

import fs from 'fs';
import path from 'path';
import { logger } from '../src/utils/logger';

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  BASE_URL: string;
  WEBHOOK_SECRET?: string;
  ANALYTICS_ENABLED?: string;
  LOG_LEVEL?: string;
}

const REQUIRED_VARS = [
  'NODE_ENV',
  'DATABASE_URL', 
  'TELEGRAM_BOT_TOKEN',
  'BASE_URL'
];

const DEFAULT_VALUES: Partial<EnvironmentConfig> = {
  NODE_ENV: 'development',
  PORT: '3000',
  LOG_LEVEL: 'info',
  ANALYTICS_ENABLED: 'true'
};

/**
 * Check if all required environment variables are set
 */
function checkRequiredEnvVars(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const envVar of REQUIRED_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Create .env file template
 */
function createEnvTemplate(): void {
  const envTemplate = `# ThyKnow Environment Configuration
# ===================================

# Application Settings
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/thyknow

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBHOOK_SECRET=your_webhook_secret_here

# Features & Analytics
ANALYTICS_ENABLED=true
LOG_LEVEL=debug

# Frontend-First Bot Configuration
# These control how aggressively the bot promotes the frontend
BOT_FRONTEND_PROMOTION_LEVEL=app_first
BOT_FORCE_FRONTEND_AFTER_DAYS=7
BOT_SHOW_PREVIEW_FOR_NEW_USERS=true

# Deep Link Configuration
DEEP_LINK_TRACKING=true
DEEP_LINK_ANALYTICS=true

# Development Settings (only for development)
ENABLE_BOT_POLLING=true
ENABLE_WEBHOOK=false
CORS_ORIGIN=http://localhost:3000

# Production Settings (only for production)
# ENABLE_BOT_POLLING=false
# ENABLE_WEBHOOK=true
# CORS_ORIGIN=https://your-domain.com
`;

  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env template file');
  } else {
    console.log('⚠️  .env file already exists, skipping template creation');
  }
}

/**
 * Validate environment configuration
 */
function validateEnvironment(): boolean {
  console.log('🔍 Validating environment configuration...\n');
  
  const { valid, missing } = checkRequiredEnvVars();
  
  if (!valid) {
    console.log('❌ Missing required environment variables:');
    missing.forEach(envVar => {
      console.log(`   - ${envVar}`);
    });
    console.log('\n💡 Please set these variables in your .env file or environment');
    return false;
  }
  
  // Validate specific configurations
  const issues: string[] = [];
  
  // Check database URL format
  const dbUrl = process.env.DATABASE_URL!;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    issues.push('DATABASE_URL should start with postgresql:// or postgres://');
  }
  
  // Check bot token format
  const botToken = process.env.TELEGRAM_BOT_TOKEN!;
  if (!botToken.includes(':') || botToken.length < 20) {
    issues.push('TELEGRAM_BOT_TOKEN appears to be invalid');
  }
  
  // Check base URL format
  const baseUrl = process.env.BASE_URL!;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    issues.push('BASE_URL should start with http:// or https://');
  }
  
  if (issues.length > 0) {
    console.log('⚠️  Configuration issues found:');
    issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log('\n💡 Please fix these issues before proceeding');
    return false;
  }
  
  console.log('✅ Environment configuration is valid!\n');
  
  // Show current configuration
  console.log('📋 Current Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Port: ${process.env.PORT}`);
  console.log(`   Base URL: ${process.env.BASE_URL}`);
  console.log(`   Database: ${dbUrl.split('@')[1] || 'configured'}`);
  console.log(`   Bot Token: ${botToken.substring(0, 10)}...`);
  console.log(`   Analytics: ${process.env.ANALYTICS_ENABLED}`);
  console.log(`   Log Level: ${process.env.LOG_LEVEL}`);
  
  return true;
}

/**
 * Setup development environment
 */
function setupDevelopment(): void {
  console.log('🛠️  Setting up development environment...\n');
  
  // Check if required development tools are installed
  const requiredPackages = [
    'ts-node',
    'nodemon',
    '@types/node'
  ];
  
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );
  
  const missingDevDeps = requiredPackages.filter(pkg => 
    !packageJson.devDependencies?.[pkg] && !packageJson.dependencies?.[pkg]
  );
  
  if (missingDevDeps.length > 0) {
    console.log('⚠️  Missing development dependencies:');
    missingDevDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\n💡 Run: npm install --save-dev ' + missingDevDeps.join(' '));
  } else {
    console.log('✅ All development dependencies are installed');
  }
  
  // Check if frontend is set up
  const frontendPath = path.join(process.cwd(), 'frontend');
  if (!fs.existsSync(frontendPath)) {
    console.log('⚠️  Frontend directory not found');
    console.log('💡 Make sure to set up the React frontend in the ./frontend directory');
  } else {
    console.log('✅ Frontend directory exists');
  }
}

/**
 * Setup production environment
 */
function setupProduction(): void {
  console.log('🚀 Setting up production environment...\n');
  
  // Check production-specific requirements
  const productionChecks = [
    {
      name: 'HTTPS Base URL',
      check: () => process.env.BASE_URL?.startsWith('https://'),
      message: 'Production should use HTTPS'
    },
    {
      name: 'Webhook Secret',
      check: () => !!process.env.WEBHOOK_SECRET,
      message: 'Webhook secret should be set for production'
    },
    {
      name: 'Analytics Enabled',
      check: () => process.env.ANALYTICS_ENABLED === 'true',
      message: 'Analytics should be enabled in production'
    },
    {
      name: 'Production Node ENV',
      check: () => process.env.NODE_ENV === 'production',
      message: 'NODE_ENV should be set to production'
    }
  ];
  
  let allChecksPassed = true;
  
  productionChecks.forEach(({ name, check, message }) => {
    if (check()) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`⚠️  ${name}: ${message}`);
      allChecksPassed = false;
    }
  });
  
  if (allChecksPassed) {
    console.log('\n🎉 Production environment is properly configured!');
  } else {
    console.log('\n⚠️  Some production checks failed. Please review the configuration.');
  }
}

/**
 * Main setup function
 */
function setupEnvironment(): void {
  console.log('🌟 ThyKnow Environment Setup');
  console.log('============================\n');
  
  // Load environment variables
  require('dotenv').config();
  
  // Create .env template if needed
  createEnvTemplate();
  
  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // Environment-specific setup
  const nodeEnv = process.env.NODE_ENV;
  
  if (nodeEnv === 'development') {
    setupDevelopment();
  } else if (nodeEnv === 'production') {
    setupProduction();
  }
  
  console.log('\n✨ Environment setup complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run migrate (to set up database)');
  console.log('   2. Run: npm run setup:webhook (to configure Telegram webhook)');
  console.log('   3. Run: npm run dev (to start development server)');
  console.log('   4. Test with: npm run test:bot:frontend-first');
}

// Run if called directly
if (require.main === module) {
  setupEnvironment();
}

export { 
  setupEnvironment, 
  validateEnvironment, 
  checkRequiredEnvVars,
  createEnvTemplate 
};