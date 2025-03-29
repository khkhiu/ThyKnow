import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { Telegraf } from 'telegraf';
import app, { bot } from '../src/app';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { JournalEntry } from '../src/models/JournalEntry';
import { describe,beforeEach,afterEach,it,before,after } from 'node:test';

// Configure chai to use sinon-chai
chai.use(sinonChai);
const expect = chai.expect;

describe('Express Server', () => {
  before(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/thyknow_test');
    
    // Clear test database collections
    await User.deleteMany({});
    await JournalEntry.deleteMany({});
  });
  
  after(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });
  
  describe('Health Check', () => {
    it('should return 200 OK with status information', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('status', 'ok');
      expect(response.body).to.have.property('timestamp');
    });
  });
  
  describe('Webhook Endpoint', () => {
    beforeEach(() => {
      // Stub bot handleUpdate method
      sinon.stub(bot, 'handleUpdate').resolves();
    });
    
    afterEach(() => {
      // Restore stubs
      sinon.restore();
    });
    
    it('should accept Telegram updates', async () => {
      const fakeUpdate = { 
        update_id: 123456789,
        message: {
          message_id: 123,
          from: { id: 12345, first_name: 'Test', is_bot: false },
          chat: { id: 12345, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: '/start'
        }
      };
      
      const response = await request(app)
        .post('/webhook')
        .send(fakeUpdate)
        .set('Content-Type', 'application/json');
      
      expect(response.status).to.equal(200);
      expect(bot.handleUpdate).to.have.been.calledWith(fakeUpdate);
    });
  });
  
  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'Not found');
    });
  });
});

// This test requires a mock Telegraf instance
describe('Bot Commands', () => {
  let telegrafMock;
  let setupBotCommands;
  
  before(() => {
    // Create mock Telegraf instance
    telegrafMock = {
      start: sinon.stub(),
      command: sinon.stub(),
      on: sinon.stub(),
      catch: sinon.stub(),
      telegram: {
        setMyCommands: sinon.stub().resolves()
      }
    };
    
    // Import the controller with our mock
    const botController = require('../src/controllers/botController');
    setupBotCommands = botController.setupBotCommands;
  });
  
  it('should register all required commands', () => {
    // Call the setup function with our mock
    setupBotCommands(telegrafMock);
    
    // Verify all commands are registered
    expect(telegrafMock.start).to.have.been.called;
    expect(telegrafMock.command).to.have.been.calledWith('prompt');
    expect(telegrafMock.command).to.have.been.calledWith('history');
    expect(telegrafMock.command).to.have.been.calledWith('timezone');
    expect(telegrafMock.command).to.have.been.calledWith('help');
    expect(telegrafMock.on).to.have.been.calledWith('text');
    expect(telegrafMock.catch).to.have.been.called;
    expect(telegrafMock.telegram.setMyCommands).to.have.been.called;
  });
});