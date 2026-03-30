# NovelForge

**AI 协作创作框架 — 让 AI 真正理解你的作品**

NovelForge 是一个基于结构化知识库的 AI 协作创作框架，专为长篇小说创作设计。通过系统化的知识管理和工作流，让 AI 能够保持角色一致性、遵循世界观设定、延续文风特征，真正成为你的创作伙伴。

## 核心特性

- **结构化知识库** — 5层知识库体系（核心上下文/人物档案/世界观/故事进展/写作参考），AI 按需加载，避免信息过载
- **6阶段创作工作流** — 章纲发散 → 选择 → 正文产出 → AI自查 → 修正 → 归档，每个环节都有质量控制
- **错题集机制** — 记录并学习每次修改，AI 自动规避已知问题
- **文风学习** — 从你的文本中提取文风特征，生成个性化写作规则
- **伏笔追踪** — 系统化管理故事线索，不遗漏任何伏笔
- **导入工具** — 从已有文本自动提取人物、设定、时间线等信息

## 快速开始

### 前置要求

在开始之前，请确保你已安装：

- **Node.js** 18.0 或更高版本 → [下载](https://nodejs.org/)
- **Claude Code** 或其他支持 CLAUDE.md 的 AI 工具
- **Git**

检查版本：
```bash
node --version  # 应该显示 v18.0.0 或更高
```

---

### 1. 安装

**方式 A：通过 npm 安装（推荐）**

```bash
npm install -g craft-companion
```

安装后可直接使用：
```bash
craft-companion init
# 或使用简短命令
cc-init
```

**方式 B：从源码安装**

```bash
# 克隆仓库
git clone https://github.com/qcx1919788736-collab/NovelForge.git
cd NovelForge
npm install -g .
```

---

### 2. 创建你的第一个项目

```bash
# 使用 craft-companion 命令
craft-companion init

# 或使用简短命令
cc-init
```

按提示输入项目信息：
```
=== Craft Companion 项目初始化 ===

项目名称: 我的小说
作者: 张三
小说类型: 科幻

✓ 项目 "我的小说" 创建成功！
✓ 知识库结构已生成
✓ CLAUDE.md 已配置

下一步：cd 我的小说
```

---

### 3. 开始创作

```bash
# 进入项目目录
cd 我的小说

# 用 Claude Code 打开
claude-code .
```

在 Claude Code 中输入：
```
请帮我创作第1章
```

AI 会自动执行完整工作流：
1. 📖 读取知识库（人物、设定、文风规则）
2. 📝 生成 3 个章纲版本供你选择
3. ✍️ 根据选定章纲写完整章节（6000-10000字）
4. 🔍 自查并修正常见问题
5. 💾 更新知识库

> **首次使用提示**：如果知识库为空，AI 会引导你先完成基础设定（主角信息、世界观、文风偏好）。

---

### 4. （可选）导入已有内容

如果你已经写了部分章节，可以导入现有内容：

```bash
craft-companion import --project ./我的小说 --file 我的章节.txt

# 或使用简短命令
cc-import --project ./我的小说 --file 我的章节.txt
```

导入工具会自动分析并提取：
- 人物信息（性格、说话方式、行为模式）
- 世界观设定
- 时间线
- 文风特征
- 伏笔线索

详细说明见 [导入现有作品](docs/03-导入现有作品.md)

---

### 5. 使用 CLI 工具

```bash
cd 我的小说

# 创建新章节工作文件
craft-companion new-chapter 2

# 验证知识库完整性
craft-companion check

# 归档已完成章节
craft-companion archive 1
```

---

### 常见问题

**Q: 首次创作时 AI 说知识库为空？**
A: 正常现象。AI 会引导你先完成基础设定。你也可以手动编辑 `知识库/` 目录下的文件。

**Q: `craft-companion` 命令找不到？**
A: 确保已全局安装：`npm install -g craft-companion`，或从源码安装：`npm install -g .`

**Q: Claude Code 不识别 CLAUDE.md？**
A: 确保使用最新版 Claude Code，或尝试其他支持 CLAUDE.md 的工具（Cursor、Windsurf）。

---

**准备好了吗？** → 开始 [创建你的第一个项目](#2-创建你的第一个项目)

## 项目结构

```
NovelForge/                    # 框架根目录
├── tools/                     # CLI 工具（init、import、novel-cli）
├── novel-knowledge-mcp-server/# MCP 服务器
├── docs/                      # 文档
│
└── 你的项目/                  # 由 init.js 创建的项目目录
    ├── CLAUDE.md              # AI 工作指令（自动生成）
    ├── 知识库/
    │   ├── 00_核心上下文/     # 当前状态、文风规则、伏笔追踪
    │   ├── 01_人物档案/       # 每个角色的完整档案
    │   ├── 02_世界观设定/     # 设定、规则、机制
    │   ├── 03_故事进展/       # 时间线、章节梗概
    │   └── 04_写作参考/       # 场景范例、错题集
    └── 工作区/                # 章节创作工作文件
```

## 工作流程

### 1. 章纲发散
AI 读取知识库后，生成3个不同侧重点的章纲版本：

```markdown
## 版本A：【情感线推进】
核心事件：主角与配角的关键对话
关键场景：咖啡馆、深夜电话
伏笔操作：推进"神秘包裹"线索
```

### 2. 正文产出
你选择一个版本（或混合），AI 写完整章节（6000-10000字）

### 3. AI 自查
AI 自动对照错题集和文风规则，修正常见问题：
- 人物OOC（性格不一致）
- 设定矛盾
- 文风偏离
- 伏笔遗漏

### 4. 人类微调
你修改细节，AI 学习你的修改意图，更新到"微调意图学习库"

### 5. 知识库更新
终版确认后，AI 自动更新：
- 当前状态
- 章节梗概
- 伏笔追踪表
- 人物档案（如有变化）

## 核心概念

### 知识库 = AI 的长期记忆

AI 本身没有记忆，每次对话都是全新开始。NovelForge 通过结构化知识库解决这个问题：

- **分层加载**：AI 只读取当前需要的文件，避免 token 浪费
- **唯一真相源**：所有设定、人物、进展都在知识库中，不会出现"AI 记错了"的情况
- **持续更新**：每完成一章，知识库自动更新，保持同步

### 错题集 = AI 的自我纠正

每次你修改 AI 的输出，都是一次"纠错"。NovelForge 把这些纠错记录下来：

```markdown
## AI-001：避免"他知道"式心理总结

❌ 错误示例：他知道这件事不简单。
✅ 正确示例：他盯着那封信，眉头皱了起来。

触发场景：心理描写
```

下次 AI 写作时，会自动对照错题集，避免重复错误。

### 文风规则 = 你的写作风格

导入工具会分析你的文本，提取：
- 句式偏好（短句/长句比例）
- 对话风格（口语化程度）
- 情绪表达方式（直接告知 vs 动作暗示）
- 场景描写习惯

生成个性化的文风规则，让 AI 模仿你的风格。

## 高级功能

### MCP 服务器

NovelForge 提供 MCP（Model Context Protocol）服务器，可在 Claude Desktop 中使用：

```json
{
  "mcpServers": {
    "novel-knowledge": {
      "command": "node",
      "args": ["path/to/NovelForge/novel-knowledge-mcp-server/build/index.js"],
      "env": {
        "KNOWLEDGE_BASE_PATH": "path/to/你的项目/知识库"
      }
    }
  }
}
```

### CLI 工具

在 NovelForge 根目录下使用：

```bash
# 创建新章节工作文件
node tools/novel-cli.js new-chapter 5

# 归档已完成章节
node tools/novel-cli.js archive 5

# 验证知识库完整性
node tools/novel-cli.js check

# 更新知识库
node tools/novel-cli.js update-kb 5
```

在项目目录内使用（需要引用上级目录）：

```bash
cd 我的小说
node ../tools/novel-cli.js new-chapter 5
```

## 文档

- [快速开始](docs/01-快速开始.md)
- [知识库设计理念](docs/02-知识库设计理念.md)
- [导入现有作品](docs/03-导入现有作品.md)
- [工作流详解](docs/04-工作流详解.md)
- [自定义与扩展](docs/05-自定义与扩展.md)
- [Cherry Studio 使用指南](docs/06-Cherry-Studio-Guide.md)

## 适用场景

NovelForge 特别适合：

- **长篇小说创作** — 需要管理复杂人物关系和多条故事线
- **系列作品** — 需要保持世界观一致性
- **续写/改写** — 已有部分内容，需要 AI 延续风格
- **多人协作** — 知识库作为共享的"设定圣经"

## 贡献

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md)。

特别欢迎：
- 新的导入 prompt（支持更多文本类型）
- 通用的场景范例
- 工具功能增强
- 文档翻译

## 许可证

[MIT License](LICENSE)

## 致谢

本项目受以下理念启发：
- [CLAUDE.md](https://claude.md) — AI 项目配置标准
- [Model Context Protocol](https://modelcontextprotocol.io) — AI 工具互操作标准
- 结构化写作方法论

---

**开始你的创作之旅** → [快速开始](docs/01-快速开始.md)
