#!/usr/bin/env node

/**
 * NovelForge 导入工具
 * 用于将现有文本导入到知识库
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const IMPORT_PROMPTS = {
  '1': {
    name: '提取人物档案',
    file: 'prompts/import/01-extract-characters.md',
    desc: '从文本中提取角色信息，生成人物档案'
  },
  '2': {
    name: '提取世界观设定',
    file: 'prompts/import/02-extract-worldview.md',
    desc: '提取世界观、设定、术语等信息'
  },
  '3': {
    name: '构建时间线',
    file: 'prompts/import/03-extract-timeline.md',
    desc: '提取时间信息，构建故事时间线'
  },
  '4': {
    name: '分析文风特征',
    file: 'prompts/import/04-analyze-style.md',
    desc: '分析写作风格，生成文风规则'
  },
  '5': {
    name: '识别伏笔线索',
    file: 'prompts/import/05-extract-threads.md',
    desc: '识别伏笔、线索、悬念'
  }
};

async function importTool() {
  console.log('=== NovelForge 导入工具 ===\n');
  console.log('这个工具帮助你将现有文本导入到知识库。\n');
  console.log('导入步骤：');
  console.log('1. 提取人物档案');
  console.log('2. 提取世界观设定');
  console.log('3. 构建时间线');
  console.log('4. 分析文风特征（重要！）');
  console.log('5. 识别伏笔线索\n');
  console.log('建议按顺序执行，但也可以单独执行某一步。\n');

  const choice = await question('选择要执行的步骤（1-5），或输入 a 执行全部: ');

  if (choice === 'a') {
    await runAll();
  } else if (IMPORT_PROMPTS[choice]) {
    await runSingle(choice);
  } else {
    console.log('无效选择');
  }

  rl.close();
}

async function runSingle(step) {
  const prompt = IMPORT_PROMPTS[step];
  console.log(`\n=== ${prompt.name} ===`);
  console.log(prompt.desc);
  console.log('\n请将以下 prompt 和你的文本一起发送给 AI：\n');
  console.log('---\n');

  const promptPath = path.join(__dirname, '..', prompt.file);
  const promptContent = fs.readFileSync(promptPath, 'utf-8');
  console.log(promptContent);
  console.log('\n---\n');
}

async function runAll() {
  console.log('\n将依次显示所有导入 prompt。');
  console.log('建议：');
  console.log('1. 先执行步骤 1-3（人物、世界观、时间线）');
  console.log('2. 再执行步骤 4（文风分析）- 这是最重要的');
  console.log('3. 最后执行步骤 5（伏笔识别）\n');

  const confirm = await question('继续？(y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    return;
  }

  for (const [key, prompt] of Object.entries(IMPORT_PROMPTS)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`步骤 ${key}: ${prompt.name}`);
    console.log('='.repeat(60));
    console.log(prompt.desc);
    console.log('\nPrompt 内容：\n');

    const promptPath = path.join(__dirname, '..', prompt.file);
    const promptContent = fs.readFileSync(promptPath, 'utf-8');
    console.log(promptContent);

    if (key !== '5') {
      console.log('\n按回车继续下一步...');
      await question('');
    }
  }

  console.log('\n所有 prompt 已显示完毕。');
  console.log('将这些 prompt 和你的文本分别发送给 AI，AI 会生成对应的知识库文件。');
}

importTool().catch(console.error);
