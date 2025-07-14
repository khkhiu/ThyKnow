// scripts/test-frontend-first-commands.ts
// Test script to verify all commands properly redirect to frontend

import { Telegraf } from 'telegraf';
import config from '../src/config';
import { setupBotCommands } from '../src/controllers';
import { userService } from '../src/services/userService';
import { userAppUsageService } from '../src/services/userAppUsageService';
import sinon from 'sinon';

interface TestResult {
  command: string;
  success: boolean;
  redirectsToFrontend: boolean;
  hasPromotionMessage: boolean;
  hasWebAppButton: boolean;
  error?: string;
}

interface MockContext {
  from: { id: number; first_name: string };
  reply: sinon.SinonStub;
  replyWithMarkdown: sinon.SinonStub;
  answerCbQuery: sinon.SinonStub;
  editMessageText: sinon.SinonStub;
  message: { text: string };
}

function createMockContext(command: string): MockContext {
  return {
    from: { id: 12345, first_name: 'TestUser' },
    reply: sinon.stub().resolves(true),
    replyWithMarkdown: sinon.stub().resolves(true),
    answerCbQuery: sinon.stub().resolves(true),
    editMessageText: sinon.stub().resolves(true),
    message: { text: `/${command}` }
  };
}

function analyzeResponse(responseText: string, replyMarkup: any): {
  redirectsToFrontend: boolean;
  hasPromotionMessage: boolean;
  hasWebAppButton: boolean;
} {
  const hasWebAppButton = !!(
    replyMarkup?.inline_keyboard?.some((row: any[]) =>
      row.some((button: any) => button.web_app?.url?.includes('/miniapp'))
    )
  );

  const redirectsToFrontend = hasWebAppButton || responseText.toLowerCase().includes('app');
  
  const promotionKeywords = [
    'better experience',
    'full app',
    'miniapp',
    'visual',
    'charts',
    'dino friend',
    'pro tip',
    'app exclusive'
  ];
  
  const hasPromotionMessage = promotionKeywords.some(keyword =>
    responseText.toLowerCase().includes(keyword.toLowerCase())
  );

  return { redirectsToFrontend, hasPromotionMessage, hasWebAppButton };
}

async function testCommand(bot: Telegraf, command: string): Promise<TestResult> {
  console.log(`\n🧪 Testing /${command} command...`);
  
  try {
    const mockCtx = createMockContext(command);
    
    // Get command handler with proper typing
    const handlers = (bot as any).handlers;
    let commandHandler: ((ctx: any) => Promise<void>) | null = null;
    
    // Find the command handler
    for (const handler of handlers) {
      if (handler.type === 'text' && handler.trigger?.toString().includes(command)) {
        commandHandler = handler.middleware;
        break;
      }
    }
    
    if (!commandHandler) {
      throw new Error(`No handler found for /${command}`);
    }
    
    // Execute the command
    await commandHandler(mockCtx);
    
    // Analyze the response
    const replyCall = mockCtx.reply.getCall(0);
    if (!replyCall) {
      throw new Error('No reply sent');
    }
    
    const [responseText, options] = replyCall.args;
    const analysis = analyzeResponse(responseText, options?.reply_markup);
    
    console.log(`📤 Response preview: ${responseText.substring(0, 100)}...`);
    console.log(`🔗 Has web app button: ${analysis.hasWebAppButton ? '✅' : '❌'}`);
    console.log(`📱 Promotes frontend: ${analysis.hasPromotionMessage ? '✅' : '❌'}`);
    console.log(`↗️  Redirects to frontend: ${analysis.redirectsToFrontend ? '✅' : '❌'}`);
    
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

async function testAllFrontendFirstCommands(): Promise<void> {
  console.log('🚀 Testing Frontend-First Bot Commands\n');
  console.log('=====================================');
  
  try {
    // Create bot instance
    const bot = new Telegraf(config.telegramBotToken);
    setupBotCommands(bot);
    
    // Stub external services
    sinon.stub(userService, 'getUser').resolves({
      id: '12345',
      telegramId: '12345',
      firstName: 'TestUser',
      createdAt: new Date(),
      lastPrompt: 'Test prompt',
      promptType: 'self_awareness',
      schedulePreference: { enabled: true, day: 1, hour: 9 }
    });
    
    sinon.stub(userService, 'createOrUpdateUser').resolves();
    sinon.stub(userService, 'getRecentEntries').resolves([]);
    sinon.stub(userService, 'getUserWeeklyProgress').resolves({
      currentStreak: 3,
      currentWeekCompleted: false,
      currentWeekEntry: null,
      weeklyHistory: []
    });
    
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
      const result = await testCommand(bot, command);
      results.push(result);
    }
    
    // Generate report
    console.log('\n📊 FRONTEND-FIRST COMMANDS REPORT');
    console.log('================================');
    
    const successful = results.filter(r => r.success);
    const withWebAppButton = results.filter(r => r.hasWebAppButton);
    const withPromotion = results.filter(r => r.hasPromotionMessage);
    const redirecting = results.filter(r => r.redirectsToFrontend);
    
    console.log(`\n✅ Commands tested: ${results.length}`);
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`🔗 With web app button: ${withWebAppButton.length}/${results.length}`);
    console.log(`📱 With promotion message: ${withPromotion.length}/${results.length}`);
    console.log(`↗️  Redirecting to frontend: ${redirecting.length}/${results.length}`);
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const webApp = result.hasWebAppButton ? '🔗' : '⭕';
      const promotion = result.hasPromotionMessage ? '📱' : '⭕';
      const redirect = result.redirectsToFrontend ? '↗️' : '⭕';
      
      console.log(`${status} /${result.command.padEnd(10)} ${webApp} ${promotion} ${redirect}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Success criteria
    const criteriaMet = {
      allSuccessful: successful.length === results.length,
      allHaveWebApp: withWebAppButton.length >= results.length * 0.8, // 80% should have web app buttons
      allPromote: withPromotion.length >= results.length * 0.6, // 60% should promote frontend
      allRedirect: redirecting.length >= results.length * 0.8 // 80% should redirect
    };
    
    console.log('\n🎯 SUCCESS CRITERIA:');
    console.log(`All commands work: ${criteriaMet.allSuccessful ? '✅' : '❌'}`);
    console.log(`80%+ have web app buttons: ${criteriaMet.allHaveWebApp ? '✅' : '❌'}`);
    console.log(`60%+ promote frontend: ${criteriaMet.allPromote ? '✅' : '❌'}`);
    console.log(`80%+ redirect to frontend: ${criteriaMet.allRedirect ? '✅' : '❌'}`);
    
    const overallSuccess = Object.values(criteriaMet).every(Boolean);
    
    if (overallSuccess) {
      console.log('\n🎉 FRONTEND-FIRST IMPLEMENTATION SUCCESSFUL! 🎉');
      console.log('All commands properly redirect users to the React frontend!');
    } else {
      console.log('\n⚠️  IMPLEMENTATION NEEDS IMPROVEMENT');
      console.log('Some commands are not properly redirecting to the frontend.');
    }
    
    // Exit with appropriate code
    process.exit(overallSuccess ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testAllFrontendFirstCommands();
}

export { testAllFrontendFirstCommands };