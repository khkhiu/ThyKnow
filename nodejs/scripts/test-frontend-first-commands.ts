// scripts/test-frontend-first-commands.ts
// Fixed version with proper typing

import { Telegraf } from 'telegraf';
import sinon from 'sinon';
import config from '../src/config';
import { setupBotCommands } from '../src/controllers/index';
import { userService } from '../src/services/userService';
import { userAppUsageService } from '../src/services/userAppUsageService';
import { ILastPrompt, IUser } from '../src/models/User';
import { PromptType } from '../src/types';

interface TestResult {
  command: string;
  success: boolean;
  redirectsToFrontend: boolean;
  hasPromotionMessage: boolean;
  hasWebAppButton: boolean;
  error?: string;
}

interface MessageAnalysis {
  redirectsToFrontend: boolean;
  hasPromotionMessage: boolean;
  hasWebAppButton: boolean;
}

/**
 * Test a single command to ensure it properly redirects to frontend
 */
async function testFrontendFirstCommand(bot: Telegraf, command: string): Promise<TestResult> {
  console.log(`\n🔍 Testing /${command} command...`);
  
  try {
    let capturedMessage = '';
    let capturedKeyboard: any = null;
    
    // Mock context
    const mockContext = {
      from: { id: 12345, username: 'testuser' },
      chat: { id: 12345 },
      reply: sinon.stub().callsFake((message, options) => {
        capturedMessage = message;
        capturedKeyboard = options?.reply_markup;
        return Promise.resolve();
      }),
      replyWithMarkdown: sinon.stub().callsFake((message, options) => {
        capturedMessage = message;
        capturedKeyboard = options?.reply_markup;
        return Promise.resolve();
      }),
      message: { text: `/${command}` },
      answerCbQuery: sinon.stub().resolves()
    };

    // Get command handler
    const handler = getCommandHandler(bot, command);
    
    // Execute command
    await handler(mockContext);
    
    // Analyze response
    const analysis = analyzeMessage(capturedMessage, capturedKeyboard);
    
    console.log(`   Response: "${capturedMessage.substring(0, 100)}${capturedMessage.length > 100 ? '...' : ''}"`);
    console.log(`🌐 Redirects to frontend: ${analysis.redirectsToFrontend ? '✅' : '❌'}`);
    console.log(`📱 Promotes frontend: ${analysis.hasPromotionMessage ? '✅' : '❌'}`);
    console.log(`↗️  Has web app button: ${analysis.hasWebAppButton ? '✅' : '❌'}`);
    
    return {
      command,
      success: true,
      ...analysis
    };
    
  } catch (error: any) {
    console.log(`❌ Error testing /${command}:`, error.message);
    return {
      command,
      success: false,
      redirectsToFrontend: false,
      hasPromotionMessage: false,
      hasWebAppButton: false,
      error: error.message
    };
  }
}

/**
 * Analyze message content and keyboard for frontend promotion
 */
function analyzeMessage(message: string, keyboard: any): MessageAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Check for frontend redirection phrases
  const redirectionPhrases = [
    'open the app',
    'visit the web app',
    'check out the miniapp',
    'use the frontend',
    'click the button below',
    'open thyknow',
    'launch the app'
  ];
  
  const promotionPhrases = [
    'better experience',
    'full features',
    'complete interface',
    'enhanced experience',
    'visual interface',
    'interactive features'
  ];
  
  const redirectsToFrontend = redirectionPhrases.some(phrase => lowerMessage.includes(phrase));
  const hasPromotionMessage = promotionPhrases.some(phrase => lowerMessage.includes(phrase));
  
  // Check for web app button in keyboard
  const hasWebAppButton = keyboard && keyboard.inline_keyboard && 
    keyboard.inline_keyboard.some((row: any[]) => 
      row.some((button: any) => button.web_app || button.url)
    );
  
  return {
    redirectsToFrontend,
    hasPromotionMessage,
    hasWebAppButton
  };
}

/**
 * Main test function
 */
