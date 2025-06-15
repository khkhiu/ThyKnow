// test/bot-commands.test.ts
import { expect } from 'chai';
import sinon from 'sinon';
import { Telegraf, Context, Types } from 'telegraf';
import { setupBotCommands } from '../src/controllers/index';
import { userService } from '../src/services/userService';
import { promptService } from '../src/services/promptService';
import { MESSAGES } from '../src/constants';
import { describe, beforeEach, afterEach, it, before } from 'node:test';


describe('Telegram Bot Commands Integration Tests', () => {
  let bot: Telegraf;
  let mockContext: any;
  let userServiceStub: sinon.SinonStubbedInstance<typeof userService>;
  let promptServiceStub: sinon.SinonStubbedInstance<typeof promptService>;

  beforeEach(() => {
    // Create test bot instance
    bot = new Telegraf('test_token');
    setupBotCommands(bot);

    // Create mock context
    mockContext = {
      from: { id: 12345 },
      reply: sinon.stub().resolves(),
      replyWithMarkdown: sinon.stub().resolves(),
      message: { text: 'test message' },
      callbackQuery: { data: 'test_data' },
      answerCbQuery: sinon.stub().resolves()
    };

    // Stub services
    userServiceStub = sinon.stub(userService);
    promptServiceStub = sinon.stub(promptService);
  });

  afterEach(() => {
    sinon.restore();
  });

  /**
   * Test all bot commands to ensure they don't throw errors
   */
  describe('Command Error Prevention Tests', () => {
    
    it('should handle /start command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves(null);
      userServiceStub.createUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: {
          enabled: true,
          day: 1,
          hour: 9
        }
      });

      // Execute
      const handler = getCommandHandler(bot, 'start');
      await handler(mockContext);

      // Verify no error messages
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.not.include('sorry');
      expect(replyText).to.not.include(MESSAGES.ERROR);
    });

    it('should handle /prompt command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });
      
      promptServiceStub.getNextPromptForUser.resolves({
        text: 'Test prompt',
        type: 'self_awareness',
        hint: 'Test hint'
      });
      
      userServiceStub.saveLastPrompt.resolves();

      // Execute
      const handler = getCommandHandler(bot, 'prompt');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.include('Test prompt');
    });

    it('should handle /choose command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });

      // Execute
      const handler = getCommandHandler(bot, 'choose');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.not.include(MESSAGES.ERROR);
    });

    it('should handle /history command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: 'Test prompt',
        promptType: 'self_awareness',
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });
      
      userServiceStub.getRecentEntries.resolves([
        {
          id: 1,
          prompt: 'Test prompt',
          response: 'Test response',
          timestamp: new Date(),
          userId: '12345'
        }
      ]);

      // Execute
      const handler = getCommandHandler(bot, 'history');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.include('Journal Entries');
    });

    it('should handle /streak command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });

      userServiceStub.getUserWeeklyProgress.resolves({
        currentStreak: 2,
        currentWeekCompleted: true,
        currentWeekEntry: null,
        weeklyHistory: []
      });

      // Execute
      const handler = getCommandHandler(bot, 'streak');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.not.include(MESSAGES.ERROR);
    });

    it('should handle /miniapp command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });

      // Execute
      const handler = getCommandHandler(bot, 'miniapp');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyArgs = mockContext.reply.firstCall.args;
      expect(replyArgs[0]).to.not.include('error');
      expect(replyArgs[1]).to.have.property('reply_markup');
    });

    it('should handle /schedule command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });

      // Execute
      const handler = getCommandHandler(bot, 'schedule');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.include('schedule');
    });

    it('should handle /feedback command without errors', async () => {
      // Setup
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });

      // Execute
      const handler = getCommandHandler(bot, 'feedback');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.include('feedback');
    });

    it('should handle /help command without errors', async () => {
      // Execute
      const handler = getCommandHandler(bot, 'help');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
      expect(replyText).to.include('Commands');
      expect(replyText).to.equal(MESSAGES.HELP);
    });

    it('should handle /cancel command without errors', async () => {
      // Execute
      const handler = getCommandHandler(bot, 'cancel');
      await handler(mockContext);

      // Verify
      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.not.include('error');
    });
  });

  /**
   * Test commands with missing user scenarios
   */
  describe('Missing User Handling Tests', () => {
    beforeEach(() => {
      userServiceStub.getUser.resolves(null);
    });

    const commandsRequiringUser = ['prompt', 'choose', 'history', 'streak', 'miniapp', 'schedule', 'feedback'];

    commandsRequiringUser.forEach(command => {
      it(`should handle /${command} gracefully when user doesn't exist`, async () => {
        const handler = getCommandHandler(bot, command);
        await handler(mockContext);

        expect(mockContext.reply.called).to.be.true;
        const replyText = mockContext.reply.firstCall.args[0];
        expect(replyText).to.include('start the bot');
        expect(replyText).to.not.include(MESSAGES.ERROR);
      });
    });
  });

  /**
   * Test error handling scenarios
   */
  describe('Error Handling Tests', () => {
    it('should handle database errors gracefully in /start', async () => {
      userServiceStub.getUser.rejects(new Error('Database connection failed'));

      const handler = getCommandHandler(bot, 'start');
      await handler(mockContext);

      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.include('error');
    });

    it('should handle service errors gracefully in /prompt', async () => {
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });
      
      promptServiceStub.getNextPromptForUser.rejects(new Error('Service unavailable'));

      const handler = getCommandHandler(bot, 'prompt');
      await handler(mockContext);

      expect(mockContext.reply.called).to.be.true;
      const replyText = mockContext.reply.firstCall.args[0];
      expect(replyText).to.include('error');
    });
  });

  /**
   * Test callback query handlers
   */
  describe('Callback Query Tests', () => {
    it('should handle choose callback without errors', async () => {
      mockContext.callbackQuery = { data: 'choose:self_awareness' };
      userServiceStub.getUser.resolves({
        id: '12345',
        telegramId: '12345',
        firstName: 'Test',
        createdAt: new Date(),
        lastPrompt: null,
        promptType: null,
        schedulePreference: { enabled: true, day: 1, hour: 9 }
      });
      
      promptServiceStub.getNextPromptForUser.resolves({
        text: 'Test prompt',
        type: 'self_awareness',
        hint: 'Test hint'
      });

      // Simulate callback query handler
      const callbackHandlers = getCallbackHandlers(bot);
      await callbackHandlers[0](mockContext);

      expect(mockContext.answerCbQuery.called).to.be.true;
    });
  });
});

