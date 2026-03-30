#!/usr/bin/env node

/**
 * NovelForge 初始化脚本
 * 用于创建新项目的知识库结构
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
  console.log('=== NovelForge 项目初始化 ===\n');

  const projectName = await question('项目名称: ');
  if (!projectName) {
    console.log('错误：项目名称不能为空');
    rl.close();
    return;
  }

  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log(`错误：目录 ${projectName} 已存在`);
    rl.close();
    return;
  }

  console.log(`\n将在 ${projectPath} 创建项目\n`);

  // 创建目录结构
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
    const fullPath = path.join(projectPath, dir);
    fs.mkdirSync(fullPath, { recursive: true });
  });

  // 复制模板文件
  console.log('复制模板文件...');
  const templateDir = path.join(__dirname, '../template');
  copyTemplates(templateDir, path.join(projectPath, '知识库'));

  // 创建 CLAUDE.md
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
  console.log('  # 如果你有现成文本，使用导入工具');
  console.log('  # 如果从零开始，使用引导 prompt\n');

  rl.close();
}

function copyTemplates(src, dest) {
  if (!fs.existsSync(src)) return;

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyTemplates(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

init().catch(console.error);
