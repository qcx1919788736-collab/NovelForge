#!/usr/bin/env node

/**
 * Craft Companion - AI 协作创作框架
 * 主命令入口
 */

const { spawn } = require('child_process');
const path = require('path');

const command = process.argv[2];
const args = process.argv.slice(3);

const commands = {
  'init': path.join(__dirname, '../tools/init.js'),
  'import': path.join(__dirname, '../tools/import-cli.js'),
  'new-chapter': path.join(__dirname, '../tools/novel-cli.js'),
  'archive': path.join(__dirname, '../tools/novel-cli.js'),
  'check': path.join(__dirname, '../tools/novel-cli.js'),
  'update-kb': path.join(__dirname, '../tools/novel-cli.js')
};

if (!command || command === '--help' || command === '-h') {
  console.log(`
Craft Companion - AI 协作创作框架

用法:
  craft-companion init              创建新项目
  craft-companion import            导入已有内容
  craft-companion new-chapter <n>   创建新章节工作文件
  craft-companion archive <n>       归档已完成章节
  craft-companion check             验证知识库完整性
  craft-companion update-kb <n>     更新知识库

或使用简短命令:
  cc-init                           创建新项目
  cc-import                         导入已有内容
  cc-cli new-chapter <n>            创建新章节工作文件
  `);
  process.exit(0);
}

const scriptPath = commands[command];

if (!scriptPath) {
  console.error(`错误：未知命令 "${command}"`);
  console.log('运行 "craft-companion --help" 查看可用命令');
  process.exit(1);
}

// 对于 novel-cli.js，需要传递命令和参数
const scriptArgs = scriptPath.includes('novel-cli.js')
  ? [scriptPath, command, ...args]
  : [scriptPath, ...args];

const child = spawn('node', scriptArgs, {
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code);
});
