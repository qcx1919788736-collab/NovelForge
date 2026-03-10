#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/services/filesystem.ts
import * as fs from "fs/promises";
import * as path from "path";

// src/constants.ts
var KNOWLEDGE_BASE_PATH = "../\u77E5\u8BC6\u5E93";
var WORK_DIR_PATH = "../\u5DE5\u4F5C\u533A";
var KB_DIRS = {
  CORE_CONTEXT: "00_\u6838\u5FC3\u4E0A\u4E0B\u6587",
  CHARACTERS: "01_\u4EBA\u7269\u6863\u6848",
  WORLDVIEW: "02_\u4E16\u754C\u89C2\u8BBE\u5B9A",
  STORY_PROGRESS: "03_\u6545\u4E8B\u8FDB\u5C55",
  WRITING_REFERENCE: "04_\u5199\u4F5C\u53C2\u8003"
};
var ResponseFormat = /* @__PURE__ */ ((ResponseFormat2) => {
  ResponseFormat2["JSON"] = "json";
  ResponseFormat2["MARKDOWN"] = "markdown";
  return ResponseFormat2;
})(ResponseFormat || {});

// src/services/filesystem.ts
var FileSystemService = class {
  kbBasePath;
  workDirPath;
  constructor() {
    this.kbBasePath = path.resolve(process.cwd(), KNOWLEDGE_BASE_PATH);
    this.workDirPath = path.resolve(process.cwd(), WORK_DIR_PATH);
  }
  /**
   * 读取文件内容
   */
  async readFile(relativePath) {
    const fullPath = path.join(this.kbBasePath, relativePath);
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`\u65E0\u6CD5\u8BFB\u53D6\u6587\u4EF6 ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * 检查文件是否存在
   */
  async fileExists(relativePath) {
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
  async listFiles(relativePath) {
    const fullPath = path.join(this.kbBasePath, relativePath);
    try {
      const files = await fs.readdir(fullPath);
      return files.filter((f) => f.endsWith(".md"));
    } catch (error) {
      throw new Error(`\u65E0\u6CD5\u5217\u51FA\u76EE\u5F55 ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * 搜索文件内容
   */
  async searchInFiles(query, directory) {
    const results = [];
    const fullPath = path.join(this.kbBasePath, directory);
    try {
      const files = await this.listFiles(directory);
      for (const file of files) {
        const filePath = path.join(directory, file);
        const content = await this.readFile(filePath);
        if (content.toLowerCase().includes(query.toLowerCase())) {
          const lines = content.split("\n");
          const matchedLines = lines.filter(
            (line) => line.toLowerCase().includes(query.toLowerCase())
          );
          results.push({
            filePath,
            fileName: file,
            matchedContent: matchedLines.slice(0, 3).join("\n")
          });
        }
      }
    } catch (error) {
    }
    return results;
  }
  /**
   * 递归搜索所有子目录
   */
  async searchAllFiles(query) {
    const results = [];
    for (const dir of Object.values(KB_DIRS)) {
      const dirResults = await this.searchInFiles(query, dir);
      results.push(...dirResults);
    }
    return results;
  }
  /**
   * 获取所有人物档案
   */
  async listCharacters() {
    const characters = [];
    const files = await this.listFiles(KB_DIRS.CHARACTERS);
    for (const file of files) {
      const name = file.replace("_\u5B8C\u6574\u6863\u6848.md", "");
      const filePath = path.join(KB_DIRS.CHARACTERS, file);
      characters.push({
        name,
        personality: "",
        currentStatus: "",
        filePath
      });
    }
    return characters;
  }
  /**
   * 获取工作区章节文件
   */
  async listChapterFiles(chapterNumber) {
    const files = [];
    try {
      const allFiles = await fs.readdir(this.workDirPath);
      const mdFiles = allFiles.filter((f) => f.endsWith(".md") && f !== "README.md");
      for (const file of mdFiles) {
        const match = file.match(/^第(\d+)章_(.+)\.md$/);
        if (match) {
          const num = parseInt(match[1]);
          const stagePart = match[2];
          if (chapterNumber && num !== chapterNumber) {
            continue;
          }
          let stage = "\u521D\u7A3F";
          let version;
          if (stagePart.includes("\u7AE0\u7EB2\u8349\u6848")) {
            stage = "\u7AE0\u7EB2\u8349\u6848";
          } else if (stagePart.includes("\u9009\u5B9A\u7AE0\u7EB2")) {
            stage = "\u9009\u5B9A\u7AE0\u7EB2";
          } else if (stagePart.includes("\u521D\u7A3F")) {
            stage = "\u521D\u7A3F";
          } else if (stagePart.includes("\u4FEE\u8BA2\u7A3F")) {
            stage = "\u4FEE\u8BA2\u7A3F";
            const vMatch = stagePart.match(/v(\d+)/);
            if (vMatch) version = vMatch[1];
          } else if (stagePart.includes("\u7EC8\u7248")) {
            stage = "\u7EC8\u7248";
          }
          files.push({
            chapterNumber: num,
            fileName: file,
            filePath: path.join("\u5DE5\u4F5C\u533A", file),
            stage,
            version
          });
        }
      }
    } catch (error) {
      throw new Error(`\u65E0\u6CD5\u5217\u51FA\u5DE5\u4F5C\u533A\u6587\u4EF6: ${error instanceof Error ? error.message : String(error)}`);
    }
    return files.sort((a, b) => a.chapterNumber - b.chapterNumber);
  }
  /**
   * 获取知识库统计信息
   */
  async getStats() {
    const stats = {
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
    }
    return stats;
  }
};

// src/services/knowledge.ts
var KnowledgeBaseService = class {
  fs;
  constructor(fsService2) {
    this.fs = fsService2;
  }
  /**
   * 智能搜索知识库
   */
  async search(query, category, limit) {
    let results = [];
    if (category === "all") {
      results = await this.fs.searchAllFiles(query);
    } else {
      const dirMap = {
        "characters": KB_DIRS.CHARACTERS,
        "worldview": KB_DIRS.WORLDVIEW,
        "plot": KB_DIRS.STORY_PROGRESS,
        "writing_reference": KB_DIRS.WRITING_REFERENCE
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
  async getCharacter(name) {
    const fileName = `${name}_\u5B8C\u6574\u6863\u6848.md`;
    const filePath = `${KB_DIRS.CHARACTERS}/${fileName}`;
    const exists = await this.fs.fileExists(filePath);
    if (!exists) {
      throw new Error(`\u672A\u627E\u5230\u4EBA\u7269"${name}"\u7684\u6863\u6848\u3002\u53EF\u7528\u4EBA\u7269\uFF1A\u79E6\u529B\u3001\u8D75\u660E\u3001\u53D1\u6797\u3001\u674E\u57A3\u3001\u5F20\u5764\u3001\u6C5F\u96EA\u3001\u5F20\u5F1B`);
    }
    return await this.fs.readFile(filePath);
  }
  /**
   * 获取伏笔追踪
   */
  async getPlotPoints(status) {
    const content = await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/\u4F0F\u7B14\u8FFD\u8E2A\u8868_\u5B8C\u6574\u7248.md`);
    if (status === "all") {
      return content;
    }
    const lines = content.split("\n");
    const filtered = lines.filter(
      (line) => line.includes(status) || line.startsWith("#")
    );
    return filtered.join("\n");
  }
  /**
   * 获取当前状态
   */
  async getCurrentState() {
    return await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/\u5F53\u524D\u72B6\u6001.md`);
  }
  /**
   * 一致性检查
   */
  async checkConsistency(chapterNumber, checkTypes) {
    const issues = [];
    try {
      const chapterFiles = await this.fs.listChapterFiles(chapterNumber);
      if (chapterFiles.length === 0) {
        throw new Error(`\u672A\u627E\u5230\u7B2C${chapterNumber}\u7AE0\u7684\u6587\u4EF6`);
      }
      const latestFile = chapterFiles[chapterFiles.length - 1];
      const chapterContent = await this.fs.readFile(latestFile.filePath);
      const numValues = await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/\u6570\u503C\u901F\u67E5\u8868.md`);
      const styleRules = await this.fs.readFile(`${KB_DIRS.CORE_CONTEXT}/\u6587\u98CE\u89C4\u5219_\u5B8C\u6574\u7248.md`);
      if (checkTypes.includes("OOC")) {
        const characters = await this.fs.listCharacters();
        for (const char of characters) {
          if (chapterContent.includes(char.name)) {
            issues.push({
              type: "OOC",
              severity: "low",
              description: `\u7AE0\u8282\u4E2D\u51FA\u73B0\u4EBA\u7269"${char.name}"\uFF0C\u5EFA\u8BAE\u5BF9\u7167\u4EBA\u7269\u6863\u6848\u68C0\u67E5\u6027\u683C\u4E00\u81F4\u6027`,
              suggestion: `\u67E5\u770B ${char.filePath}`
            });
          }
        }
      }
      if (checkTypes.includes("\u6570\u503C\u9519\u8BEF")) {
        const numberMatches = chapterContent.match(/\d+(\.\d+)?/g);
        if (numberMatches && numberMatches.length > 0) {
          issues.push({
            type: "\u6570\u503C\u9519\u8BEF",
            severity: "medium",
            description: `\u7AE0\u8282\u4E2D\u5305\u542B${numberMatches.length}\u4E2A\u6570\u503C\uFF0C\u5EFA\u8BAE\u5BF9\u7167\u6570\u503C\u901F\u67E5\u8868\u68C0\u67E5`,
            suggestion: "\u67E5\u770B \u77E5\u8BC6\u5E93/00_\u6838\u5FC3\u4E0A\u4E0B\u6587/\u6570\u503C\u901F\u67E5\u8868.md"
          });
        }
      }
      if (checkTypes.includes("\u65F6\u95F4\u7EBF\u9519\u8BEF")) {
        const timeKeywords = ["\u5927\u5E74", "\u814A\u6708", "\u521D\u4E00", "\u521D\u4E8C", "\u521D\u4E09", "\u521D\u56DB", "\u521D\u4E94"];
        const foundTimes = timeKeywords.filter((kw) => chapterContent.includes(kw));
        if (foundTimes.length > 0) {
          issues.push({
            type: "\u65F6\u95F4\u7EBF\u9519\u8BEF",
            severity: "high",
            description: `\u7AE0\u8282\u4E2D\u63D0\u5230\u65F6\u95F4\uFF1A${foundTimes.join("\u3001")}\uFF0C\u5EFA\u8BAE\u68C0\u67E5\u65F6\u95F4\u7EBF\u4E00\u81F4\u6027`,
            suggestion: "\u67E5\u770B \u77E5\u8BC6\u5E93/03_\u6545\u4E8B\u8FDB\u5C55/\u65F6\u95F4\u7EBF_\u5B8C\u6574\u7248.md"
          });
        }
      }
      if (checkTypes.includes("\u8BBE\u5B9A\u51B2\u7A81")) {
        const settingKeywords = ["\u7126\u7075\u7EFC\u5408\u5F81", "\u80FD\u529B", "\u653F\u7B56", "\u5168\u7403"];
        const foundSettings = settingKeywords.filter((kw) => chapterContent.includes(kw));
        if (foundSettings.length > 0) {
          issues.push({
            type: "\u8BBE\u5B9A\u51B2\u7A81",
            severity: "medium",
            description: `\u7AE0\u8282\u4E2D\u6D89\u53CA\u8BBE\u5B9A\uFF1A${foundSettings.join("\u3001")}\uFF0C\u5EFA\u8BAE\u68C0\u67E5\u4E16\u754C\u89C2\u4E00\u81F4\u6027`,
            suggestion: "\u67E5\u770B \u77E5\u8BC6\u5E93/02_\u4E16\u754C\u89C2\u8BBE\u5B9A/"
          });
        }
      }
    } catch (error) {
      throw new Error(`\u4E00\u81F4\u6027\u68C0\u67E5\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
    }
    return issues;
  }
  /**
   * 智能推荐资料
   */
  async recommendResources(chapterOutline, limit) {
    const recommendations = [];
    const characters = ["\u79E6\u529B", "\u8D75\u660E", "\u53D1\u6797", "\u674E\u57A3", "\u5F20\u5764", "\u6C5F\u96EA", "\u5F20\u5F1B"];
    const keywords = ["\u80FD\u529B", "\u6D4B\u8BD5", "\u6218\u6597", "\u4EB2\u60C5", "\u56DE\u5FC6", "\u4F0F\u7B14"];
    for (const char of characters) {
      if (chapterOutline.includes(char)) {
        recommendations.push({
          filePath: `${KB_DIRS.CHARACTERS}/${char}_\u5B8C\u6574\u6863\u6848.md`,
          fileName: `${char}_\u5B8C\u6574\u6863\u6848.md`,
          matchedContent: `\u7AE0\u7EB2\u4E2D\u63D0\u5230\u4EBA\u7269"${char}"\uFF0C\u63A8\u8350\u9605\u8BFB\u5B8C\u6574\u6863\u6848`
        });
      }
    }
    if (chapterOutline.includes("\u80FD\u529B") || chapterOutline.includes("\u7126\u7075")) {
      recommendations.push({
        filePath: `${KB_DIRS.WORLDVIEW}/\u7126\u7075\u7EFC\u5408\u5F81\u673A\u5236_\u5B8C\u6574\u7248.md`,
        fileName: "\u7126\u7075\u7EFC\u5408\u5F81\u673A\u5236_\u5B8C\u6574\u7248.md",
        matchedContent: "\u7AE0\u7EB2\u6D89\u53CA\u80FD\u529B\u673A\u5236\uFF0C\u63A8\u8350\u9605\u8BFB\u4E16\u754C\u89C2\u8BBE\u5B9A"
      });
    }
    if (chapterOutline.includes("\u6218\u6597") || chapterOutline.includes("\u6253\u6597")) {
      recommendations.push({
        filePath: `${KB_DIRS.WRITING_REFERENCE}/\u573A\u666F\u8303\u4F8B_\u6218\u6597.md`,
        fileName: "\u573A\u666F\u8303\u4F8B_\u6218\u6597.md",
        matchedContent: "\u7AE0\u7EB2\u5305\u542B\u6218\u6597\u573A\u666F\uFF0C\u63A8\u8350\u53C2\u8003\u6218\u6597\u8303\u4F8B"
      });
    }
    if (chapterOutline.includes("\u4EB2\u60C5") || chapterOutline.includes("\u5BB6\u4EBA")) {
      recommendations.push({
        filePath: `${KB_DIRS.WRITING_REFERENCE}/\u573A\u666F\u8303\u4F8B_\u4EB2\u60C5.md`,
        fileName: "\u573A\u666F\u8303\u4F8B_\u4EB2\u60C5.md",
        matchedContent: "\u7AE0\u7EB2\u5305\u542B\u4EB2\u60C5\u573A\u666F\uFF0C\u63A8\u8350\u53C2\u8003\u4EB2\u60C5\u8303\u4F8B"
      });
    }
    recommendations.push({
      filePath: `${KB_DIRS.CORE_CONTEXT}/\u5F53\u524D\u72B6\u6001.md`,
      fileName: "\u5F53\u524D\u72B6\u6001.md",
      matchedContent: "\u63A8\u8350\u67E5\u770B\u5F53\u524D\u6545\u4E8B\u72B6\u6001"
    });
    recommendations.push({
      filePath: `${KB_DIRS.CORE_CONTEXT}/\u4F0F\u7B14\u8FFD\u8E2A\u8868_\u5B8C\u6574\u7248.md`,
      fileName: "\u4F0F\u7B14\u8FFD\u8E2A\u8868_\u5B8C\u6574\u7248.md",
      matchedContent: "\u63A8\u8350\u67E5\u770B\u5F85\u63A8\u8FDB\u4F0F\u7B14"
    });
    return recommendations.slice(0, limit);
  }
};

// src/services/writer.ts
import * as fs2 from "fs/promises";
import * as path2 from "path";
var WriterService = class {
  kbBasePath;
  backupDir;
  constructor() {
    this.kbBasePath = path2.resolve(process.cwd(), KNOWLEDGE_BASE_PATH);
    this.backupDir = path2.resolve(process.cwd(), ".kb-backups");
  }
  /**
   * 初始化备份目录
   */
  async ensureBackupDir() {
    try {
      await fs2.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      throw new Error(`\u65E0\u6CD5\u521B\u5EFA\u5907\u4EFD\u76EE\u5F55: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * 备份文件
   */
  async backupFile(relativePath) {
    await this.ensureBackupDir();
    const sourcePath = path2.join(this.kbBasePath, relativePath);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFileName = `${path2.basename(relativePath, ".md")}_${timestamp}.md`;
    const backupPath = path2.join(this.backupDir, backupFileName);
    try {
      await fs2.access(sourcePath);
      await fs2.copyFile(sourcePath, backupPath);
      return backupPath;
    } catch (error) {
      return "";
    }
  }
  /**
   * 验证文件内容格式
   */
  validateContent(content, relativePath) {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: "\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A" };
    }
    if (!relativePath.endsWith(".md")) {
      return { valid: false, error: "\u53EA\u652F\u6301 Markdown \u6587\u4EF6" };
    }
    const fullPath = path2.join(this.kbBasePath, relativePath);
    if (!fullPath.startsWith(this.kbBasePath)) {
      return { valid: false, error: "\u8DEF\u5F84\u5FC5\u987B\u5728\u77E5\u8BC6\u5E93\u8303\u56F4\u5185" };
    }
    return { valid: true };
  }
  /**
   * 写入文件（覆盖）
   */
  async writeFile(relativePath, content) {
    const validation = this.validateContent(content, relativePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const fullPath = path2.join(this.kbBasePath, relativePath);
    try {
      const backupPath = await this.backupFile(relativePath);
      await fs2.mkdir(path2.dirname(fullPath), { recursive: true });
      await fs2.writeFile(fullPath, content, "utf-8");
      return { success: true, backupPath: backupPath || void 0 };
    } catch (error) {
      return {
        success: false,
        error: `\u5199\u5165\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  /**
   * 追加内容到文件
   */
  async appendToFile(relativePath, content) {
    const validation = this.validateContent(content, relativePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const fullPath = path2.join(this.kbBasePath, relativePath);
    try {
      await this.backupFile(relativePath);
      await fs2.appendFile(fullPath, "\n" + content, "utf-8");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `\u8FFD\u52A0\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  /**
   * 更新文件中的特定部分（基于标记）
   */
  async updateSection(relativePath, sectionMarker, newContent) {
    const fullPath = path2.join(this.kbBasePath, relativePath);
    try {
      await this.backupFile(relativePath);
      const originalContent = await fs2.readFile(fullPath, "utf-8");
      const lines = originalContent.split("\n");
      const sectionIndex = lines.findIndex((line) => line.trim() === sectionMarker);
      if (sectionIndex === -1) {
        return { success: false, error: `\u672A\u627E\u5230\u6807\u8BB0: ${sectionMarker}` };
      }
      const sectionLevel = (sectionMarker.match(/^#+/) || [""])[0].length;
      let endIndex = lines.length;
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const match = lines[i].match(/^#+/);
        if (match && match[0].length <= sectionLevel) {
          endIndex = i;
          break;
        }
      }
      const before = lines.slice(0, sectionIndex + 1);
      const after = lines.slice(endIndex);
      const updated = [...before, "", newContent, "", ...after].join("\n");
      await fs2.writeFile(fullPath, updated, "utf-8");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `\u66F4\u65B0\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  /**
   * 回滚到备份
   */
  async rollback(backupPath, targetPath) {
    try {
      const fullTargetPath = path2.join(this.kbBasePath, targetPath);
      await fs2.copyFile(backupPath, fullTargetPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `\u56DE\u6EDA\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  /**
   * 列出所有备份
   */
  async listBackups() {
    try {
      await this.ensureBackupDir();
      const files = await fs2.readdir(this.backupDir);
      return files.filter((f) => f.endsWith(".md")).sort().reverse();
    } catch (error) {
      return [];
    }
  }
};

// src/schemas/index.ts
import { z } from "zod";
var SearchKnowledgeBaseSchema = z.object({
  query: z.string().min(1, "\u67E5\u8BE2\u5B57\u7B26\u4E32\u4E0D\u80FD\u4E3A\u7A7A").describe("\u641C\u7D22\u5173\u952E\u8BCD\uFF08\u652F\u6301\u4EBA\u7269\u540D\u3001\u4F0F\u7B14\u3001\u8BBE\u5B9A\u7B49\uFF09"),
  category: z.enum(["all", "characters", "worldview", "plot", "writing_reference"]).default("all").describe("\u641C\u7D22\u7C7B\u522B\uFF1Aall=\u5168\u90E8, characters=\u4EBA\u7269, worldview=\u4E16\u754C\u89C2, plot=\u4F0F\u7B14\u6545\u4E8B, writing_reference=\u5199\u4F5C\u53C2\u8003"),
  limit: z.number().int().min(1).max(50).default(10).describe("\u8FD4\u56DE\u7ED3\u679C\u6570\u91CF\u9650\u5236"),
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var GetCharacterSchema = z.object({
  name: z.string().min(1, "\u4EBA\u7269\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A").describe("\u4EBA\u7269\u540D\u79F0\uFF08\u5982\uFF1A\u79E6\u529B\u3001\u8D75\u660E\u3001\u53D1\u6797\u7B49\uFF09"),
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var ListCharactersSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var GetPlotPointsSchema = z.object({
  status: z.enum(["all", "\u5F85\u63ED\u793A", "\u90E8\u5206\u63ED\u793A", "\u5DF2\u63ED\u793A"]).default("all").describe("\u4F0F\u7B14\u72B6\u6001\u7B5B\u9009"),
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var GetCurrentStateSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var ListChapterFilesSchema = z.object({
  chapterNumber: z.number().int().min(1).optional().describe("\u7AE0\u8282\u7F16\u53F7\uFF08\u53EF\u9009\uFF0C\u4E0D\u63D0\u4F9B\u5219\u5217\u51FA\u6240\u6709\u7AE0\u8282\uFF09"),
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var CheckConsistencySchema = z.object({
  chapterNumber: z.number().int().min(1).describe("\u8981\u68C0\u67E5\u7684\u7AE0\u8282\u7F16\u53F7"),
  checkTypes: z.array(z.enum(["OOC", "\u6570\u503C\u9519\u8BEF", "\u65F6\u95F4\u7EBF\u9519\u8BEF", "\u8BBE\u5B9A\u51B2\u7A81"])).default(["OOC", "\u6570\u503C\u9519\u8BEF", "\u65F6\u95F4\u7EBF\u9519\u8BEF", "\u8BBE\u5B9A\u51B2\u7A81"]).describe("\u68C0\u67E5\u7C7B\u578B\u5217\u8868"),
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var RecommendResourcesSchema = z.object({
  chapterOutline: z.string().min(10, "\u7AE0\u7EB2\u5185\u5BB9\u81F3\u5C1110\u4E2A\u5B57\u7B26").describe("\u7AE0\u8282\u5927\u7EB2\u5185\u5BB9"),
  limit: z.number().int().min(1).max(20).default(5).describe("\u63A8\u8350\u8D44\u6599\u6570\u91CF"),
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var GetKnowledgeBaseStatsSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var ReadFileSchema = z.object({
  filePath: z.string().min(1, "\u6587\u4EF6\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A").describe("\u76F8\u5BF9\u4E8E\u77E5\u8BC6\u5E93\u6839\u76EE\u5F55\u7684\u6587\u4EF6\u8DEF\u5F84"),
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});
var WriteFileSchema = z.object({
  filePath: z.string().min(1, "\u6587\u4EF6\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A").describe("\u76F8\u5BF9\u4E8E\u77E5\u8BC6\u5E93\u6839\u76EE\u5F55\u7684\u6587\u4EF6\u8DEF\u5F84\uFF08\u5982\uFF1A00_\u6838\u5FC3\u4E0A\u4E0B\u6587/\u5F53\u524D\u72B6\u6001.md\uFF09"),
  content: z.string().min(1, "\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A").describe("\u8981\u5199\u5165\u7684\u5B8C\u6574\u5185\u5BB9\uFF08Markdown\u683C\u5F0F\uFF09"),
  reason: z.string().min(5, "\u539F\u56E0\u8BF4\u660E\u81F3\u5C115\u4E2A\u5B57\u7B26").describe("\u5199\u5165\u539F\u56E0\u8BF4\u660E\uFF08\u7528\u4E8E\u65E5\u5FD7\u8BB0\u5F55\uFF09")
});
var AppendToFileSchema = z.object({
  filePath: z.string().min(1, "\u6587\u4EF6\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A").describe("\u76F8\u5BF9\u4E8E\u77E5\u8BC6\u5E93\u6839\u76EE\u5F55\u7684\u6587\u4EF6\u8DEF\u5F84"),
  content: z.string().min(1, "\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A").describe("\u8981\u8FFD\u52A0\u7684\u5185\u5BB9\uFF08Markdown\u683C\u5F0F\uFF09"),
  reason: z.string().min(5, "\u539F\u56E0\u8BF4\u660E\u81F3\u5C115\u4E2A\u5B57\u7B26").describe("\u8FFD\u52A0\u539F\u56E0\u8BF4\u660E\uFF08\u7528\u4E8E\u65E5\u5FD7\u8BB0\u5F55\uFF09")
});
var UpdateSectionSchema = z.object({
  filePath: z.string().min(1, "\u6587\u4EF6\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A").describe("\u76F8\u5BF9\u4E8E\u77E5\u8BC6\u5E93\u6839\u76EE\u5F55\u7684\u6587\u4EF6\u8DEF\u5F84"),
  sectionMarker: z.string().min(1, "\u90E8\u5206\u6807\u8BB0\u4E0D\u80FD\u4E3A\u7A7A").describe("\u8981\u66F4\u65B0\u7684\u90E8\u5206\u6807\u8BB0\uFF08Markdown\u6807\u9898\uFF0C\u5982\uFF1A## \u5F53\u524D\u72B6\u6001\uFF09"),
  newContent: z.string().min(1, "\u65B0\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A").describe("\u65B0\u7684\u5185\u5BB9\uFF08Markdown\u683C\u5F0F\uFF09"),
  reason: z.string().min(5, "\u539F\u56E0\u8BF4\u660E\u81F3\u5C115\u4E2A\u5B57\u7B26").describe("\u66F4\u65B0\u539F\u56E0\u8BF4\u660E\uFF08\u7528\u4E8E\u65E5\u5FD7\u8BB0\u5F55\uFF09")
});
var ListBackupsSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat).default("markdown" /* MARKDOWN */).describe("\u54CD\u5E94\u683C\u5F0F\uFF1Ajson\u6216markdown")
});

// src/index.ts
var fsService = new FileSystemService();
var kbService = new KnowledgeBaseService(fsService);
var writerService = new WriterService();
var server = new McpServer({
  name: "novel-knowledge-mcp-server",
  version: "1.0.0"
});
server.registerTool(
  "novel_search_knowledge",
  {
    title: "\u641C\u7D22\u77E5\u8BC6\u5E93",
    description: "\u5728\u5C0F\u8BF4\u77E5\u8BC6\u5E93\u4E2D\u641C\u7D22\u4EBA\u7269\u3001\u4F0F\u7B14\u3001\u4E16\u754C\u89C2\u7B49\u5185\u5BB9\u3002\u652F\u6301\u6309\u7C7B\u522B\u7B5B\u9009\u548C\u5173\u952E\u8BCD\u5339\u914D\u3002",
    inputSchema: SearchKnowledgeBaseSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ query, category, limit, response_format }) => {
    try {
      const results = await kbService.search(query, category, limit);
      if (response_format === "json" /* JSON */) {
        const output = { query, category, count: results.length, results };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      let markdown = `# \u641C\u7D22\u7ED3\u679C\uFF1A${query}

`;
      markdown += `\u7C7B\u522B\uFF1A${category} | \u627E\u5230 ${results.length} \u6761\u7ED3\u679C

`;
      if (results.length === 0) {
        markdown += "\u672A\u627E\u5230\u5339\u914D\u7ED3\u679C\u3002\n";
      } else {
        results.forEach((result, index) => {
          markdown += `## ${index + 1}. ${result.fileName}
`;
          markdown += `**\u8DEF\u5F84**: ${result.filePath}

`;
          markdown += `**\u5339\u914D\u5185\u5BB9**:
\`\`\`
${result.matchedContent}
\`\`\`

`;
        });
      }
      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u641C\u7D22\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_get_character",
  {
    title: "\u83B7\u53D6\u4EBA\u7269\u6863\u6848",
    description: "\u83B7\u53D6\u6307\u5B9A\u4EBA\u7269\u7684\u5B8C\u6574\u6863\u6848\uFF0C\u5305\u62EC\u6027\u683C\u3001\u80FD\u529B\u3001\u5173\u7CFB\u7B49\u4FE1\u606F\u3002",
    inputSchema: GetCharacterSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ name, response_format }) => {
    try {
      const content = await kbService.getCharacter(name);
      if (response_format === "json" /* JSON */) {
        const output = { name, content };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u83B7\u53D6\u4EBA\u7269\u6863\u6848\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_list_characters",
  {
    title: "\u5217\u51FA\u6240\u6709\u4EBA\u7269",
    description: "\u5217\u51FA\u77E5\u8BC6\u5E93\u4E2D\u6240\u6709\u4EBA\u7269\u7684\u540D\u79F0\u548C\u6863\u6848\u8DEF\u5F84\u3002",
    inputSchema: ListCharactersSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ response_format }) => {
    try {
      const characters = await fsService.listCharacters();
      if (response_format === "json" /* JSON */) {
        const output = { count: characters.length, characters };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      let markdown = `# \u4EBA\u7269\u5217\u8868

\u5171 ${characters.length} \u4E2A\u4EBA\u7269

`;
      characters.forEach((char, index) => {
        markdown += `${index + 1}. **${char.name}** - ${char.filePath}
`;
      });
      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u5217\u51FA\u4EBA\u7269\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_get_plot_points",
  {
    title: "\u83B7\u53D6\u4F0F\u7B14\u8FFD\u8E2A",
    description: "\u83B7\u53D6\u4F0F\u7B14\u8FFD\u8E2A\u8868\uFF0C\u53EF\u6309\u72B6\u6001\u7B5B\u9009\uFF08\u5F85\u63ED\u793A\u3001\u90E8\u5206\u63ED\u793A\u3001\u5DF2\u63ED\u793A\uFF09\u3002",
    inputSchema: GetPlotPointsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ status, response_format }) => {
    try {
      const content = await kbService.getPlotPoints(status);
      if (response_format === "json" /* JSON */) {
        const output = { status, content };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u83B7\u53D6\u4F0F\u7B14\u8FFD\u8E2A\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_get_current_state",
  {
    title: "\u83B7\u53D6\u5F53\u524D\u72B6\u6001",
    description: "\u83B7\u53D6\u6545\u4E8B\u5F53\u524D\u72B6\u6001\uFF0C\u5305\u62EC\u65F6\u95F4\u70B9\u3001\u4EBA\u7269\u4F4D\u7F6E\u3001\u5F85\u63A8\u8FDB\u4F0F\u7B14\u7B49\u3002",
    inputSchema: GetCurrentStateSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ response_format }) => {
    try {
      const content = await kbService.getCurrentState();
      if (response_format === "json" /* JSON */) {
        const output = { content };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u83B7\u53D6\u5F53\u524D\u72B6\u6001\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_list_chapter_files",
  {
    title: "\u5217\u51FA\u7AE0\u8282\u6587\u4EF6",
    description: "\u5217\u51FA\u5DE5\u4F5C\u533A\u4E2D\u7684\u7AE0\u8282\u6587\u4EF6\uFF0C\u53EF\u6309\u7AE0\u8282\u7F16\u53F7\u7B5B\u9009\u3002\u663E\u793A\u6587\u4EF6\u540D\u3001\u9636\u6BB5\uFF08\u7AE0\u7EB2/\u521D\u7A3F/\u4FEE\u8BA2\u7A3F/\u7EC8\u7248\uFF09\u7B49\u4FE1\u606F\u3002",
    inputSchema: ListChapterFilesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ chapterNumber, response_format }) => {
    try {
      const files = await fsService.listChapterFiles(chapterNumber);
      if (response_format === "json" /* JSON */) {
        const output = { count: files.length, files };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      let markdown = chapterNumber ? `# \u7B2C${chapterNumber}\u7AE0\u6587\u4EF6\u5217\u8868

` : `# \u6240\u6709\u7AE0\u8282\u6587\u4EF6

`;
      markdown += `\u5171 ${files.length} \u4E2A\u6587\u4EF6

`;
      files.forEach((file, index) => {
        markdown += `${index + 1}. **\u7B2C${file.chapterNumber}\u7AE0** - ${file.stage}`;
        if (file.version) markdown += ` v${file.version}`;
        markdown += `
   \u6587\u4EF6: ${file.fileName}
`;
      });
      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u5217\u51FA\u7AE0\u8282\u6587\u4EF6\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_check_consistency",
  {
    title: "\u4E00\u81F4\u6027\u68C0\u67E5",
    description: "\u68C0\u67E5\u6307\u5B9A\u7AE0\u8282\u7684\u4E00\u81F4\u6027\u95EE\u9898\uFF0C\u5305\u62ECOOC\uFF08\u4EBA\u7269\u6027\u683C\u4E0D\u4E00\u81F4\uFF09\u3001\u6570\u503C\u9519\u8BEF\u3001\u65F6\u95F4\u7EBF\u9519\u8BEF\u3001\u8BBE\u5B9A\u51B2\u7A81\u7B49\u3002",
    inputSchema: CheckConsistencySchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ chapterNumber, checkTypes, response_format }) => {
    try {
      const issues = await kbService.checkConsistency(chapterNumber, checkTypes);
      if (response_format === "json" /* JSON */) {
        const output = { chapterNumber, checkTypes, issueCount: issues.length, issues };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      let markdown = `# \u7B2C${chapterNumber}\u7AE0\u4E00\u81F4\u6027\u68C0\u67E5

`;
      markdown += `\u68C0\u67E5\u7C7B\u578B: ${checkTypes.join("\u3001")}
`;
      markdown += `\u53D1\u73B0 ${issues.length} \u4E2A\u6F5C\u5728\u95EE\u9898

`;
      if (issues.length === 0) {
        markdown += "\u2713 \u672A\u53D1\u73B0\u660E\u663E\u95EE\u9898\n";
      } else {
        issues.forEach((issue, index) => {
          markdown += `## ${index + 1}. ${issue.type} [${issue.severity}]
`;
          markdown += `${issue.description}
`;
          if (issue.suggestion) {
            markdown += `**\u5EFA\u8BAE**: ${issue.suggestion}
`;
          }
          markdown += "\n";
        });
      }
      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u4E00\u81F4\u6027\u68C0\u67E5\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_recommend_resources",
  {
    title: "\u667A\u80FD\u63A8\u8350\u8D44\u6599",
    description: "\u6839\u636E\u7AE0\u8282\u5927\u7EB2\u5185\u5BB9\uFF0C\u667A\u80FD\u63A8\u8350\u76F8\u5173\u7684\u4EBA\u7269\u6863\u6848\u3001\u4E16\u754C\u89C2\u8BBE\u5B9A\u3001\u5199\u4F5C\u53C2\u8003\u7B49\u8D44\u6599\u3002",
    inputSchema: RecommendResourcesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ chapterOutline, limit, response_format }) => {
    try {
      const recommendations = await kbService.recommendResources(chapterOutline, limit);
      if (response_format === "json" /* JSON */) {
        const output = { count: recommendations.length, recommendations };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      let markdown = `# \u63A8\u8350\u8D44\u6599

`;
      markdown += `\u6839\u636E\u7AE0\u7EB2\u5185\u5BB9\uFF0C\u63A8\u8350\u4EE5\u4E0B ${recommendations.length} \u4E2A\u8D44\u6599\uFF1A

`;
      recommendations.forEach((rec, index) => {
        markdown += `${index + 1}. **${rec.fileName}**
`;
        markdown += `   \u8DEF\u5F84: ${rec.filePath}
`;
        markdown += `   \u539F\u56E0: ${rec.matchedContent}

`;
      });
      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u63A8\u8350\u8D44\u6599\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_get_kb_stats",
  {
    title: "\u83B7\u53D6\u77E5\u8BC6\u5E93\u7EDF\u8BA1",
    description: "\u83B7\u53D6\u77E5\u8BC6\u5E93\u7684\u7EDF\u8BA1\u4FE1\u606F\uFF0C\u5305\u62EC\u6587\u4EF6\u603B\u6570\u3001\u5404\u7C7B\u522B\u6587\u4EF6\u6570\u91CF\u7B49\u3002",
    inputSchema: GetKnowledgeBaseStatsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ response_format }) => {
    try {
      const stats = await fsService.getStats();
      if (response_format === "json" /* JSON */) {
        return {
          content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
          structuredContent: stats
        };
      }
      let markdown = `# \u77E5\u8BC6\u5E93\u7EDF\u8BA1

`;
      markdown += `- \u603B\u6587\u4EF6\u6570: ${stats.totalFiles}
`;
      markdown += `- \u6838\u5FC3\u4E0A\u4E0B\u6587: ${stats.coreContextFiles} \u4E2A\u6587\u4EF6
`;
      markdown += `- \u4EBA\u7269\u6863\u6848: ${stats.characterFiles} \u4E2A\u6587\u4EF6
`;
      markdown += `- \u4E16\u754C\u89C2\u8BBE\u5B9A: ${stats.worldviewFiles} \u4E2A\u6587\u4EF6
`;
      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u83B7\u53D6\u7EDF\u8BA1\u4FE1\u606F\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_read_file",
  {
    title: "\u8BFB\u53D6\u6587\u4EF6",
    description: "\u8BFB\u53D6\u77E5\u8BC6\u5E93\u4E2D\u6307\u5B9A\u6587\u4EF6\u7684\u5B8C\u6574\u5185\u5BB9\u3002",
    inputSchema: ReadFileSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ filePath, response_format }) => {
    try {
      const content = await fsService.readFile(filePath);
      if (response_format === "json" /* JSON */) {
        const output = { filePath, content };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_write_file",
  {
    title: "\u5199\u5165\u6587\u4EF6",
    description: "\u5199\u5165\u5185\u5BB9\u5230\u77E5\u8BC6\u5E93\u6587\u4EF6\uFF08\u8986\u76D6\u539F\u5185\u5BB9\uFF09\u3002\u4F1A\u81EA\u52A8\u5907\u4EFD\u539F\u6587\u4EF6\u3002",
    inputSchema: WriteFileSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false
    }
  },
  async ({ filePath, content, reason }) => {
    try {
      const result = await writerService.writeFile(filePath, content);
      if (!result.success) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `\u5199\u5165\u5931\u8D25: ${result.error}`
          }]
        };
      }
      let response = `\u2713 \u6210\u529F\u5199\u5165\u6587\u4EF6: ${filePath}
`;
      response += `\u539F\u56E0: ${reason}
`;
      if (result.backupPath) {
        response += `\u5907\u4EFD\u8DEF\u5F84: ${result.backupPath}
`;
      }
      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u5199\u5165\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_append_to_file",
  {
    title: "\u8FFD\u52A0\u5185\u5BB9\u5230\u6587\u4EF6",
    description: "\u8FFD\u52A0\u5185\u5BB9\u5230\u77E5\u8BC6\u5E93\u6587\u4EF6\u672B\u5C3E\u3002\u4F1A\u81EA\u52A8\u5907\u4EFD\u539F\u6587\u4EF6\u3002",
    inputSchema: AppendToFileSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false
    }
  },
  async ({ filePath, content, reason }) => {
    try {
      const result = await writerService.appendToFile(filePath, content);
      if (!result.success) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `\u8FFD\u52A0\u5931\u8D25: ${result.error}`
          }]
        };
      }
      let response = `\u2713 \u6210\u529F\u8FFD\u52A0\u5185\u5BB9\u5230\u6587\u4EF6: ${filePath}
`;
      response += `\u539F\u56E0: ${reason}
`;
      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u8FFD\u52A0\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_update_section",
  {
    title: "\u66F4\u65B0\u6587\u4EF6\u90E8\u5206\u5185\u5BB9",
    description: "\u66F4\u65B0\u77E5\u8BC6\u5E93\u6587\u4EF6\u4E2D\u7684\u7279\u5B9A\u90E8\u5206\uFF08\u57FA\u4E8EMarkdown\u6807\u9898\u6807\u8BB0\uFF09\u3002\u4F1A\u81EA\u52A8\u5907\u4EFD\u539F\u6587\u4EF6\u3002",
    inputSchema: UpdateSectionSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false
    }
  },
  async ({ filePath, sectionMarker, newContent, reason }) => {
    try {
      const result = await writerService.updateSection(filePath, sectionMarker, newContent);
      if (!result.success) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `\u66F4\u65B0\u5931\u8D25: ${result.error}`
          }]
        };
      }
      let response = `\u2713 \u6210\u529F\u66F4\u65B0\u6587\u4EF6\u90E8\u5206: ${filePath}
`;
      response += `\u90E8\u5206\u6807\u8BB0: ${sectionMarker}
`;
      response += `\u539F\u56E0: ${reason}
`;
      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u66F4\u65B0\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
server.registerTool(
  "novel_list_backups",
  {
    title: "\u5217\u51FA\u5907\u4EFD\u6587\u4EF6",
    description: "\u5217\u51FA\u6240\u6709\u77E5\u8BC6\u5E93\u6587\u4EF6\u7684\u5907\u4EFD\u3002",
    inputSchema: ListBackupsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ response_format }) => {
    try {
      const backups = await writerService.listBackups();
      if (response_format === "json" /* JSON */) {
        const output = { count: backups.length, backups };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      let markdown = `# \u5907\u4EFD\u6587\u4EF6\u5217\u8868

`;
      markdown += `\u5171 ${backups.length} \u4E2A\u5907\u4EFD

`;
      if (backups.length === 0) {
        markdown += "\u6682\u65E0\u5907\u4EFD\u6587\u4EF6\n";
      } else {
        backups.forEach((backup, index) => {
          markdown += `${index + 1}. ${backup}
`;
        });
      }
      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `\u5217\u51FA\u5907\u4EFD\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Novel Knowledge MCP Server running on stdio");
}
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
