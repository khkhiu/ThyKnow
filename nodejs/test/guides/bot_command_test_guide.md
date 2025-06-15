# Telegram Bot Commands Testing Setup

## Quick Setup

### 1. Add Test Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:bot": "ts-node scripts/verify-bot-commands.ts",
    "test:bot:commands": "npm run test -- test/bot-commands.test.ts",
    "test:bot:quick": "ts-node -e \"require('./scripts/verify-bot-commands.ts').testAllCommands()\"",
    "test:bot:scenarios": "ts-node -e \"require('./scripts/verify-bot-commands.ts').testCommandScenarios()\"",
    "test:bot:callbacks": "ts-node -e \"require('./scripts/verify-bot-commands.ts').testCallbackQueries()\""
  }
}
```

### 2. Install Additional Test Dependencies

```bash
npm install --save-dev chai sinon @types/chai @types/sinon
```

### 3. Create Test Directory Structure

```
test/
├── bot-commands.test.ts      # Comprehensive test suite
├── helpers/
│   ├── mock-context.ts       # Reusable mock context
│   └── test-utils.ts         # Test utilities
└── fixtures/
    └── sample-data.ts        # Sample test data
```

## Usage Examples

### Run All Command Tests
```bash
npm run test:bot
```

### Run Specific Test Categories
```bash
npm run test:bot:commands     # Full test suite
npm run test:bot:quick        # Quick verification
npm run test:bot:scenarios    # Edge case testing
npm run test:bot:callbacks    # Callback query testing
```

### Run Tests in Different Environments
```bash
# Local testing
NODE_ENV=test npm run test:bot

# Railway testing
railway run npm run test:bot

# With specific bot token
TELEGRAM_BOT_TOKEN=your_token npm run test:bot
```

## Test Categories Explained

### 1. **Command Error Prevention Tests**
- Verifies each command executes without throwing errors
- Checks responses don't contain error keywords
- Ensures proper response structure

### 2. **Missing User Handling Tests**
- Tests commands when user doesn't exist in database
- Verifies graceful "Please start the bot" messages
- Ensures no crashes on null user scenarios

### 3. **Error Handling Tests**
- Tests database connection failures
- Tests service unavailability scenarios
- Verifies graceful error responses

### 4. **Callback Query Tests**
- Tests inline keyboard callbacks
- Verifies callback data processing
- Ensures proper callback acknowledgment

### 5. **Integration Tests**
- Tests full command flows
- Verifies service interactions
- Tests real database operations (in test environment)

## Monitoring Error Messages

The tests automatically detect these error indicators:
- "error"
- "sorry" 
- "wrong"
- "failed"
- "RAWR" (your custom error message)

## Test Data Setup

### Create Mock User Data
```typescript
const testUser = {
  id: '999999',
  telegramId: '999999',
  firstName: 'TestUser',
  createdAt: new Date(),
  lastPrompt: null,
  promptType: null,
  schedulePreference: {
    enabled: true,
    day: 1,
    hour: 9
  }
};
```

### Mock Service Responses
```typescript
// Mock successful prompt response
promptServiceStub.getNextPromptForUser.resolves({
  text: 'Test reflection prompt',
  type: 'self_awareness',
  hint: 'Think deeply about this'
});

// Mock user history
userServiceStub.getRecentEntries.resolves([
  {
    id: 1,
    prompt: 'Test prompt',
    response: 'Test response',
    timestamp: new Date(),
    userId: '999999'
  }
]);
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Bot Commands Test

on: [push, pull_request]

jobs:
  test-bot-commands:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:bot
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          NODE_ENV: test
```

### Railway Deployment Check
```bash
# Add to your railway deployment script
echo "Testing bot commands..."
railway run npm run test:bot:quick
if [ $? -eq 0 ]; then
  echo "✅ All bot commands working"
else
  echo "❌ Bot command tests failed"
  exit 1
fi
```

## Debugging Failed Tests

### 1. Check Logs
```bash
# Enable debug logging
LOG_LEVEL=debug npm run test:bot
```

### 2. Test Individual Commands
```bash
# Test just one command
ts-node -e "
const { testAllCommands } = require('./scripts/verify-bot-commands.ts');
// Modify to test specific command
"
```

### 3. Check Database State
```bash
npm run db:info
npm run db:verify
```

### 4. Verify Environment Variables
```bash
ts-node -e "
console.log('Bot Token:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Missing');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
"
```

## Best Practices

### 1. **Run Tests Before Deployment**
- Always test commands before pushing to production
- Include bot testing in your CI/CD pipeline
- Test both success and error scenarios

### 2. **Mock External Dependencies**
- Mock Telegram API calls during testing
- Use test database or mock database calls
- Stub service dependencies

### 3. **Test Edge Cases**
- Missing user scenarios
- Invalid input handling
- Database connection failures
- Service timeouts

### 4. **Monitor Response Quality**
- Check for helpful error messages
- Verify user guidance is clear
- Ensure consistent messaging tone

### 5. **Regular Testing**
- Run tests after each feature addition
- Test after dependency updates
- Include in deployment verification

## Expected Test Results

**✅ Successful Test Output:**
```
🤖 Starting Bot Commands Verification...

🧪 Testing /start command...
📤 Bot Response: 🦕 Welcome to ThyKnow! 🦖...
✅ /start executed successfully

🧪 Testing /prompt command...
📤 Bot Response: 🧠 Self-Awareness Reflection...
✅ /prompt executed successfully

... (all commands)

📊 VERIFICATION SUMMARY
✅ Passed: 10/10
❌ Failed: 0/10

🎉 All bot commands are working correctly!
```

This comprehensive testing setup ensures your Telegram bot commands are reliable and provide good user experience!