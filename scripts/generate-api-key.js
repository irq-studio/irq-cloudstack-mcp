#!/usr/bin/env node

import { randomBytes } from 'crypto';
import { ApiKeyManager } from '../build/api-key-manager.js';
import { program } from 'commander';

/**
 * Generate a secure API key for a user
 * Format: irq_<userId>_<32-char-hex>
 */
function generateApiKey(userId) {
  const randomHex = randomBytes(16).toString('hex');
  return `irq_${userId}_${randomHex}`;
}

/**
 * Parse command line arguments and generate API key
 */
program
  .name('generate-api-key')
  .description('Generate API key for an IRQ Studio user')
  .requiredOption('-s, --student <name>', 'User full name (e.g., "John Doe")')
  .requiredOption('-i, --id <id>', 'User ID/username (e.g., "jdoe")')
  .option('-k, --cloudstack-key <key>', 'Individual CloudStack API key (optional, uses shared if not provided)')
  .option('-x, --cloudstack-secret <secret>', 'Individual CloudStack secret key (optional, uses shared if not provided)')
  .option('--disabled', 'Create API key in disabled state', false)
  .option('-c, --config <path>', 'Path to api-keys.json config file')
  .parse(process.argv);

const options = program.opts();

try {
  // Initialize API key manager
  const apiKeyManager = new ApiKeyManager(options.config);
  apiKeyManager.loadConfig();

  // Generate API key
  const apiKey = generateApiKey(options.id);

  // Add user to configuration
  apiKeyManager.addStudent({
    apiKey,
    studentName: options.student,
    studentId: options.id,
    cloudstackApiKey: options.cloudstackKey || '',
    cloudstackSecretKey: options.cloudstackSecret || '',
    enabled: !options.disabled
  });

  // Print success message
  console.log('\nAPI key generated successfully!\n');
  console.log('User Details:');
  console.log(`  Name:       ${options.student}`);
  console.log(`  ID:         ${options.id}`);
  console.log(`  API Key:    ${apiKey}`);
  console.log(`  Status:     ${options.disabled ? 'Disabled' : 'Enabled'}`);
  console.log(`  CloudStack: ${options.cloudstackKey ? 'Individual credentials' : 'Shared credentials'}`);

  console.log('\nConnection Command:');
  console.log(`  claude mcp add --transport http cloudstack \\`);
  console.log(`    https://cloudstack-mcp.irqstudio.com/mcp \\`);
  console.log(`    --header "X-Api-Key: ${apiKey}"`);

  console.log('\nManagement Commands:');
  console.log(`  Disable: npm run manage-keys -- disable ${options.id}`);
  console.log(`  Enable:  npm run manage-keys -- enable ${options.id}`);
  console.log(`  List:    npm run manage-keys -- list`);

} catch (error) {
  console.error('\nError generating API key:');
  console.error(`  ${error.message}`);
  process.exit(1);
}
