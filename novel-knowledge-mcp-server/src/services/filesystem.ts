import * as fs from 'fs/promises';
import * as path from 'path';
import { KNOWLEDGE_BASE_PATH, KB_DIRS, CORE_FILES, WORK_DIR_PATH } from '../constants.js';
import type { Character, ChapterFile, SearchResult, KnowledgeBaseStats } from '../types.js';

/**
 * 文件系统服务 - 处理所有文件读写操作
 */
export class FileSystemService {
  private kbBasePath: string;
  private workDirPath: string;

  constructor() {
    this.kbBasePath = path.resolve(process.cwd(), KNOWLEDGE_BASE_PATH);
    this.workDirPath = path.resolve(process.cwd(), WORK_DIR_PATH);
  }

  /**
   * 读取文件内容
   */
  async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.kbBasePath, relativePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`无法读取文件 ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.kbBasePath, relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 列出目录下的所有文件
   */
  async listFiles(relativePath: string): Promise<string[]> {
    const fullPath = path.join(this.kbBasePath, relativePath);
    try {
      const files = await fs.readdir(fullPath);
      return files.filter(f => f.endsWith('.md'));
    } catch (error) {
      throw new Error(`无法列出目录 ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 搜索文件内容
   */
  async searchInFiles(query: string, directory: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const fullPath = path.join(this.kbBasePath, directory);

    try {
      const files = await this.listFiles(directory);

      for (const file of files) {
        const filePath = path.join(directory, file);
        const content = await this.readFile(filePath);

        // 简单的关键词匹配
        if (content.toLowerCase().includes(query.toLowerCase())) {
          // 提取匹配上下文
          const lines = content.split('\n');
          const matchedLines = lines.filter(line =>
            line.toLowerCase().includes(query.toLowerCase())
          );

          results.push({
            filePath,
            fileName: file,
            matchedContent: matchedLines.slice(0, 3).join('\n')
          });
        }
      }
    } catch (error) {
      // 目录不存在或无法访问，返回空结果
    }

    return results;
  }

  /**
   * 递归搜索所有子目录
   */
  async searchAllFiles(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const dir of Object.values(KB_DIRS)) {
      const dirResults = await this.searchInFiles(query, dir);
      results.push(...dirResults);
    }

    return results;
  }

  /**
   * 获取所有人物档案
   */
  async listCharacters(): Promise<Character[]> {
    const characters: Character[] = [];
    const files = await this.listFiles(KB_DIRS.CHARACTERS);

    for (const file of files) {
      const name = file.replace('_完整档案.md', '');
      const filePath = path.join(KB_DIRS.CHARACTERS, file);

      characters.push({
        name,
        personality: '',
        currentStatus: '',
        filePath
      });
    }

    return characters;
  }

  /**
   * 获取工作区章节文件
   */
  async listChapterFiles(chapterNumber?: number): Promise<ChapterFile[]> {
    const files: ChapterFile[] = [];

    try {
      const allFiles = await fs.readdir(this.workDirPath);
      const mdFiles = allFiles.filter(f => f.endsWith('.md') && f !== 'README.md');

      for (const file of mdFiles) {
        const match = file.match(/^第(\d+)章_(.+)\.md$/);
        if (match) {
          const num = parseInt(match[1]);
          const stagePart = match[2];

          if (chapterNumber && num !== chapterNumber) {
            continue;
          }

          let stage: ChapterFile['stage'] = '初稿';
          let version: string | undefined;

          if (stagePart.includes('章纲草案')) {
            stage = '章纲草案';
          } else if (stagePart.includes('选定章纲')) {
            stage = '选定章纲';
          } else if (stagePart.includes('初稿')) {
            stage = '初稿';
          } else if (stagePart.includes('修订稿')) {
            stage = '修订稿';
            const vMatch = stagePart.match(/v(\d+)/);
            if (vMatch) version = vMatch[1];
          } else if (stagePart.includes('终版')) {
            stage = '终版';
          }

          files.push({
            chapterNumber: num,
            fileName: file,
            filePath: path.join('工作区', file),
            stage,
            version
          });
        }
      }
    } catch (error) {
      throw new Error(`无法列出工作区文件: ${error instanceof Error ? error.message : String(error)}`);
    }

    return files.sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  /**
   * 获取知识库统计信息
   */
  async getStats(): Promise<KnowledgeBaseStats> {
    const stats: KnowledgeBaseStats = {
      totalFiles: 0,
      coreContextFiles: 0,
      characterFiles: 0,
      worldviewFiles: 0
    };

    try {
      const coreFiles = await this.listFiles(KB_DIRS.CORE_CONTEXT);
      stats.coreContextFiles = coreFiles.length;

      const charFiles = await this.listFiles(KB_DIRS.CHARACTERS);
      stats.characterFiles = charFiles.length;

      const worldFiles = await this.listFiles(KB_DIRS.WORLDVIEW);
      stats.worldviewFiles = worldFiles.length;

      stats.totalFiles = stats.coreContextFiles + stats.characterFiles + stats.worldviewFiles;
    } catch (error) {
      // 忽略错误，返回部分统计
    }

    return stats;
  }
}
