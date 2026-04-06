#!/usr/bin/env node

/**
 * Craft Companion 初始化脚本
 * 用于创建新项目的知识库结构与首步引导
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

async function init() {
  console.log('=== Craft Companion 项目初始化 ===\n');

  const projectName = await question('项目名称: ');
  if (!projectName) {
    console.log('错误：项目名称不能为空');
    rl.close();
    return;
  }

  console.log('\n你现在要走哪条路？');
  console.log('1. 从零开始写新小说');
  console.log('2. 导入已有小说');
  const modeChoice = await question('请选择（1/2）: ');

  if (!['1', '2'].includes(modeChoice)) {
    console.log('错误：请输入 1 或 2');
    rl.close();
    return;
  }

  const mode = modeChoice === '1'
    ? {
        key: 'from-scratch',
        label: '从零开始',
        nextStep: '提示模板/从零开始/01-定义核心概念.md'
      }
    : {
        key: 'import-existing',
        label: '导入已有小说',
        nextStep: '提示模板/导入已有小说/01-提取人物信息.md'
      };

  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log(`错误：目录 ${projectName} 已存在`);
    rl.close();
    return;
  }

  console.log(`\n将在 ${projectPath} 创建项目`);
  console.log(`模式：${mode.label}\n`);

  const dirs = [
    '知识库/00_核心上下文',
    '知识库/01_人物档案',
    '知识库/02_世界观设定',
    '知识库/03_故事进展',
    '知识库/04_写作参考',
    '工作区',
    '_归档'
  ];

  console.log('创建目录结构...');
  dirs.forEach(dir => {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  });

  console.log('创建基础文件...');
  writeFile(projectPath, '知识库/00_核心上下文/当前状态.md', '# 当前状态\n\n- 初始化中\n');
  writeFile(projectPath, '知识库/04_写作参考/错题集_完整版.md', '# 错题集\n\n暂无内容。\n');
  writeFile(projectPath, 'START_HERE.md', renderStartHere(projectName, mode));

  console.log('创建 CLAUDE.md...');
  const claudeMdTemplate = fs.readFileSync(
    path.join(__dirname, '../CLAUDE.md'),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(projectPath, 'CLAUDE.md'),
    claudeMdTemplate.replace(/\{\{project_name\}\}/g, projectName)
  );

  console.log('\n✓ 项目初始化完成！\n');
  console.log('下一步：');
  console.log(`  cd ${projectName}`);
  console.log(`  打开 ${mode.nextStep}`);
  console.log('  或先阅读 START_HERE.md\n');

  rl.close();
}

function writeFile(projectPath, relativePath, content) {
  const fullPath = path.join(projectPath, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

function renderStartHere(projectName, mode) {
  return `# 从这里开始\n\n项目：${projectName}\n模式：${mode.label}\n\n## 你现在该做什么\n\n1. 先让 AI 读取 \`CLAUDE.md\`\n2. 然后打开：\`${mode.nextStep}\`\n3. 按编号顺序完成初始化\n\n## 两种使用方式\n\n- 从零开始写新小说 → \`提示模板/从零开始/\`\n- 导入已有小说 → \`提示模板/导入已有小说/\`\n\n## 提醒\n\n不要一上来直接写正文。先完成对应模板，再进入正式创作。\n`;
}

init().catch(console.error);
