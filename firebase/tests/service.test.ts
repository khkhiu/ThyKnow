import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { User } from '../src/models/User';
import { JournalEntry } from '../src/models/JournalEntry';
import { userService } from '../src/services/userService';
import { promptService } from '../src/services/promptService';
import { PROMPTS } from '../src/constants';
import { describe,beforeEach,afterEach,it } from 'node:test';

// Configure chai to use sinon-chai
chai.use(sinonChai);
const expect = chai.expect;

describe('UserService', () => {
  // Setup sandbox for stubs
  const sandbox = sinon.createSandbox();
  
  beforeEach(() => {
    // Stub MongoDB interactions
    sandbox.stub(User, 'findOne');
    sandbox.stub(User, 'find');
    sandbox.stub(User.prototype, 'save');
    sandbox.stub(JournalEntry, 'find');
    sandbox.stub(JournalEntry.prototype, 'save');
  });
  
  afterEach(() => {
    // Restore stubs
    sandbox.restore();
  });
  
  describe('getUser', () => {
    it('should find a user by ID', async () => {
      // Setup
      const mockUser = { id: '123', promptCount: 1 };
      (User.findOne as sinon.SinonStub).resolves(mockUser);
      
      // Execute
      const result = await userService.getUser('123');
      
      // Verify
      expect(result).to.deep.equal(mockUser);
      expect(User.findOne).to.have.been.calledWith({ id: '123' });
    });
    
    it('should return null if user is not found', async () => {
      // Setup
      (User.findOne as sinon.SinonStub).resolves(null);
      
      // Execute
      const result = await userService.getUser('nonexistent');
      
      // Verify
      expect(result).to.be.null;
    });
  });
  
  describe('createOrUpdateUser', () => {
    it('should create a new user if not exists', async () => {
      // Setup
      (User.findOne as sinon.SinonStub).resolves(null);
      (User.prototype.save as sinon.SinonStub).resolves({});
      
      // Execute
      await userService.createOrUpdateUser('123');
      
      // Verify
      expect(User.prototype.save).to.have.been.called;
    });
    
    it('should update an existing user', async () => {
      // Setup
      const mockUser = new User({ id: '123', promptCount: 1 });
      (User.findOne as sinon.SinonStub).resolves(mockUser);
      (User.prototype.save as sinon.SinonStub).resolves({});
      
      // Execute
      await userService.createOrUpdateUser('123', { promptCount: 2 });
      
      // Verify
      expect(User.prototype.save).to.have.been.called;
    });
  });
  
  // Add more tests for other methods...
});

describe('PromptService', () => {
  // Setup sandbox for stubs
  const sandbox = sinon.createSandbox();
  
  beforeEach(() => {
    // Stub MongoDB interactions
    sandbox.stub(User, 'findOne');
    sandbox.stub(User.prototype, 'save');
  });
  
  afterEach(() => {
    // Restore stubs
    sandbox.restore();
  });
  
  describe('getNextPromptForUser', () => {
    it('should return self-awareness prompt for odd counts', async () => {
      // Setup
      const mockUser = new User({ id: '123', promptCount: 0 });
      (User.findOne as sinon.SinonStub).resolves(mockUser);
      (User.prototype.save as sinon.SinonStub).resolves({});
      
      // Execute
      const result = await promptService.getNextPromptForUser('123');
      
      // Verify
      expect(result.type).to.equal('self_awareness');
      expect(result.count).to.equal(1);
      expect(PROMPTS.self_awareness).to.include(result.text);
    });
    
    it('should return connections prompt for even counts', async () => {
      // Setup
      const mockUser = new User({ id: '123', promptCount: 1 });
      (User.findOne as sinon.SinonStub).resolves(mockUser);
      (User.prototype.save as sinon.SinonStub).resolves({});
      
      // Execute
      const result = await promptService.getNextPromptForUser('123');
      
      // Verify
      expect(result.type).to.equal('connections');
      expect(result.count).to.equal(2);
      expect(PROMPTS.connections).to.include(result.text);
    });
  });
  
  // Add more tests for other methods...
});