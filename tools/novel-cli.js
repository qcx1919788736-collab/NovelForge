#!/usr/bin/env node

/**
 * NovelForge CLI 工具
 * 管理章节创作流程、归档和知识库一致性检查
 */

const fs = require('fs');
const path = require('path');

const WORK_DIR = path.join(process.cwd(), '工作区');
const ARCHIVE_DIR = path.join(process.cwd(), '_归档', '已完成章节');
const KB_DIR = path.join(process.cwd(), '知识库');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// 创建新章节工作文件
function newChapter(num) {
  if (!num || isNaN(num)) {
    log('错误：请提供章节编号', 'red');
    log('用法：novelforge new-chapter <编号>', 'yellow');
    return;
  }

  if (!fs.existsSync(WORK_DIR)) {
    fs.mkdirSync(WORK_DIR, { recursive: true });
  }

  const files = [
    `第${num}章_章纲草案_版本A.md`,
    `第${num}章_章纲草案_版本B.md`,
    `第${num}章_章纲草案_版本C.md`
  ];

  log(`\n创建第${num}章工作文件...`, 'cyan');

  files.forEach(file => {
    const filePath = path.join(WORK_DIR, file);
    if (fs.existsSync(filePath)) {
      log(`  - ${file} 已存在，跳过`, 'yellow');
    } else {
      fs.writeFileSync(filePath, `# 第${num}章章纲草案\n\n待生成...\n`);
      log(`  + ${file}`, 'green');
    }
  });

  log(`\n完成。下一步：使用 AI 生成章纲`, 'green');
}

// 归档章节
function archiveChapter(num) {
  if (!num || isNaN(num)) {
    log('错误：请提供章节编号', 'red');
    return;
  }

  if (!fs.existsSync(WORK_DIR)) {
    log('工作区目录不存在', 'red');
    return;
  }

  const allFiles = fs.readdirSync(WORK_DIR);
  const chapterFiles = allFiles.filter(f => f.startsWith(`第${num}章_`));

  if (chapterFiles.length === 0) {
    log(`未找到第${num}章的文件`, 'yellow');
    return;
  }

  const finalVersion = chapterFiles.find(f => f.includes('终版'));
  if (!finalVersion) {
    log('警告：未找到终版文件', 'yellow');
  }

  const archiveDir = path.join(ARCHIVE_DIR, `第${num}章`);
  fs.mkdirSync(archiveDir, { recursive: true });

  let archived = 0;
  let kept = 0;

  chapterFiles.forEach(file => {
    if (file.includes('终版')) {
      log(`  保留 ${file}`, 'blue');
      kept++;
    } else {
      fs.renameSync(
        path.join(WORK_DIR, file),
        path.join(archiveDir, file)
      );
      log(`  归档 ${file}`, 'green');
      archived++;
    }
  });

  log(`\n完成：${archived} 个归档，${kept} 个保留`, 'green');
}

// 检查知识库一致性
function check() {
  log('\n检查知识库一致性...\n', 'cyan');

  let issues = 0;

  // 检查核心目录
  const corePath = path.join(KB_DIR, '00_核心上下文');
  if (!fs.existsSync(corePath)) {
    log('  [缺失] 知识库/00_核心上下文/', 'red');
    issues++;
  } else {
    const requiredFiles = ['当前状态.md', '文风规则_完整版.md'];
    const optionalFiles = ['伏笔追踪表_完整版.md', '数值速查表.md'];

    requiredFiles.forEach(f => {
      if (fs.existsSync(path.join(corePath, f))) {
        log(`  [OK] 00_核心上下文/${f}`, 'green');
      } else {
        log(`  [缺失] 00_核心上下文/${f}（必需）`, 'red');
        issues++;
      }
    });

    optionalFiles.forEach(f => {
      if (fs.existsSync(path.join(corePath, f))) {
        log(`  [OK] 00_核心上下文/${f}`, 'green');
      } else {
        log(`  [可选] 00_核心上下文/${f}`, 'yellow');
      }
    });
  }

  // 检查人物档案
  const charPath = path.join(KB_DIR, '01_人物档案');
  if (fs.existsSync(charPath)) {
    const charFiles = fs.readdirSync(charPath).filter(f =>
      f.endsWith('.md') && !f.startsWith('_')
    );
    log(`  [OK] 人物档案：${charFiles.length} 个`, 'green');
    if (charFiles.length === 0) {
      log('  [提示] 还没有人物档案，建议先创建主角档案', 'yellow');
    }
  }

  // 检查写作参考
  const refPath = path.join(KB_DIR, '04_写作参考');
  if (fs.existsSync(refPath)) {
    const hasErrorLog = fs.existsSync(path.join(refPath, '错题集_完整版.md'));
    if (hasErrorLog) {
      log('  [OK] 04_写作参考/错题集_完整版.md', 'green');
    } else {
      log('  [可选] 04_写作参考/错题集_完整版.md', 'yellow');
    }
  }

  console.log('');
  if (issues === 0) {
    log('知识库状态良好', 'green');
  } else {
    log(`发现 ${issues} 个问题，请补充缺失文件`, 'red');
  }
}

// 显示知识库更新清单
function updateKb(num) {
  if (!num || isNaN(num)) {
    log('错误：请提供章节编号', 'red');
    return;
  }

  log(`\n第${num}章终版后，需要更新以下文件：\n`, 'cyan');
  log('  [ ] 00_核心上下文/当前状态.md', 'yellow');
  log('      更新最新进度、人物状态、待推进事项', 'reset');
  log('  [ ] 00_核心上下文/最近章节梗概.md', 'yellow');
  log('      追加本章梗概', 'reset');
  log('  [ ] 00_核心上下文/伏笔追踪表_完整版.md', 'yellow');
  log('      更新伏笔状态', 'reset');
  log('  [ ] 01_人物档案/', 'yellow');
  log('      更新人物状态变化（如有）', 'reset');
  log('  [ ] 04_写作参考/错题集_完整版.md', 'yellow');
  log('      记录新发现的错误模式（如有）', 'reset');
  log('\n提示：让 AI 根据终版内容自动更新这些文件', 'blue');
}

function showHelp() {
  log('\nNovelForge CLI - 小说创作辅助工具\n', 'cyan');
  log('用法：node novel-cli.js <命令> [参数]\n', 'blue');
  log('命令：', 'blue');
  log('  new-chapter <编号>    创建新章节工作文件', 'green');
  log('  archive <编号>        归档已完成章节', 'green');
  log('  update-kb <编号>      显示知识库更新清单', 'green');
  log('  check                 检查知识库一致性', 'green');
  log('  help                  显示帮助\n', 'green');
  log('示例：', 'blue');
  log('  node novel-cli.js new-chapter 1', 'yellow');
  log('  node novel-cli.js archive 1', 'yellow');
  log('  node novel-cli.js check\n', 'yellow');
}

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
  case 'new-chapter': newChapter(param); break;
  case 'archive': archiveChapter(param); break;
  case 'update-kb': updateKb(param); break;
  case 'check': check(); break;
  case 'help': case undefined: showHelp(); break;
  default:
    log(`未知命令：${command}`, 'red');
    showHelp();
}
