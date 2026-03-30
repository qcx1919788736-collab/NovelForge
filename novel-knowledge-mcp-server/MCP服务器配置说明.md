# MCP服务器配置说明

## ✅ 构建成功！

MCP服务器已成功使用esbuild编译（仅用8ms，相比TypeScript的内存溢出问题）。

## 📦 安装到Claude Desktop

### 方法1：手动配置

1. 找到Claude Desktop配置文件：
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. 添加以下配置：

```json
{
  "mcpServers": {
    "novel-knowledge": {
      "command": "node",
      "args": [
        "C:/Users/QCX19/Desktop/小说/正文创作/novel-knowledge-mcp-server/dist/index.js"
      ]
    }
  }
}
```

3. 重启Claude Desktop

### 方法2：使用提供的配置文件

项目中已生成 `claude-desktop-config.json`，可以直接复制内容到Claude Desktop配置文件中。

---

## 🧪 测试MCP服务器

### 使用MCP Inspector测试

```bash
cd novel-knowledge-mcp-server
npx @modelcontextprotocol/inspector node dist/index.js
```

这会打开一个Web界面，可以测试所有10个工具。

### 测试示例

在Claude Desktop中，MCP服务器启动后，你可以这样使用：

1. **搜索人物信息**
   ```
   使用novel_search_knowledge搜索"秦力"
   ```

2. **获取人物档案**
   ```
   使用novel_get_character获取秦力的完整档案
   ```

3. **检查章节一致性**
   ```
   使用novel_check_consistency检查第20章
   ```

4. **智能推荐资料**
   ```
   使用novel_recommend_resources，章纲内容是："秦力和赵明进行能力测试"
   ```

---

## 🛠️ 可用工具列表

1. **novel_search_knowledge** - 搜索知识库
2. **novel_get_character** - 获取人物档案
3. **novel_list_characters** - 列出所有人物
4. **novel_get_plot_points** - 获取伏笔追踪
5. **novel_get_current_state** - 获取当前状态
6. **novel_list_chapter_files** - 列出章节文件
7. **novel_check_consistency** - 一致性检查
8. **novel_recommend_resources** - 智能推荐资料
9. **novel_get_kb_stats** - 获取知识库统计
10. **novel_read_file** - 读取文件

---

## 🔄 开发工作流

### 修改代码后重新构建
```bash
cd novel-knowledge-mcp-server
npm run build
```

### 监听模式（自动重新构建）
```bash
npm run watch
```

### 开发模式（构建+运行）
```bash
npm run dev
```

---

## 📝 注意事项

1. **路径问题**：确保配置文件中的路径正确，使用正斜杠 `/` 而不是反斜杠 `\`

2. **重启Claude Desktop**：修改配置后需要重启Claude Desktop才能生效

3. **日志查看**：服务器日志会输出到stderr，可以在Claude Desktop的开发者工具中查看

4. **知识库路径**：服务器会从 `../知识库/` 读取文件，确保相对路径正确

---

## 🎉 成功标志

当MCP服务器成功加载后，在Claude Desktop中你会看到：
- 工具栏中出现MCP工具图标
- 可以调用10个novel_*工具
- 工具调用会返回知识库内容

---

**创建时间**: 2026-03-05
**状态**: ✅ 构建成功，可以使用
