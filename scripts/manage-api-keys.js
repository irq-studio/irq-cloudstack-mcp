#!/usr/bin/env node

import { ApiKeyManager } from '../build/api-key-manager.js';
import { program } from 'commander';
import Table from 'cli-table3';

/**
 * CLI tool to manage user API keys
 */

program
  .name('manage-api-keys')
  .description('Manage user API keys for CloudStack MCP server')
  .option('-c, --config <path>', 'Path to api-keys.json config file');

// List all users
program
  .command('list')
  .description('List all user API keys')
  .option('-a, --all', 'Show all users including disabled', false)
  .action((options) => {
    try {
      const apiKeyManager = new ApiKeyManager(program.opts().config);
      apiKeyManager.loadConfig();

      const students = apiKeyManager.getAllStudents();
      const filtered = options.all ? students : students.filter(s => s.enabled);

      if (filtered.length === 0) {
        console.log('No users found.');
        return;
      }

      const table = new Table({
        head: ['User ID', 'Name', 'Status', 'Usage', 'Last Used', 'Created'],
        colWidths: [15, 25, 10, 10, 20, 20]
      });

      filtered.forEach(student => {
        table.push([
          student.studentId,
          student.studentName,
          student.enabled ? 'Enabled' : 'Disabled',
          student.usageCount || 0,
          student.lastUsed ? new Date(student.lastUsed).toLocaleString() : 'Never',
          new Date(student.createdAt).toLocaleString()
        ]);
      });

      console.log(`\nTotal users: ${filtered.length}\n`);
      console.log(table.toString());

      const stats = apiKeyManager.getUsageStats();
      console.log(`\nStatistics:`);
      console.log(`  Total Users: ${stats.totalStudents}`);
      console.log(`  Enabled: ${stats.enabledStudents}`);
      console.log(`  Disabled: ${stats.totalStudents - stats.enabledStudents}`);
      console.log(`  Total API Calls: ${stats.totalUsage}`);

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Show user details
program
  .command('show <userId>')
  .description('Show details for a specific user')
  .action((userId) => {
    try {
      const apiKeyManager = new ApiKeyManager(program.opts().config);
      apiKeyManager.loadConfig();

      const students = apiKeyManager.getAllStudents();
      const student = students.find(s => s.studentId === userId);

      if (!student) {
        console.error(`User ${userId} not found`);
        process.exit(1);
      }

      console.log('\nUser Details:');
      console.log(`  User ID:           ${student.studentId}`);
      console.log(`  Name:              ${student.studentName}`);
      console.log(`  API Key:           ${student.apiKey}`);
      console.log(`  Status:            ${student.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`  CloudStack Access: ${student.cloudstackApiKey ? 'Individual credentials' : 'Shared credentials'}`);
      console.log(`  Created:           ${new Date(student.createdAt).toLocaleString()}`);
      console.log(`  Last Used:         ${student.lastUsed ? new Date(student.lastUsed).toLocaleString() : 'Never'}`);
      console.log(`  Usage Count:       ${student.usageCount || 0}`);

      console.log('\nConnection Command:');
      console.log(`  claude mcp add --transport http cloudstack \\`);
      console.log(`    https://cloudstack-mcp.irqstudio.com/mcp \\`);
      console.log(`    --header "X-Api-Key: ${student.apiKey}"`);

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Disable a user
program
  .command('disable <userId>')
  .description('Disable a user\'s API key')
  .action((userId) => {
    try {
      const apiKeyManager = new ApiKeyManager(program.opts().config);
      apiKeyManager.loadConfig();
      apiKeyManager.disableStudent(userId);
      console.log(`Disabled API key for user ${userId}`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Enable a user
program
  .command('enable <userId>')
  .description('Enable a user\'s API key')
  .action((userId) => {
    try {
      const apiKeyManager = new ApiKeyManager(program.opts().config);
      apiKeyManager.loadConfig();
      apiKeyManager.enableStudent(userId);
      console.log(`Enabled API key for user ${userId}`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Statistics
program
  .command('stats')
  .description('Show usage statistics')
  .action(() => {
    try {
      const apiKeyManager = new ApiKeyManager(program.opts().config);
      apiKeyManager.loadConfig();

      const stats = apiKeyManager.getUsageStats();
      const students = apiKeyManager.getAllStudents();

      console.log('\nUsage Statistics:\n');
      console.log(`Total Users:    ${stats.totalStudents}`);
      console.log(`Enabled Users:  ${stats.enabledStudents}`);
      console.log(`Disabled Users: ${stats.totalStudents - stats.enabledStudents}`);
      console.log(`Total API Calls:   ${stats.totalUsage}`);

      if (students.length > 0) {
        console.log('\nTop Users:');
        const sorted = [...students]
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 5);

        sorted.forEach((student, index) => {
          console.log(`  ${index + 1}. ${student.studentName} (${student.studentId}): ${student.usageCount || 0} calls`);
        });
      }

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