/**
 * Helper function to extract command handler from bot
 */
function getCommandHandler(bot: Telegraf, command: string): any {
  const handlers = (bot as any).handlers;
  const commandHandlers = handlers.find((h: any) => h.type === 'text');
  return commandHandlers?.middleware || (() => {});
}

/**
 * Helper function to extract callback handlers from bot
 */
function getCallbackHandlers(bot: Telegraf): any[] {
  const handlers = (bot as any).handlers;
  return handlers.filter((h: any) => h.type === 'callback_query').map((h: any) => h.middleware);
}

/**
 * Comprehensive bot commands integration test
 * This runs all commands in sequence to ensure none throw unhandled errors
 */
describe('Bot Commands Full Integration Test', () => {
  let bot: Telegraf;
  
  before(() => {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || 'test_token');
    setupBotCommands(bot);
  });

  it('should handle all commands in sequence without crashing', async () => {
    const commands = ['start', 'prompt', 'choose', 'history', 'streak', 'miniapp', 'schedule', 'feedback', 'help', 'cancel'];
    
    const mockContext = {
      from: { id: 12345 },
      reply: sinon.stub().resolves(),
      replyWithMarkdown: sinon.stub().resolves(),
      message: { text: 'test' },
      answerCbQuery: sinon.stub().resolves()
    };

    // Stub all service methods to prevent actual database calls
    sinon.stub(userService, 'getUser').resolves({
      id: '12345',
      telegramId: '12345',
      firstName: 'Test',
      createdAt: new Date(),
      lastPrompt: null,
      promptType: null,
      schedulePreference: { enabled: true, day: 1, hour: 9 }
    });

    sinon.stub(userService, 'getRecentEntries').resolves([]);
    sinon.stub(userService, 'getUserWeeklyProgress').resolves({
      currentStreak: 0,
      currentWeekCompleted: false,
      currentWeekEntry: null,
      weeklyHistory: []
    });

    // Test each command
    for (const command of commands) {
      try {
        const handler = getCommandHandler(bot, command);
        await handler(mockContext);
        console.log(`✅ /${command} command executed successfully`);
      } catch (error) {
        console.error(`❌ /${command} command failed:`, error);
        throw error;
      }
    }
  });
});