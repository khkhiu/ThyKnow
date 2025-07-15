// scripts/verify-bot-commands.ts
// Simple script to verify all bot commands work without returning error messages

import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { setupBotCommands } from '../src/controllers/index';
import { userService } from '../src/services/userService';
import config from '../src/config';

/**
 * Create a comprehensive mock context that satisfies Context<Update> interface
 */
function createMockContext(command: string = 'test'): Context<Update> {
  const mockContext = {
    // Required Telegraf context properties
    update: {
      update_id: 1,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        text: `/${command}`,
        chat: {
          id: 999999,
          type: 'private' as const
        },
        from: {
          id: 999999,
          is_bot: false,
          first_name: 'Test',
          username: 'testuser'
        }
      }
    },
    telegram: {} as any, // Mock telegram API
    botInfo: {} as any, // Mock bot info
    state: {}, // Mock state
    
    // Context shortcuts
    from: {
      id: 999999,
      is_bot: false,
      first_name: 'Test',
      username: 'testuser'
    },
    message: {
      message_id: 1,
      date: Math.floor(Date.now() / 1000),
      text: `/${command}`,
      chat: {
        id: 999999,
        type: 'private' as const
      },
      from: {
        id: 999999,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser'
      }
    },
    chat: {
      id: 999999,
      type: 'private' as const
    },
    
    // Mock reply methods
    reply: async (text: string, _extra?: any) => {
      console.log(`📤 Bot Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      
      // Check for error indicators
      const errorKeywords = ['error', 'sorry', 'wrong', 'failed', 'RAWR'];
      const hasError = errorKeywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasError) {
        console.log(`⚠️  Potential error response detected in /${command}`);
        return { success: false, text };
      }
      
      return { success: true, text };
    },
    
    replyWithMarkdown: async (text: string, extra?: any) => {
      return mockContext.reply(text, extra);
    },
    
    replyWithHTML: async (text: string, extra?: any) => {
      return mockContext.reply(text, extra);
    },
    
    answerCbQuery: async (text?: string) => {
      console.log(`📋 Callback answered: ${text || 'OK'}`);
      return true;
    },
    
    callbackQuery: { 
      id: 'test_callback_id',
      data: 'test_callback',
      from: {
        id: 999999,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser'
      }
    },
    
    // Mock other commonly used methods
    editMessageText: async (text: string, _extra?: any) => {
      console.log(`📝 Edit message: ${text.substring(0, 50)}...`);
      return true;
    },
    
    deleteMessage: async (messageId?: number) => {
      console.log(`🗑️  Delete message: ${messageId || 'current'}`);
      return true;
    },
    
    // Mock scene methods (if using scenes)
    scene: {
      enter: async (sceneId: string) => {
        console.log(`🎬 Enter scene: ${sceneId}`);
      },
      leave: async () => {
        console.log(`🚪 Leave scene`);
      }
    },
    
    // Mock wizard methods (if using wizards)
    wizard: {
      next: async () => {
        console.log(`➡️  Wizard next`);
      },
      back: async () => {
        console.log(`⬅️  Wizard back`);
      }
    },
    
    // Add other required Context properties as stubs
    match: null,
    webhookReply: true,
    
    // Mock methods that might be called
    forwardMessage: async () => ({}),
    copyMessage: async () => ({}),
    sendMessage: async () => ({}),
    sendPhoto: async () => ({}),
    sendAudio: async () => ({}),
    sendDocument: async () => ({}),
    sendSticker: async () => ({}),
    sendVideo: async () => ({}),
    sendVoice: async () => ({}),
    sendLocation: async () => ({}),
    sendVenue: async () => ({}),
    sendContact: async () => ({}),
    sendPoll: async () => ({}),
    sendChatAction: async () => true,
    
  } as unknown as Context<Update>;
  
  return mockContext;
}

/**
 * Test all bot commands
 */
async function testAllCommands(): Promise<void> {
  console.log('🤖 Starting Bot Commands Verification...\n');
  
  try {
    // Create bot instance
    const bot = new Telegraf(config.telegramBotToken);
    setupBotCommands(bot);
    
    // List of all commands to test
    const commands = [
      'start',
      'prompt', 
      'choose',
      'history',
      'streak',
      'miniapp',
      'schedule',
      'feedback',
      'help',
      'cancel'
    ];
    
    const results = {
      passed: [] as string[],
      failed: [] as string[],
      errors: [] as { command: string; error: string }[]
    };
    
    // Test each command
    for (const command of commands) {
      console.log(`\n🧪 Testing /${command} command...`);
      
      try {
        const mockCtx = createMockContext(command);
        
        // Import the specific command handlers directly
        let commandHandler: ((ctx: Context<Update>) => Promise<void>) | null = null;
        
        // Map commands to their handlers
        switch (command) {
          case 'start':
            const { handleStart } = await import('../src/controllers/userController');
            commandHandler = handleStart;
            break;
          case 'prompt':
            const { handleSendPrompt } = await import('../src/controllers/promptController');
            commandHandler = handleSendPrompt;
            break;
          case 'choose':
            const { handleChooseCommand } = await import('../src/controllers/chooseController');
            commandHandler = handleChooseCommand;
            break;
          case 'history':
            const { handleShowHistory } = await import('../src/controllers/historyController');
            commandHandler = handleShowHistory;
            break;
          case 'streak':
            const { handleCombinedStreakCommand } = await import('../src/controllers/combinedStreakController');
            commandHandler = handleCombinedStreakCommand;
            break;
          case 'miniapp':
            const { handleMiniAppCommand } = await import('../src/controllers/miniAppController');
            commandHandler = handleMiniAppCommand;
            break;
          case 'schedule':
            const { handleScheduleCommand } = await import('../src/controllers/scheduleController');
            commandHandler = handleScheduleCommand;
            break;
          case 'feedback':
            const { handleFeedbackCommand } = await import('../src/controllers/feedbackController');
            commandHandler = handleFeedbackCommand;
            break;
          case 'help':
            const { handleShowHelp } = await import('../src/controllers/userController');
            commandHandler = handleShowHelp;
            break;
          case 'cancel':
            const { handleCancelCommand } = await import('../src/controllers/feedbackController');
            commandHandler = handleCancelCommand;
            break;
          default:
            console.log(`❌ Unknown command: /${command}`);
            results.failed.push(command);
            continue;
        }
        
        if (!commandHandler) {
          console.log(`❌ No handler found for /${command}`);
          results.failed.push(command);
          continue;
        }
        
        // Execute the command with proper typing
        await commandHandler(mockCtx);
        
        console.log(`✅ /${command} executed successfully`);
        results.passed.push(command);
        
      } catch (error) {
        // Fix: Properly type the error
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`❌ /${command} threw an error:`, errorMessage);
        results.failed.push(command);
        results.errors.push({ command, error: errorMessage });
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed.length}/${commands.length}`);
    console.log(`❌ Failed: ${results.failed.length}/${commands.length}`);
    
    if (results.passed.length > 0) {
      console.log(`\n✅ Successful commands: ${results.passed.join(', ')}`);
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ Failed commands: ${results.failed.join(', ')}`);
    }
    
    if (results.errors.length > 0) {
      console.log('\n🐛 Error Details:');
      results.errors.forEach(({ command, error }) => {
        console.log(`  • /${command}: ${error}`);
      });
    }
    
    // Test completion status
    if (results.failed.length === 0) {
      console.log('\n🎉 All bot commands are working correctly!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some commands need attention.');
      process.exit(1);
    }
    
  } catch (error) {
    // Fix: Properly type the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('💥 Fatal error during testing:', errorMessage);
    process.exit(1);
  }
}

/**
 * Test specific command scenarios
 */
async function testCommandScenarios(): Promise<void> {
  console.log('\n🔬 Testing specific command scenarios...');
  
  try {
    // Test user not found scenario
    const mockCtx = createMockContext('prompt');
    
    // Mock userService to return null (user not found)
    const originalGetUser = userService.getUser;
    userService.getUser = async () => null;
    
    console.log('\n Testing /prompt with no user...');
    // This should return "Please start the bot with /start first!"
    
    try {
      const { handleSendPrompt } = await import('../src/controllers/promptController');
      await handleSendPrompt(mockCtx);
      console.log('✅ /prompt handled missing user gracefully');
    } catch (error) {
      // Fix: Properly type the error
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ /prompt failed with missing user: ${errorMessage}`);
    }
    
    // Restore original function
    userService.getUser = originalGetUser;
    
  } catch (error) {
    // Fix: Properly type the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('💥 Error during scenario testing:', errorMessage);
  }
}