async function testAllFrontendFirstCommands(): Promise<void> {
  console.log('🚀 Testing Frontend-First Bot Commands\n');
  console.log('=====================================');
  
  try {
    // Create bot instance
    const bot = new Telegraf(config.telegramBotToken);
    setupBotCommands(bot);
    
    // Create proper mock objects with correct types
    const mockUser: IUser = {
      id: '12345',
      createdAt: new Date(),
      promptCount: 0,
      schedulePreference: { enabled: true, day: 1, hour: 9 },
      currentStreak: 0,
      longestStreak: 0,
      totalPoints: 0,
      lastEntryWeek: null
    };

    // Create proper ILastPrompt object (not string)
    const mockLastPrompt: ILastPrompt = {
      userId: '12345',
      text: 'Test prompt',
      type: 'self_awareness' as PromptType,
      timestamp: new Date()
    };

    // Stub external services with proper return types
    sinon.stub(userService, 'getUser').resolves({
      ...mockUser,
      lastPrompt: mockLastPrompt
    });
    
    sinon.stub(userService, 'createOrUpdateUser').resolves(mockUser);
    sinon.stub(userService, 'getRecentEntries').resolves([]);
    
    // Fix: Remove the non-existent getUserWeeklyProgress method
    // This method doesn't exist in UserService, so we don't need to stub it
    
    sinon.stub(userAppUsageService, 'getUserAppUsage').resolves({
      hasUsedMiniapp: true,
      lastMiniappUse: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      miniappUsageCount: 5,
      isNewUser: false,
      registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    });
    
    sinon.stub(userAppUsageService, 'recordBotCommandUsage').resolves();
    
    // Commands that should redirect to frontend
    const frontendCommands = [
      'start',
      'prompt',
      'history',
      'choose',
      'streak',
      'miniapp',
      'help'
    ];
    
    const results: TestResult[] = [];
    
    // Test each command
    for (const command of frontendCommands) {
      const result = await testFrontendFirstCommand(bot, command);
      results.push(result);
    }
    
    // Generate report
    console.log('\n📊 FRONTEND-FIRST COMMANDS REPORT');
    console.log('=================================');
    
    const successful = results.filter(r => r.success);
    const redirecting = results.filter(r => r.redirectsToFrontend);
    const promoting = results.filter(r => r.hasPromotionMessage);
    const withButtons = results.filter(r => r.hasWebAppButton);
    
    console.log(`✅ Commands executed successfully: ${successful.length}/${results.length}`);
    console.log(`🌐 Commands redirecting to frontend: ${redirecting.length}/${results.length}`);
    console.log(`📱 Commands promoting frontend: ${promoting.length}/${results.length}`);
    console.log(`🔘 Commands with web app buttons: ${withButtons.length}/${results.length}`);
    
    // Show detailed results
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const frontend = result.redirectsToFrontend ? '🌐' : '  ';
      const promotion = result.hasPromotionMessage ? '📱' : '  ';
      const button = result.hasWebAppButton ? '🔘' : '  ';
      
      console.log(`${status} ${frontend} ${promotion} ${button} /${result.command}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });
    
    // Summary
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    const overallSuccess = successful.length === results.length;
    const frontendReadiness = redirecting.length / results.length;
    
    if (overallSuccess) {
      console.log('✅ All commands executed without errors');
    } else {
      console.log(`❌ ${results.length - successful.length} commands failed`);
    }
    
    if (frontendReadiness >= 0.8) {
      console.log('🌐 Frontend-first strategy is well implemented');
    } else {
      console.log('⚠️  Some commands need better frontend redirection');
    }
    
    console.log(`📊 Frontend readiness: ${Math.round(frontendReadiness * 100)}%`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  } finally {
    // Clean up stubs
    sinon.restore();
  }
}

/**
 * Helper function to extract command handler from bot
 */
function getCommandHandler(bot: Telegraf, command: string): any {
  const handlers = (bot as any).handlers;
  
  // Find the handler for this specific command
  for (const handler of handlers) {
    if (handler.type === 'text' && handler.trigger) {
      // Check if trigger matches our command
      if (typeof handler.trigger === 'string' && handler.trigger === command) {
        return handler.middleware;
      }
      if (handler.trigger instanceof RegExp && handler.trigger.test(`/${command}`)) {
        return handler.middleware;
      }
    }
  }
  
  // Fallback: return a no-op function
  return () => Promise.resolve();
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAllFrontendFirstCommands()
    .then(() => {
      console.log('\n🎉 Frontend-first commands test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testAllFrontendFirstCommands };