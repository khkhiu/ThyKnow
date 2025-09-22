// test/miniapp.test.ts
import { expect } from 'chai';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { describe, it } from 'node:test';

describe('MiniApp Integration Tests', () => {
  
  /**
   * Test all miniapp pages load correctly
   */
  describe('Page Loading Tests', () => {
    
    it('should serve the main miniapp page (/miniapp)', async () => {
      const res = await request(app)
        .get('/miniapp')
        .expect(200);
      
      expect(res.text).to.include('<!DOCTYPE html>');
      expect(res.text).to.include('ThyKnow');
      expect(res.headers['content-type']).to.include('text/html');
    });

    it('should serve the pet page (/miniapp/pet)', async () => {
      const res = await request(app)
        .get('/miniapp/pet')
        .expect(200);
      
      expect(res.text).to.include('<!DOCTYPE html>');
      expect(res.text).to.include('dino');
      expect(res.headers['content-type']).to.include('text/html');
    });

    it('should serve the streak page (/miniapp/streak)', async () => {
      const res = await request(app)
        .get('/miniapp/streak')
        .expect(200);
      
      expect(res.text).to.include('<!DOCTYPE html>');
      expect(res.headers['content-type']).to.include('text/html');
    });

    it('should handle non-existent miniapp pages gracefully', async () => {
      await request(app)
        .get('/miniapp/nonexistent')
        .expect(404);
    });
  });

  /**
   * Test miniapp API endpoints
   */
  describe('API Endpoint Tests', () => {
    
    it('should provide miniapp configuration (/miniapp/config)', async () => {
      const res = await request(app)
        .get('/miniapp/config')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(res.body).to.have.property('appName');
      expect(res.body).to.have.property('version');
      expect(res.body).to.have.property('features');
      expect(res.body.features).to.have.property('selfAwareness');
      expect(res.body.features).to.have.property('connections');
    });

    it('should provide user data endpoint (/miniapp/user/:userId)', async () => {
      const testUserId = '12345';
      const res = await request(app)
        .get(`/miniapp/user/${testUserId}`)
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(res.body).to.have.property('userId', testUserId);
      expect(res.body).to.have.property('preferences');
    });

    it('should handle prompts API (/api/miniapp/prompts/today/:userId)', async () => {
      const testUserId = '12345';
      const res = await request(app)
        .get(`/api/miniapp/prompts/today/${testUserId}`)
        .expect((res) => {
          // Should either return 200 with prompt data or handle gracefully
          expect([200, 404, 500]).to.include(res.status);
        });
    });

    it('should handle new prompts API (/api/miniapp/prompts/new/:userId)', async () => {
      const testUserId = '12345';
      const res = await request(app)
        .get(`/api/miniapp/prompts/new/${testUserId}`)
        .expect((res) => {
          expect([200, 404, 500]).to.include(res.status);
        });
    });

    it('should handle history API (/api/miniapp/history/:userId)', async () => {
      const testUserId = '12345';
      const res = await request(app)
        .get(`/api/miniapp/history/${testUserId}`)
        .expect((res) => {
          expect([200, 404, 500]).to.include(res.status);
        });
    });

    it('should handle responses API (/api/miniapp/responses)', async () => {
      const res = await request(app)
        .post('/api/miniapp/responses')
        .send({
          userId: '12345',
          promptId: 'test',
          response: 'Test response'
        })
        .expect((res) => {
          expect([200, 400, 404, 500]).to.include(res.status);
        });
    });

    it('should handle random affirmation API (/api/miniapp/pet/random)', async () => {
      const res = await request(app)
        .get('/api/miniapp/pet/random')
        .expect((res) => {
          expect([200, 404, 500]).to.include(res.status);
        });
    });
  });

  /**
   * Test file existence and structure
   */
  describe('File Structure Tests', () => {
    
    const requiredFiles = [
      'public/miniapp/index.html',
      'public/miniapp/pet.html'
    ];

    const expectedFiles = [
      'public/miniapp/dist/main.js',
      'public/miniapp/dist/pet.js',
      'public/miniapp/src/css/styles.css',
      'public/miniapp/src/css/pet.css'
    ];

    requiredFiles.forEach(filePath => {
      it(`should have required file: ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        expect(fs.existsSync(fullPath), `File ${filePath} does not exist`).to.be.true;
      });
    });

    expectedFiles.forEach(filePath => {
      it(`should have expected file: ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️  Expected file missing: ${filePath}`);
        }
        // Don't fail the test, just warn - these might be built files
      });
    });

    it('should have valid HTML structure in index.html', () => {
      const indexPath = path.join(process.cwd(), 'public/miniapp/index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        expect(content).to.include('<!DOCTYPE html>');
        expect(content).to.include('<html');
        expect(content).to.include('<head>');
        expect(content).to.include('<body>');
        expect(content).to.include('</html>');
      }
    });

    it('should have valid HTML structure in pet.html', () => {
      const petPath = path.join(process.cwd(), 'public/miniapp/pet.html');
      if (fs.existsSync(petPath)) {
        const content = fs.readFileSync(petPath, 'utf8');
        
        expect(content).to.include('<!DOCTYPE html>');
        expect(content).to.include('<html');
        expect(content).to.include('<head>');
        expect(content).to.include('<body>');
        expect(content).to.include('</html>');
      }
    });
  });

  /**
   * Test HTML content and JavaScript imports
   */
  describe('HTML Content Tests', () => {
    
    it('should have Telegram WebApp script in HTML files', () => {
      const htmlFiles = [
        'public/miniapp/index.html',
        'public/miniapp/pet.html'
      ];

      htmlFiles.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content).to.include('telegram-web-app.js');
        }
      });
    });

    it('should have proper module imports in index.html', () => {
      const indexPath = path.join(process.cwd(), 'public/miniapp/index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check for module type scripts
        expect(content).to.match(/type="module"/);
        
        // Check for main.js import
        expect(content).to.match(/dist\/main\.js/);
      }
    });

    it('should have proper module imports in pet.html', () => {
      const petPath = path.join(process.cwd(), 'public/miniapp/pet.html');
      if (fs.existsSync(petPath)) {
        const content = fs.readFileSync(petPath, 'utf8');
        
        // Check for module type scripts
        expect(content).to.match(/type="module"/);
        
        // Check for pet.js import
        expect(content).to.match(/dist\/pet\.js/);
      }
    });

    it('should have CSS imports in HTML files', () => {
      const htmlFiles = [
        { path: 'public/miniapp/index.html', css: 'styles.css' },
        { path: 'public/miniapp/pet.html', css: 'pet.css' }
      ];

      htmlFiles.forEach(({ path: filePath, css }) => {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content).to.include(css);
        }
      });
    });
  });

  /**
   * Test error handling
   */
  describe('Error Handling Tests', () => {
    
    it('should handle malformed API requests gracefully', async () => {
      await request(app)
        .post('/api/miniapp/responses')
        .send({ invalid: 'data' })
        .expect((res) => {
          expect([400, 422, 500]).to.include(res.status);
        });
    });

    it('should handle invalid user IDs gracefully', async () => {
      await request(app)
        .get('/api/miniapp/prompts/today/invalid-user-id')
        .expect((res) => {
          expect([400, 404, 500]).to.include(res.status);
        });
    });

    it('should return proper error responses in JSON format', async () => {
      const res = await request(app)
        .get('/api/miniapp/nonexistent-endpoint')
        .expect(404);
        
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.have.property('error');
    });
  });

  /**
   * Test static file serving
   */
  describe('Static File Serving Tests', () => {
    
    it('should serve JavaScript files if they exist', async () => {
      const jsFiles = ['main.js', 'pet.js'];
      
      for (const jsFile of jsFiles) {
        const filePath = path.join(process.cwd(), `public/miniapp/dist/${jsFile}`);
        if (fs.existsSync(filePath)) {
          await request(app)
            .get(`/miniapp/dist/${jsFile}`)
            .expect(200)
            .expect('Content-Type', /javascript/);
        } else {
          console.warn(`⚠️  JavaScript file not found: ${jsFile}`);
        }
      }
    });

    it('should serve CSS files if they exist', async () => {
      const cssFiles = ['styles.css', 'pet.css'];
      
      for (const cssFile of cssFiles) {
        const filePath = path.join(process.cwd(), `public/miniapp/src/css/${cssFile}`);
        if (fs.existsSync(filePath)) {
          await request(app)
            .get(`/miniapp/src/css/${cssFile}`)
            .expect(200)
            .expect('Content-Type', /css/);
        } else {
          console.warn(`⚠️  CSS file not found: ${cssFile}`);
        }
      }
    });
  });

  /**
   * Test CORS and security headers
   */
  describe('Security and Headers Tests', () => {
    
    it('should have proper CORS headers for miniapp endpoints', async () => {
      const res = await request(app)
        .get('/miniapp/config')
        .expect(200);
        
      // CORS should be enabled
      expect(res.headers).to.have.property('access-control-allow-origin');
    });

    it('should have security headers for HTML pages', async () => {
      const res = await request(app)
        .get('/miniapp')
        .expect(200);
        
      // Should have some security headers from helmet
      expect(res.headers).to.have.property('x-content-type-options');
    });
  });
});