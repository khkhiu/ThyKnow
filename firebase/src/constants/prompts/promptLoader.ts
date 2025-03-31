// src/constants/prompts/promptLoader.ts
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';

/**
 * Load prompts from a markdown file
 * @param filePath Path to the markdown file
 * @returns Array of prompts
 */
export function loadPromptsFromMarkdown(filePath: string): string[] {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Try alternate location (for development vs production environments)
      const altPath = path.join(process.cwd(), filePath.startsWith('/') ? filePath.slice(1) : filePath);
      if (fs.existsSync(altPath)) {
        filePath = altPath;
      } else {
        logger.warn(`Prompt file not found at ${filePath} or ${altPath}, using fallback prompts`);
        return [];
      }
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
    return prompts;
  } catch (error) {
    logger.error(`Error loading prompts from ${filePath}:`, error);
    return [];
  }
}