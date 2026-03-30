// 常量定义
export const KNOWLEDGE_BASE_PATH = '../知识库';
export const WORK_DIR_PATH = '../工作区';
export const ARCHIVE_PATH = '../_归档';

export const CHARACTER_LIMIT = 100000; // 100KB文本限制

// 知识库目录结构
export const KB_DIRS = {
  CORE_CONTEXT: '00_核心上下文',
  CHARACTERS: '01_人物档案',
  WORLDVIEW: '02_世界观设定',
  STORY_PROGRESS: '03_故事进展',
  WRITING_REFERENCE: '04_写作参考'
} as const;

// 核心上下文文件（常见文件名，实际文件名可能因项目而异）
export const CORE_FILES = [
  '当前状态.md',
  '文风规则_完整版.md',
  '伏笔追踪表_完整版.md',
  '数值速查表.md',
  '写前护栏.md'
] as const;

// 响应格式
export enum ResponseFormat {
  JSON = 'json',
  MARKDOWN = 'markdown'
}
