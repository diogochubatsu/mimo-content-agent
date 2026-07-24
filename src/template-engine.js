/**
 * Template Engine - Generate articles from templates
 */

import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'content-db', 'templates');

/**
 * Load template by tier
 */
export function loadTemplate(tier) {
  const templatePath = path.join(TEMPLATES_DIR, `${tier}.md`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${tier}`);
  }
  
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Fill template with data
 */
export function fillTemplate(template, data) {
  let filled = template;
  
  // Replace all {{variable}} placeholders
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    filled = filled.replace(regex, value || '');
  }
  
  return filled;
}

/**
 * Generate article from template
 */
export function generateFromTemplate(tier, data) {
  const template = loadTemplate(tier);
  return fillTemplate(template, data);
}

/**
 * Get available templates
 */
export function getTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }
  
  return fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f.replace('.md', ''),
      path: path.join(TEMPLATES_DIR, f)
    }));
}

export default {
  loadTemplate,
  fillTemplate,
  generateFromTemplate,
  getTemplates
};