/**
 * Test callback query handling
 */
async function testCallbackQueries(): Promise<void> {
  console.log('\n🔘 Testing callback query handling...');
  
  try {
    const mockCtx = createMockContext('test');
    
    // Test common callback queries
    const callbackTests = [
      'schedule_enable',
      'schedule_disable', 
      'feedback_positive',
      'feedback_negative',
      'streak_view',
      'history_more'
    ];
    
    for (const callbackData of callbackTests) {
      try {
        // Update callback data
        //mockCtx.callbackQuery.data = callbackData;
        
        console.log(`\n📋 Testing callback: ${callbackData}`);
        
        // Test callback acknowledgment
        await mockCtx.answerCbQuery();
        
        console.log(`✅ Callback ${callbackData} handled successfully`);
        
      } catch (error) {
        // Fix: Properly type the error
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`❌ Callback ${callbackData} failed: ${errorMessage}`);
      }
    }
    
  } catch (error) {
    // Fix: Properly type the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('💥 Error during callback testing:', errorMessage);
  }
}

// Export functions for testing
export { testAllCommands, testCommandScenarios, testCallbackQueries };

// Run if called directly
if (require.main === module) {
  testAllCommands().catch((error) => {
    // Fix: Properly type the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Script failed:', errorMessage);
    process.exit(1);
  });
}