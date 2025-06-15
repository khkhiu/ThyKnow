# MiniApp Testing Setup Guide

## Quick Setup

### 1. Add Test Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:miniapp": "ts-node scripts/verify-miniapp.ts",
    "test:miniapp:full": "npm run test -- test/miniapp.test.ts",
    "test:miniapp:pages": "ts-node -e \"require('./scripts/verify-miniapp.ts').testPageLoading()\"",
    "test:miniapp:api": "ts-node -e \"require('./scripts/verify-miniapp.ts').testApiEndpoints()\"",
    "test:miniapp:files": "ts-node -e \"require('./scripts/verify-miniapp.ts').testFileStructure()\"",
    "verify:miniapp": "npm run test:miniapp",
    "build:miniapp": "npm run copy-images && npm run fix-html-imports"
  }
}
```

### 2. Install Required Test Dependencies

```bash
npm install --save-dev supertest @types/supertest
```

### 3. Run MiniApp Tests

```bash
# Full verification
npm run test:miniapp

# Individual test categories
npm run test:miniapp:pages    # Test page loading
npm run test:miniapp:api      # Test API endpoints
npm run test:miniapp:files    # Test file structure

# Full test suite
npm run test:miniapp:full
```

## What Gets Tested

### 1. **Page Loading Tests**
✅ **Main MiniApp Page** (`/miniapp`)
- Loads without errors
- Returns valid HTML
- Contains expected content

✅ **Pet/Dino Page** (`/miniapp/pet`)
- Loads correctly
- Has dino-related content

✅ **Streak Page** (`/miniapp/streak`)
- Accessible and functional

✅ **Config API** (`/miniapp/config`)
- Returns proper JSON configuration
- Contains required fields

### 2. **API Endpoint Tests**
✅ **Configuration API** - `/miniapp/config`
✅ **User Data API** - `/miniapp/user/:userId`
✅ **Prompts APIs** - `/api/miniapp/prompts/*`
✅ **History API** - `/api/miniapp/history/:userId`
✅ **Pet/Affirmation API** - `/api/miniapp/pet/random`

### 3. **File Structure Tests**
✅ **Required Files:**
- `public/miniapp/index.html`
- `public/miniapp/pet.html`

✅ **Expected Files:**
- `public/miniapp/dist/main.js`
- `public/miniapp/dist/pet.js`
- `public/miniapp/src/css/styles.css`
- `public/miniapp/src/css/pet.css`

### 4. **HTML Content Quality Tests**
✅ **Valid HTML Structure**
- DOCTYPE declaration
- Proper HTML tags
- Head and body sections

✅ **Telegram Integration**
- telegram-web-app.js script
- Proper module imports

✅ **Resource References**
- JavaScript file imports
- CSS file imports
- ES6 module support

### 5. **Static File Serving Tests**
✅ **JavaScript Files**
- Correct MIME types
- Accessible via HTTP

✅ **CSS Files**
- Proper content types
- Valid serving

## Expected Test Output

### ✅ Successful Run:
```
🚀 ThyKnow MiniApp Verification
================================

🔍 Testing MiniApp Page Loading...

Testing: Main MiniApp Page (/miniapp)
✅ Main MiniApp Page: OK
Testing: Pet/Dino Page (/miniapp/pet)
✅ Pet/Dino Page: OK
Testing: Config API (/miniapp/config)
✅ Config API: OK

🌐 Testing MiniApp API Endpoints...

Testing: Configuration API (GET /miniapp/config)
✅ Configuration API: HTTP 200
Testing: User Data API (GET /miniapp/user/999999)
✅ User Data API: HTTP 200

📁 Testing MiniApp File Structure...

✅ Main HTML File: Found (4520 bytes)
✅ Pet HTML File: Found (3890 bytes)

📝 Testing HTML Content Quality...

Main HTML Content: 8/8 checks passed
  ✅ Has DOCTYPE
  ✅ Has HTML tag
  ✅ Has HEAD section
  ✅ Has BODY section
  ✅ Has Telegram WebApp script
  ✅ Has ES6 modules
  ✅ References main.js
  ✅ Has CSS imports

============================================================
📊 MINIAPP VERIFICATION SUMMARY
============================================================
✅ Passed: 25/25
❌ Failed: 0/25
⚠️  Warnings: 0/25

🎉 All miniapp tests passed successfully!
```

### ⚠️ With Warnings:
```
⚠️  Main JavaScript: File not found (may need to be built)
⚠️  Pet JavaScript: File not found (may need to be built)

============================================================
📊 MINIAPP VERIFICATION SUMMARY
============================================================
✅ Passed: 20/25
❌ Failed: 0/25
⚠️  Warnings: 5/25

✅ All critical tests passed! Some warnings need attention.
```

## Troubleshooting Common Issues

### 1. **Missing JavaScript Files**
```bash
# Build the miniapp TypeScript files
npm run build

# Or manually build JavaScript
tsc --outDir public/miniapp/dist public/miniapp/src/js/**/*.ts
```

### 2. **Missing CSS Files**
```bash
# Copy CSS files to expected locations
cp -r src/miniapp/css public/miniapp/src/
```

### 3. **HTML Import Errors**
```bash
# Fix HTML import paths
npm run fix-html-imports
node scripts/fix-html-imports.js
```

### 4. **API Endpoint Failures**
Check if your API routes are properly set up:
```typescript
// In app.ts, ensure you have:
app.use('/miniapp', miniAppRoutes);
app.use('/api/miniapp', miniAppApiRouter);
```

### 5. **Static File Serving Issues**
Verify static file middleware:
```typescript
// In app.ts:
app.use(express.static(path.join(process.cwd(), 'public')));
```

## Integration with CI/CD

### GitHub Actions Example:
```yaml
name: MiniApp Tests

on: [push, pull_request]

jobs:
  test-miniapp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:miniapp
        env:
          NODE_ENV: test
```

### Railway Deployment Check:
```bash
# Add to deployment script
echo "Building and testing miniapp..."
npm run build:miniapp
npm run test:miniapp

if [ $? -eq 0 ]; then
  echo "✅ MiniApp tests passed"
else
  echo "❌ MiniApp tests failed"
  exit 1
fi
```

## File Structure Overview

Your miniapp should have this structure:
```
public/miniapp/
├── index.html              # Main entry point
├── pet.html                # Pet/dino page
├── streak.html             # Streak page (optional)
├── dist/                   # Built JavaScript files
│   ├── main.js            # Main app logic
│   └── pet.js             # Pet page logic
└── src/
    ├── css/               # Stylesheets
    │   ├── styles.css     # Main styles
    │   └── pet.css        # Pet page styles
    ├── js/                # TypeScript source (pre-build)
    └── types/             # Type definitions
```

## Best Practices

### 1. **Run Tests Before Deployment**
```bash
npm run test:miniapp && npm run deploy
```

### 2. **Regular File Structure Validation**
```bash
# Check if files exist before building
npm run test:miniapp:files
```

### 3. **Test API Endpoints Separately**
```bash
# Quick API health check
npm run test:miniapp:api
```

### 4. **Monitor HTML Quality**
```bash
# Ensure HTML files are properly structured
ts-node -e "require('./scripts/verify-miniapp.ts').testHtmlContent()"
```

### 5. **Validate After Build Steps**
```bash
npm run build
npm run test:miniapp
```

This comprehensive testing setup ensures your MiniApp provides a reliable user experience across all pages and functionality!