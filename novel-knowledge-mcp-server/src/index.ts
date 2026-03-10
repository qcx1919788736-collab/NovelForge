#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FileSystemService } from './services/filesystem.js';
import { KnowledgeBaseService } from './services/knowledge.js';
import { WriterService } from './services/writer.js';
import { ResponseFormat } from './constants.js';
import * as schemas from './schemas/index.js';

// 初始化服务
const fsService = new FileSystemService();
const kbService = new KnowledgeBaseService(fsService);
const writerService = new WriterService();

// 创建MCP服务器
const server = new McpServer({
  name: "novel-knowledge-mcp-server",
  version: "1.0.0"
});

// 工具1: 搜索知识库
server.registerTool(
  "novel_search_knowledge",
  {
    title: "搜索知识库",
    description: "在小说知识库中搜索人物、伏笔、世界观等内容。支持按类别筛选和关键词匹配。",
    inputSchema: schemas.SearchKnowledgeBaseSchema,
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

      if (response_format === ResponseFormat.JSON) {
        const output = { query, category, count: results.length, results };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }

      // Markdown格式
      let markdown = `# 搜索结果：${query}\n\n`;
      markdown += `类别：${category} | 找到 ${results.length} 条结果\n\n`;

      if (results.length === 0) {
        markdown += '未找到匹配结果。\n';
      } else {
        results.forEach((result, index) => {
          markdown += `## ${index + 1}. ${result.fileName}\n`;
          markdown += `**路径**: ${result.filePath}\n\n`;
          markdown += `**匹配内容**:\n\`\`\`\n${result.matchedContent}\n\`\`\`\n\n`;
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
          text: `搜索失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具2: 获取人物档案
server.registerTool(
  "novel_get_character",
  {
    title: "获取人物档案",
    description: "获取指定人物的完整档案，包括性格、能力、关系等信息。",
    inputSchema: schemas.GetCharacterSchema,
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

      if (response_format === ResponseFormat.JSON) {
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
          text: `获取人物档案失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具3: 列出所有人物
server.registerTool(
  "novel_list_characters",
  {
    title: "列出所有人物",
    description: "列出知识库中所有人物的名称和档案路径。",
    inputSchema: schemas.ListCharactersSchema,
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

      if (response_format === ResponseFormat.JSON) {
        const output = { count: characters.length, characters };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }

      let markdown = `# 人物列表\n\n共 ${characters.length} 个人物\n\n`;
      characters.forEach((char, index) => {
        markdown += `${index + 1}. **${char.name}** - ${char.filePath}\n`;
      });

      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `列出人物失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具4: 获取伏笔追踪
server.registerTool(
  "novel_get_plot_points",
  {
    title: "获取伏笔追踪",
    description: "获取伏笔追踪表，可按状态筛选（待揭示、部分揭示、已揭示）。",
    inputSchema: schemas.GetPlotPointsSchema,
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

      if (response_format === ResponseFormat.JSON) {
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
          text: `获取伏笔追踪失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具5: 获取当前状态
server.registerTool(
  "novel_get_current_state",
  {
    title: "获取当前状态",
    description: "获取故事当前状态，包括时间点、人物位置、待推进伏笔等。",
    inputSchema: schemas.GetCurrentStateSchema,
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

      if (response_format === ResponseFormat.JSON) {
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
          text: `获取当前状态失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具6: 列出章节文件
server.registerTool(
  "novel_list_chapter_files",
  {
    title: "列出章节文件",
    description: "列出工作区中的章节文件，可按章节编号筛选。显示文件名、阶段（章纲/初稿/修订稿/终版）等信息。",
    inputSchema: schemas.ListChapterFilesSchema,
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

      if (response_format === ResponseFormat.JSON) {
        const output = { count: files.length, files };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }

      let markdown = chapterNumber
        ? `# 第${chapterNumber}章文件列表\n\n`
        : `# 所有章节文件\n\n`;

      markdown += `共 ${files.length} 个文件\n\n`;

      files.forEach((file, index) => {
        markdown += `${index + 1}. **第${file.chapterNumber}章** - ${file.stage}`;
        if (file.version) markdown += ` v${file.version}`;
        markdown += `\n   文件: ${file.fileName}\n`;
      });

      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `列出章节文件失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具7: 一致性检查
server.registerTool(
  "novel_check_consistency",
  {
    title: "一致性检查",
    description: "检查指定章节的一致性问题，包括OOC（人物性格不一致）、数值错误、时间线错误、设定冲突等。",
    inputSchema: schemas.CheckConsistencySchema,
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

      if (response_format === ResponseFormat.JSON) {
        const output = { chapterNumber, checkTypes, issueCount: issues.length, issues };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }

      let markdown = `# 第${chapterNumber}章一致性检查\n\n`;
      markdown += `检查类型: ${checkTypes.join('、')}\n`;
      markdown += `发现 ${issues.length} 个潜在问题\n\n`;

      if (issues.length === 0) {
        markdown += '✓ 未发现明显问题\n';
      } else {
        issues.forEach((issue, index) => {
          markdown += `## ${index + 1}. ${issue.type} [${issue.severity}]\n`;
          markdown += `${issue.description}\n`;
          if (issue.suggestion) {
            markdown += `**建议**: ${issue.suggestion}\n`;
          }
          markdown += '\n';
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
          text: `一致性检查失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具8: 智能推荐资料
server.registerTool(
  "novel_recommend_resources",
  {
    title: "智能推荐资料",
    description: "根据章节大纲内容，智能推荐相关的人物档案、世界观设定、写作参考等资料。",
    inputSchema: schemas.RecommendResourcesSchema,
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

      if (response_format === ResponseFormat.JSON) {
        const output = { count: recommendations.length, recommendations };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }

      let markdown = `# 推荐资料\n\n`;
      markdown += `根据章纲内容，推荐以下 ${recommendations.length} 个资料：\n\n`;

      recommendations.forEach((rec, index) => {
        markdown += `${index + 1}. **${rec.fileName}**\n`;
        markdown += `   路径: ${rec.filePath}\n`;
        markdown += `   原因: ${rec.matchedContent}\n\n`;
      });

      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `推荐资料失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具9: 获取知识库统计
server.registerTool(
  "novel_get_kb_stats",
  {
    title: "获取知识库统计",
    description: "获取知识库的统计信息，包括文件总数、各类别文件数量等。",
    inputSchema: schemas.GetKnowledgeBaseStatsSchema,
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

      if (response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
          structuredContent: stats
        };
      }

      let markdown = `# 知识库统计\n\n`;
      markdown += `- 总文件数: ${stats.totalFiles}\n`;
      markdown += `- 核心上下文: ${stats.coreContextFiles} 个文件\n`;
      markdown += `- 人物档案: ${stats.characterFiles} 个文件\n`;
      markdown += `- 世界观设定: ${stats.worldviewFiles} 个文件\n`;

      return {
        content: [{ type: "text", text: markdown }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `获取统计信息失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具10: 读取文件
server.registerTool(
  "novel_read_file",
  {
    title: "读取文件",
    description: "读取知识库中指定文件的完整内容。",
    inputSchema: schemas.ReadFileSchema,
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

      if (response_format === ResponseFormat.JSON) {
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
          text: `读取文件失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// ========== 写入工具 ==========

// 工具11: 写入文件（覆盖）
server.registerTool(
  "novel_write_file",
  {
    title: "写入文件",
    description: "写入内容到知识库文件（覆盖原内容）。会自动备份原文件。",
    inputSchema: schemas.WriteFileSchema,
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
            text: `写入失败: ${result.error}`
          }]
        };
      }

      let response = `✓ 成功写入文件: ${filePath}\n`;
      response += `原因: ${reason}\n`;
      if (result.backupPath) {
        response += `备份路径: ${result.backupPath}\n`;
      }

      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `写入失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具12: 追加内容到文件
server.registerTool(
  "novel_append_to_file",
  {
    title: "追加内容到文件",
    description: "追加内容到知识库文件末尾。会自动备份原文件。",
    inputSchema: schemas.AppendToFileSchema,
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
            text: `追加失败: ${result.error}`
          }]
        };
      }

      let response = `✓ 成功追加内容到文件: ${filePath}\n`;
      response += `原因: ${reason}\n`;

      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `追加失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具13: 更新文件中的特定部分
server.registerTool(
  "novel_update_section",
  {
    title: "更新文件部分内容",
    description: "更新知识库文件中的特定部分（基于Markdown标题标记）。会自动备份原文件。",
    inputSchema: schemas.UpdateSectionSchema,
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
            text: `更新失败: ${result.error}`
          }]
        };
      }

      let response = `✓ 成功更新文件部分: ${filePath}\n`;
      response += `部分标记: ${sectionMarker}\n`;
      response += `原因: ${reason}\n`;

      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `更新失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 工具14: 列出备份文件
server.registerTool(
  "novel_list_backups",
  {
    title: "列出备份文件",
    description: "列出所有知识库文件的备份。",
    inputSchema: schemas.ListBackupsSchema,
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

      if (response_format === ResponseFormat.JSON) {
        const output = { count: backups.length, backups };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }

      let markdown = `# 备份文件列表\n\n`;
      markdown += `共 ${backups.length} 个备份\n\n`;

      if (backups.length === 0) {
        markdown += '暂无备份文件\n';
      } else {
        backups.forEach((backup, index) => {
          markdown += `${index + 1}. ${backup}\n`;
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
          text: `列出备份失败: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Novel Knowledge MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
