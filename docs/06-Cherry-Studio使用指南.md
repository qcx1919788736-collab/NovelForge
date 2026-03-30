# Cherry Studio 使用指南

## 基本使用

只需三步：

1. **配置 API** — 打开 Cherry Studio，设置中添加你的API用于调用大模型
2. **创建 Agent** — 新建 Agent，工作目录设为 `craft-companion` 项目目录
3. **开始创作** — 新建对话

设置工作目录后，AI 会自动读取 `CLAUDE.md` 和知识库内容，无需手动导入文件或配置系统提示词。

> 权限模式熟悉后建议选"全自动"。Cherry Studio 内置了 Bash、Edit、Glob 等文件操作工具，足够日常使用。

## （可选）配置 MCP 服务器

项目自带一个 MCP 服务器，提供知识库专用查询工具。不配置也能正常使用，配置后 AI 可以更精准地检索知识库。

**配置步骤**：

1. Cherry Studio 设置 → MCP 服务器 → 添加新服务器
2. 填写：
   - 类型：`stdio`
   - 命令：`node`
   - 参数：`[你的项目路径]/novel-knowledge-mcp-server/dist/index.js`
   - 工作目录：项目根目录
3. 保存并重启 Cherry Studio

**可用工具**：
- `read_knowledge_file` — 读取知识库文件
- `search_knowledge` — 搜索知识库
- `list_knowledge_structure` — 列出知识库结构
- `get_current_status` — 获取当前创作状态
- `get_character_info` — 获取人物信息

## 常见问题

**Q: AI 说知识库为空？**
A: 正常现象，首次使用时 AI 会引导你完成基础设定。

**Q: MCP 服务器连接失败？**
A: 检查 Node.js 是否已安装（`node --version`），以及 MCP 服务器路径是否正确。不配置 MCP 也不影响使用。

---

**参考资源**：

- [Cherry Studio 官网](https://cherry-ai.com)
- [Cherry Studio GitHub](https://github.com/CherryHQ/cherry-studio)
