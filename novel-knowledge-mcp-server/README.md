# Novel Knowledge MCP Server

小说创作知识库MCP服务器 - 为AI协作创作提供智能知识库访问能力

## 功能特性

### 核心工具

1. **novel_search_knowledge** - 搜索知识库
   - 支持按类别搜索（人物、世界观、伏笔、写作参考）
   - 关键词匹配
   - 可配置返回数量

2. **novel_get_character** - 获取人物档案
   - 获取指定人物的完整档案
   - 包括性格、能力、关系等信息

3. **novel_list_characters** - 列出所有人物
   - 显示知识库中所有人物列表

4. **novel_get_plot_points** - 获取伏笔追踪
   - 按状态筛选（待揭示、部分揭示、已揭示）
   - 查看伏笔推进计划

5. **novel_get_current_state** - 获取当前状态
   - 故事时间点
   - 人物位置
   - 待推进伏笔

6. **novel_list_chapter_files** - 列出章节文件
   - 查看工作区章节文件
   - 按章节编号筛选
   - 显示创作阶段（章纲/初稿/修订稿/终版）

7. **novel_check_consistency** - 一致性检查
   - 检测OOC（人物性格不一致）
   - 检测数值错误
   - 检测时间线错误
   - 检测设定冲突

8. **novel_recommend_resources** - 智能推荐资料
   - 根据章节大纲推荐相关资料
   - 自动识别涉及的人物、场景类型
   - 推荐对应的档案和写作参考

9. **novel_get_kb_stats** - 获取知识库统计
   - 文件总数
   - 各类别文件数量

10. **novel_read_file** - 读取文件
    - 读取知识库中任意文件的完整内容

## 安装

```bash
cd novel-knowledge-mcp-server
npm install
npm run build
```

## 使用

### 作为stdio服务器

在Claude Desktop配置文件中添加：

```json
{
  "mcpServers": {
    "novel-knowledge": {
      "command": "node",
      "args": ["/path/to/novel-knowledge-mcp-server/dist/index.js"]
    }
  }
}
```

### 测试

使用MCP Inspector测试：

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## 项目结构

```
novel-knowledge-mcp-server/
├── src/
│   ├── index.ts              # 主入口，工具注册
│   ├── constants.ts          # 常量定义
│   ├── types.ts              # TypeScript类型
│   ├── schemas/
│   │   └── index.ts          # Zod验证schemas
│   └── services/
│       ├── filesystem.ts     # 文件系统服务
│       └── knowledge.ts      # 知识库服务
├── package.json
├── tsconfig.json
└── README.md
```

## 设计原则

- **只读操作**: 所有工具都是只读的，不会修改知识库
- **智能推荐**: 根据上下文自动推荐相关资料
- **一致性检查**: 帮助发现潜在的写作问题
- **灵活格式**: 支持JSON和Markdown两种响应格式

## 示例用法

### 搜索人物信息
```typescript
novel_search_knowledge({
  query: "秦力",
  category: "characters",
  limit: 5
})
```

### 获取人物档案
```typescript
novel_get_character({
  name: "秦力"
})
```

### 一致性检查
```typescript
novel_check_consistency({
  chapterNumber: 20,
  checkTypes: ["OOC", "数值错误", "时间线错误"]
})
```

### 智能推荐
```typescript
novel_recommend_resources({
  chapterOutline: "秦力和赵明进行能力测试，发现新的能力特性...",
  limit: 5
})
```

## 技术栈

- **TypeScript** - 类型安全
- **MCP SDK** - Model Context Protocol
- **Zod** - 运行时验证
- **Node.js** - 运行环境

## 版本

1.0.0 - 初始版本

## 许可

MIT
