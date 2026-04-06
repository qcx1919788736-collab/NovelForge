#!/usr/bin/env node

/**
 * Craft Companion 导入工具
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
    name: '提取人物信息',
    file: '提示模板/导入已有小说/01-提取人物信息.md',
    desc: '从已有文本中提取人物档案与关系网络'
  },
  '2': {
    name: '提取世界观设定',
    file: '提示模板/导入已有小说/02-提取世界观设定.md',
    desc: '从已有文本中整理世界观、异能体系与规则'
  },
  '3': {
    name: '构建时间线',
    file: '提示模板/导入已有小说/03-构建时间线.md',
    desc: '从已有文本中重建故事时间线'
  },
  '4': {
    name: '分析文风特征',
    file: '提示模板/导入已有小说/04-分析文风特征.md',
    desc: '分析已有文本的语言风格、句式特征'
  },
  '5': {
    name: '识别伏笔线索',
    file: '提示模板/导入已有小说/05-识别伏笔线索.md',
    desc: '从已有文本中识别未揭示的伏笔与线索'
  }
};

async function importTool() {
  console.log('=== Craft Companion 导入工具 ===\n');
  console.log('这个工具帮助你把已有小说迁移到 Craft Companion。\n');
  console.log('推荐顺序：');
  console.log('1. 提取人物信息');
  console.log('2. 提取世界观设定');
  console.log('3. 构建时间线');
  console.log('4. 分析文风特征（最重要）');
  console.log('5. 识别伏笔线索\n');

  const choice = await question('选择步骤（1-5），或输入 a 显示全部: ');

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
  console.log(`模板路径：${prompt.file}`);
  console.log('\n请将下面这份模板和你的文本一起发给 AI：\n');
  console.log('---\n');

  const promptPath = path.join(__dirname, '..', prompt.file);
  const promptContent = fs.readFileSync(promptPath, 'utf-8');
  console.log(promptContent);
  console.log('\n---\n');
}

async function runAll() {
  console.log('\n将依次显示全部导入模板。');
  console.log('建议：先做 1-3，再做 4，最后做 5。\n');

  const confirm = await question('继续？(y/n): ');
  if (confirm.toLowerCase() !== 'y') return;

  for (const [key, prompt] of Object.entries(IMPORT_PROMPTS)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`步骤 ${key}: ${prompt.name}`);
    console.log('='.repeat(60));
    console.log(`${prompt.desc}`);
    console.log(`模板路径：${prompt.file}\n`);

    const promptPath = path.join(__dirname, '..', prompt.file);
    const promptContent = fs.readFileSync(promptPath, 'utf-8');
    console.log(promptContent);

    if (key !== '5') {
      console.log('\n按回车继续下一步...');
      await question('');
    }
  }

  console.log('\n全部导入模板已显示完毕。');
}

importTool().catch(console.error);
