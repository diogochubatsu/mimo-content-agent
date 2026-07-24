export const meta = {
  name: "deploy",
  description: "Deploy site to Vercel"
};

import { execSync } from 'child_process';
import path from 'path';

export default async function(args) {
  const { site = "importguide1688.com", preview = false } = args || {};
  
  phase("1. Pre-deploy checks");
  
  // Check if site directory exists
  const siteDir = path.join(process.cwd(), 'site');
  if (!fs.existsSync(siteDir)) {
    log("❌ Site directory not found");
    return { success: false, error: "Site directory not found" };
  }
  
  // Run tests
  log("Running tests...");
  try {
    execSync('node --test tests/pipeline.test.js', { encoding: 'utf8' });
    log("✓ Tests passed");
  } catch (error) {
    log("❌ Tests failed");
    return { success: false, error: "Tests failed" };
  }
  
  phase("2. Build site");
  
  try {
    execSync('npm run build', { cwd: siteDir, encoding: 'utf8' });
    log("✓ Build successful");
  } catch (error) {
    log("❌ Build failed");
    return { success: false, error: "Build failed" };
  }
  
  phase("3. Deploy to Vercel");
  
  try {
    const deployCmd = preview 
      ? 'vercel --yes'
      : `vercel --yes --prod`;
    
    const result = execSync(deployCmd, { cwd: siteDir, encoding: 'utf8' });
    log("✓ Deploy successful");
    log(result);
    
    return { success: true, url: result.trim() };
  } catch (error) {
    log("❌ Deploy failed");
    return { success: false, error: error.message };
  }
}
