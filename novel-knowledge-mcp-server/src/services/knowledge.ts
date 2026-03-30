import { FileSystemService } from './filesystem.js';
import type { ConsistencyIssue, SearchResult } from '../types.js';
import { KB_DIRS } from '../constants.js';

/**
 * 知识库服务 - 提供高级知识库操作
 */
export class KnowledgeBaseService {
  private fs: FileSystemService;

  constructor(fsService: FileSystemService) {
    this.fs = fsService;
  }

  /**
   * 智能搜索知识库
   */
  async search(query: string, category: string, limit: number): Promise<SearchResult[]> {
    let results: SearchResult[] = [];

    if (category === 'all') {
      results = await this.fs.searchAllFiles(query);
    } else {
      const dirMap: Record<string, string> = {
        'characters': KB_DIRS.CHARACTERS,
        'worldview': KB_DIRS.WORLDVIEW,
        'plot': KB_DIRS.STORY_PROGRESS,
        'writing_reference': KB_DIRS.WRITING_REFERENCE
      };

      const dir = dirMap[category];
      if (dir) {
        results = await this.fs.searchInFiles(query, dir);
      }
    }

    return results.slice(0, limit);
  }

  /**
   * 获取人物档案
   */
  async getCharacter(name: string): Promise<string> {
    const fileName = `${name}_完整档案.md`;
    const filePath = `${KB_DIRS.CHARACTERS}/${fileName}`;

    const exists = await this.fs.fileExists(filePath);
    if (!exists) {
      throw new Error(`未找到人物"${name}"的档案。可用人物：秦力、赵明、发林、李垣、张坤、江雪、张弛`);
    }

    return await this.fs.readFile(filePath);
  }

  /**
   * 获取伏笔追踪
   */
  async getPlotPoints(status: string): Promise<string> {
    const content = await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/伏笔追踪表_完整版.md`);

    if (status === 'all') {
      return content;
    }

    // 简单过滤：提取包含特定状态的段落
    const lines = content.split('\n');
    const filtered = lines.filter(line =>
      line.includes(status) || line.startsWith('#')
    );

    return filtered.join('\n');
  }

  /**
   * 获取当前状态
   */
  async getCurrentState(): Promise<string> {
    return await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/当前状态.md`);
  }

  /**
   * 一致性检查
   */
  async checkConsistency(chapterNumber: number, checkTypes: string[]): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];

    try {
      // 读取章节文件
      const chapterFiles = await this.fs.listChapterFiles(chapterNumber);
      if (chapterFiles.length === 0) {
        throw new Error(`未找到第${chapterNumber}章的文件`);
      }

      // 读取最新版本
      const latestFile = chapterFiles[chapterFiles.length - 1];
      const chapterContent = await this.fs.readFile(latestFile.filePath);

      // 读取核心上下文
      const numValues = await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/数值速查表.md`);
      const styleRules = await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/文风规则_完整版.md`);

      // 检查OOC
      if (checkTypes.includes('OOC')) {
        const characters = await this.fs.listCharacters();
        for (const char of characters) {
          if (chapterContent.includes(char.name)) {
            // 简单检查：如果章节中提到该人物，建议检查人物档案
            issues.push({
              type: 'OOC',
              severity: 'low',
              description: `章节中出现人物"${char.name}"，建议对照人物档案检查性格一致性`,
              suggestion: `查看 ${char.filePath}`
            });
          }
        }
      }

      // 检查数值错误
      if (checkTypes.includes('数值错误')) {
        // 提取章节中的数值
        const numberMatches = chapterContent.match(/\d+(\.\d+)?/g);
        if (numberMatches && numberMatches.length > 0) {
          issues.push({
            type: '数值错误',
            severity: 'medium',
            description: `章节中包含${numberMatches.length}个数值，建议对照数值速查表检查`,
            suggestion: '查看 知识库/00_核心上下文/数值速查表.md'
          });
        }
      }

      // 检查时间线
      if (checkTypes.includes('时间线错误')) {
        const timeKeywords = ['大年', '腊月', '初一', '初二', '初三', '初四', '初五'];
        const foundTimes = timeKeywords.filter(kw => chapterContent.includes(kw));
        if (foundTimes.length > 0) {
          issues.push({
            type: '时间线错误',
            severity: 'high',
            description: `章节中提到时间：${foundTimes.join('、')}，建议检查时间线一致性`,
            suggestion: '查看 知识库/03_故事进展/时间线_完整版.md'
          });
        }
      }

      // 检查设定冲突
      if (checkTypes.includes('设定冲突')) {
        const settingKeywords = ['焦灵综合征', '能力', '政策', '全球'];
        const foundSettings = settingKeywords.filter(kw => chapterContent.includes(kw));
        if (foundSettings.length > 0) {
          issues.push({
            type: '设定冲突',
            severity: 'medium',
            description: `章节中涉及设定：${foundSettings.join('、')}，建议检查世界观一致性`,
            suggestion: '查看 知识库/02_世界观设定/'
          });
        }
      }

    } catch (error) {
      throw new Error(`一致性检查失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    return issues;
  }

  /**
   * 智能推荐资料
   */
  async recommendResources(chapterOutline: string, limit: number): Promise<SearchResult[]> {
    const recommendations: SearchResult[] = [];

    // 提取章纲中的关键词
    const characters = ['秦力', '赵明', '发林', '李垣', '张坤', '江雪', '张弛'];
    const keywords = ['能力', '测试', '战斗', '亲情', '回忆', '伏笔'];

    // 推荐相关人物档案
    for (const char of characters) {
      if (chapterOutline.includes(char)) {
        recommendations.push({
          filePath: `${KB_DIRS.CHARACTERS}/${char}_完整档案.md`,
          fileName: `${char}_完整档案.md`,
          matchedContent: `章纲中提到人物"${char}"，推荐阅读完整档案`
        });
      }
    }

    // 推荐世界观设定
    if (chapterOutline.includes('能力') || chapterOutline.includes('焦灵')) {
      recommendations.push({
        filePath: `${KB_DIRS.WORLDVIEW}/焦灵综合征机制_完整版.md`,
        fileName: '焦灵综合征机制_完整版.md',
        matchedContent: '章纲涉及能力机制，推荐阅读世界观设定'
      });
    }

    // 推荐写作参考
    if (chapterOutline.includes('战斗') || chapterOutline.includes('打斗')) {
      recommendations.push({
        filePath: `${KB_DIRS.WRITING_REFERENCE}/场景范例_战斗.md`,
        fileName: '场景范例_战斗.md',
        matchedContent: '章纲包含战斗场景，推荐参考战斗范例'
      });
    }

    if (chapterOutline.includes('亲情') || chapterOutline.includes('家人')) {
      recommendations.push({
        filePath: `${KB_DIRS.WRITING_REFERENCE}/场景范例_亲情.md`,
        fileName: '场景范例_亲情.md',
        matchedContent: '章纲包含亲情场景，推荐参考亲情范例'
      });
    }

    // 始终推荐核心上下文
    recommendations.push({
      filePath: `${KB_DIRS.CORE_CONTEXT}/当前状态.md`,
      fileName: '当前状态.md',
      matchedContent: '推荐查看当前故事状态'
    });

    recommendations.push({
      filePath: `${KB_DIRS.CORE_CONTEXT}/伏笔追踪表_完整版.md`,
      fileName: '伏笔追踪表_完整版.md',
      matchedContent: '推荐查看待推进伏笔'
    });

    return recommendations.slice(0, limit);
  }
}
