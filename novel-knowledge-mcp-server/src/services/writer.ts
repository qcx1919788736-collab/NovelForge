import * as fs from 'fs/promises';
import * as path from 'path';
import { KNOWLEDGE_BASE_PATH } from '../constants.js';

/**
 * 写入服务 - 处理知识库的写入操作
 * 包含安全机制：备份、验证、回滚
 */
export class WriterService {
  private kbBasePath: string;
  private backupDir: string;

  constructor() {
    this.kbBasePath = path.resolve(process.cwd(), KNOWLEDGE_BASE_PATH);
    this.backupDir = path.resolve(process.cwd(), '.kb-backups');
  }

  /**
   * 初始化备份目录
   */
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      throw new Error(`无法创建备份目录: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 备份文件
   */
  private async backupFile(relativePath: string): Promise<string> {
    await this.ensureBackupDir();
    
    const sourcePath = path.join(this.kbBasePath, relativePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${path.basename(relativePath, '.md')}_${timestamp}.md`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      // 检查源文件是否存在
      await fs.access(sourcePath);
      // 复制到备份目录
      await fs.copyFile(sourcePath, backupPath);
      return backupPath;
    } catch (error) {
      // 文件不存在，不需要备份（可能是新建文件）
      return '';
    }
  }

  /**
   * 验证文件内容格式
   */
  private validateContent(content: string, relativePath: string): { valid: boolean; error?: string } {
    // 基本验证
    if (!content || content.trim().length === 0) {
      return { valid: false, error: '内容不能为空' };
    }

    // 检查是否是 Markdown 文件
    if (!relativePath.endsWith('.md')) {
      return { valid: false, error: '只支持 Markdown 文件' };
    }

    // 检查路径是否在知识库范围内
    const fullPath = path.join(this.kbBasePath, relativePath);
    if (!fullPath.startsWith(this.kbBasePath)) {
      return { valid: false, error: '路径必须在知识库范围内' };
    }

    return { valid: true };
  }

  /**
   * 写入文件（覆盖）
   */
  async writeFile(relativePath: string, content: string): Promise<{ success: boolean; backupPath?: string; error?: string }> {
    // 验证内容
    const validation = this.validateContent(content, relativePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const fullPath = path.join(this.kbBasePath, relativePath);

    try {
      // 备份原文件
      const backupPath = await this.backupFile(relativePath);

      // 确保目录存在
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // 写入新内容
      await fs.writeFile(fullPath, content, 'utf-8');

      return { success: true, backupPath: backupPath || undefined };
    } catch (error) {
      return {
        success: false,
        error: `写入失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 追加内容到文件
   */
  async appendToFile(relativePath: string, content: string): Promise<{ success: boolean; error?: string }> {
    // 验证内容
    const validation = this.validateContent(content, relativePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const fullPath = path.join(this.kbBasePath, relativePath);

    try {
      // 备份原文件
      await this.backupFile(relativePath);

      // 追加内容
      await fs.appendFile(fullPath, '\n' + content, 'utf-8');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `追加失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 更新文件中的特定部分（基于标记）
   */
  async updateSection(
    relativePath: string,
    sectionMarker: string,
    newContent: string
  ): Promise<{ success: boolean; error?: string }> {
    const fullPath = path.join(this.kbBasePath, relativePath);

    try {
      // 备份原文件
      await this.backupFile(relativePath);

      // 读取原文件
      const originalContent = await fs.readFile(fullPath, 'utf-8');

      // 查找并替换部分内容
      // 假设使用 Markdown 标题作为标记，例如 "## 当前状态"
      const lines = originalContent.split('\n');
      const sectionIndex = lines.findIndex(line => line.trim() === sectionMarker);

      if (sectionIndex === -1) {
        return { success: false, error: `未找到标记: ${sectionMarker}` };
      }

      // 找到下一个同级或更高级标题的位置
      const sectionLevel = (sectionMarker.match(/^#+/) || [''])[0].length;
      let endIndex = lines.length;
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const match = lines[i].match(/^#+/);
        if (match && match[0].length <= sectionLevel) {
          endIndex = i;
          break;
        }
      }

      // 替换内容
      const before = lines.slice(0, sectionIndex + 1);
      const after = lines.slice(endIndex);
      const updated = [...before, '', newContent, '', ...after].join('\n');

      // 写入更新后的内容
      await fs.writeFile(fullPath, updated, 'utf-8');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `更新失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 回滚到备份
   */
  async rollback(backupPath: string, targetPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const fullTargetPath = path.join(this.kbBasePath, targetPath);
      await fs.copyFile(backupPath, fullTargetPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `回滚失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 列出所有备份
   */
  async listBackups(): Promise<string[]> {
    try {
      await this.ensureBackupDir();
      const files = await fs.readdir(this.backupDir);
      return files.filter(f => f.endsWith('.md')).sort().reverse();
    } catch (error) {
      return [];
    }
  }
}
