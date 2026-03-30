import { z } from 'zod';
import { ResponseFormat } from '../constants.js';

// 搜索知识库
export const SearchKnowledgeBaseSchema = z.object({
  query: z.string()
    .min(1, "查询字符串不能为空")
    .describe("搜索关键词（支持人物名、伏笔、设定等）"),
  category: z.enum(['all', 'characters', 'worldview', 'plot', 'writing_reference'])
    .default('all')
    .describe("搜索类别：all=全部, characters=人物, worldview=世界观, plot=伏笔故事, writing_reference=写作参考"),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("返回结果数量限制"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 获取人物档案
export const GetCharacterSchema = z.object({
  name: z.string()
    .min(1, "人物名称不能为空")
    .describe("人物名称（如：秦力、赵明、发林等）"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 列出所有人物
export const ListCharactersSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 获取伏笔追踪
export const GetPlotPointsSchema = z.object({
  status: z.enum(['all', '待揭示', '部分揭示', '已揭示'])
    .default('all')
    .describe("伏笔状态筛选"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 获取当前状态
export const GetCurrentStateSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 列出章节文件
export const ListChapterFilesSchema = z.object({
  chapterNumber: z.number()
    .int()
    .min(1)
    .optional()
    .describe("章节编号（可选，不提供则列出所有章节）"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 一致性检查
export const CheckConsistencySchema = z.object({
  chapterNumber: z.number()
    .int()
    .min(1)
    .describe("要检查的章节编号"),
  checkTypes: z.array(z.enum(['OOC', '数值错误', '时间线错误', '设定冲突']))
    .default(['OOC', '数值错误', '时间线错误', '设定冲突'])
    .describe("检查类型列表"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 智能推荐资料
export const RecommendResourcesSchema = z.object({
  chapterOutline: z.string()
    .min(10, "章纲内容至少10个字符")
    .describe("章节大纲内容"),
  limit: z.number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("推荐资料数量"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 获取知识库统计
export const GetKnowledgeBaseStatsSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// 读取文件内容
export const ReadFileSchema = z.object({
  filePath: z.string()
    .min(1, "文件路径不能为空")
    .describe("相对于知识库根目录的文件路径"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});

// ========== 写入工具 Schema ==========

// 写入文件（覆盖）
export const WriteFileSchema = z.object({
  filePath: z.string()
    .min(1, "文件路径不能为空")
    .describe("相对于知识库根目录的文件路径（如：00_核心上下文/当前状态.md）"),
  content: z.string()
    .min(1, "内容不能为空")
    .describe("要写入的完整内容（Markdown格式）"),
  reason: z.string()
    .min(5, "原因说明至少5个字符")
    .describe("写入原因说明（用于日志记录）")
});

// 追加内容到文件
export const AppendToFileSchema = z.object({
  filePath: z.string()
    .min(1, "文件路径不能为空")
    .describe("相对于知识库根目录的文件路径"),
  content: z.string()
    .min(1, "内容不能为空")
    .describe("要追加的内容（Markdown格式）"),
  reason: z.string()
    .min(5, "原因说明至少5个字符")
    .describe("追加原因说明（用于日志记录）")
});

// 更新文件中的特定部分
export const UpdateSectionSchema = z.object({
  filePath: z.string()
    .min(1, "文件路径不能为空")
    .describe("相对于知识库根目录的文件路径"),
  sectionMarker: z.string()
    .min(1, "部分标记不能为空")
    .describe("要更新的部分标记（Markdown标题，如：## 当前状态）"),
  newContent: z.string()
    .min(1, "新内容不能为空")
    .describe("新的内容（Markdown格式）"),
  reason: z.string()
    .min(5, "原因说明至少5个字符")
    .describe("更新原因说明（用于日志记录）")
});

// 列出备份文件
export const ListBackupsSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("响应格式：json或markdown")
});
