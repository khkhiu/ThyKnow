// src/constants/prompts/index.ts
import fs from 'fs';
import path from 'path';
import { PromptsCollection } from '../../types';
import { logger } from '../../utils/logger';

// Define embedded prompts that will be used as primary source or fallback
const EMBEDDED_PROMPTS: PromptsCollection = {
  self_awareness: [
    "What emotions have you experienced most frequently this week? What triggered them?",
    "Describe a situation where you felt truly authentic. What made it special?",
    "What personal values were challenged or reinforced this week?",
    "What patterns have you noticed in your reactions to stress lately?",
    "What's one thing you'd like to change about how you handle difficult conversations?",
    "How have your priorities shifted in the past few months?",
    "What recent experience has taught you something new about yourself?"
  ],
  connections: [
    "Which relationship in your life has grown the most recently? How?",
    "What conversation this week made you feel most understood?",
    "How have you shown appreciation to others this week?",
    "What boundaries have you set or need to set in your relationships?",
    "Who would you like to reconnect with, and what's holding you back?",
    "How has someone surprised you positively this week?",
    "What qualities do you admire most in your closest friends?"
  ]
};

/**
 * Load prompts from a markdown file
 * @param filePath Path to the markdown file
 * @returns Array of prompts
 */
function loadPromptsFromMarkdown(filePath: string): string[] {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.warn(`Prompt file not found at ${filePath}, will use embedded prompts`);
      return [];
    }
    
    // Read the markdown file
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Split the content by new lines and filter out empty lines and headers
    const lines = content.split('\n').filter(line => 
      line.trim() !== '' && 
      !line.startsWith('#') && 
      !line.startsWith('---')
    );
    
    // Group lines into paragraphs (prompts)
    const prompts: string[] = [];
    let currentPrompt = '';
    
    for (const line of lines) {
      if (line.trim() === '') {
        if (currentPrompt.trim() !== '') {
          prompts.push(currentPrompt.trim());
          currentPrompt = '';
        }
      } else {
        currentPrompt += (currentPrompt ? ' ' : '') + line.trim();
      }
    }
    
    // Add the last prompt if there is one
    if (currentPrompt.trim() !== '') {
      prompts.push(currentPrompt.trim());
    }
    
    logger.info(`Loaded ${prompts.length} prompts from ${path.basename(filePath)}`);
    return prompts.length > 0 ? prompts : [];
  } catch (error) {
    logger.error(`Error loading prompts from ${filePath}:`, error);
    return [];
  }
}

// Try multiple possible paths for the markdown files
function findAndLoadPrompts(baseName: string, defaultPrompts: string[]): string[] {
  // List of potential paths to try
  const potentialPaths = [
    path.join(__dirname, `${baseName}.md`),                   // Standard path
    path.join(process.cwd(), 'src', 'constants', 'prompts', `${baseName}.md`),  // Dev path
    path.join(process.cwd(), 'dist', 'constants', 'prompts', `${baseName}.md`), // Production path
    path.join(process.cwd(), `${baseName}.md`)                // Fallback path
  ];
  
  // Try each path until we find one that works
  for (const filePath of potentialPaths) {
    const prompts = loadPromptsFromMarkdown(filePath);
    if (prompts.length > 0) {
      return prompts;
    }
  }
  
  // If no file was found, log and return the embedded prompts
  logger.info(`Using embedded ${baseName} prompts - no valid file found`);
  return defaultPrompts;
}

// Load prompts, trying multiple file locations or falling back to embedded prompts
const selfAwarenessPrompts = findAndLoadPrompts('self_awareness', EMBEDDED_PROMPTS.self_awareness);
const connectionsPrompts = findAndLoadPrompts('connections', EMBEDDED_PROMPTS.connections);

// Create the prompts collection
export const PROMPTS: PromptsCollection = {
  self_awareness: selfAwarenessPrompts,
  connections: connectionsPrompts
};

// Export individual prompt arrays for direct access
export const SELF_AWARENESS_PROMPTS = PROMPTS.self_awareness;
export const CONNECTIONS_PROMPTS = PROMPTS.connections;

// Save prompts as markdown files if they don't exist yet (for first-time setup)
// This helps with future edits - users can modify these files directly
async function createMarkdownIfNotExists() {
  try {
    const markdownDir = path.join(process.cwd(), 'src', 'constants', 'prompts');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(markdownDir)) {
      fs.mkdirSync(markdownDir, { recursive: true });
    }
    
    const selfAwarenessPath = path.join(markdownDir, 'self_awareness.md');
    const connectionsPath = path.join(markdownDir, 'connections.md');
    
    // Create self_awareness.md if it doesn't exist
    if (!fs.existsSync(selfAwarenessPath)) {
      const content = "# Self-Awareness Prompts\n\n" + 
        EMBEDDED_PROMPTS.self_awareness.join("\n\n") + 
        "\n\n# Add more prompts below this line\n";
      fs.writeFileSync(selfAwarenessPath, content);
      logger.info(`Created markdown file: ${selfAwarenessPath}`);
    }
    
    // Create connections.md if it doesn't exist
    if (!fs.existsSync(connectionsPath)) {
      const content = "# Connection Prompts\n\n" + 
        EMBEDDED_PROMPTS.connections.join("\n\n") + 
        "\n\n# Add more prompts below this line\n";
      fs.writeFileSync(connectionsPath, content);
      logger.info(`Created markdown file: ${connectionsPath}`);
    }
  } catch (error) {
    logger.error('Error creating markdown files:', error);
  }
}

// Try to create the markdown files for future edits
createMarkdownIfNotExists().catch(error => logger.error('Failed to create markdown files:', error));