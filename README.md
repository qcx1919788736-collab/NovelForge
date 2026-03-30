# Craft Companion

**AI 协作创作框架 — 让 AI 真正理解你的作品**

[![Privacy](https://img.shields.io/badge/privacy-100%25%20Local-ff6b6b?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-4ecdc4?style=flat-square)]()

Craft Companion 是一个基于结构化知识库的 AI 协作创作框架，专为长篇小说创作设计。通过系统化的知识管理和工作流，让 AI 能够保持角色一致性、遵循世界观设定、延续文风特征，真正成为你的创作伙伴。

## 核心特性

- **结构化知识库** — 5层知识库体系（核心上下文/人物档案/世界观/故事进展/写作参考），AI 按需加载，避免信息过载
- **6阶段创作工作流** — 章纲发散 → 选择 → 正文产出 → AI自查 → 修正 → 归档，每个环节都有质量控制
- **错题集机制** — 记录并学习每次修改，AI 自动规避已知问题
- **文风学习** — 从你的文本中提取文风特征，生成个性化写作规则
- **伏笔追踪** — 系统化管理故事线索，不遗漏任何伏笔
- **隐私优先** — 你的创作数据永远在本地，不会被上传或用于模型训练
- **Harness Engineering** — 通过架构约束和反馈循环，让 AI 持续稳定地做对

## 快速开始

### 1. 获取项目

```bash
git clone https://github.com/qcx1919788736-collab/craft-companion.git
cd craft-companion
```

---

### 2. 安装 Cherry Studio（推荐）

Cherry Studio 是一个跨平台的 AI 桌面客户端，支持多个 LLM 提供商、知识库管理和 MCP 服务器集成。

**下载地址**：
- 官网：https://cherry-ai.com
- GitHub：https://github.com/kangfenmao/cherry-studio

**支持平台**：Windows / macOS / Linux

---

### 3. 在 Cherry Studio 中使用（推荐）

**三步开始**：

1. **配置 API** — 打开 Cherry Studio，添加你的 Claude / GPT API
2. **创建 Agent** — 新建 Agent，设置工作目录为 `craft-companion` 项目目录
3. **开始创作** — 输入"请帮我创作第1章"

就这么简单。AI 会自动读取 `CLAUDE.md` 和知识库，执行完整工作流：
- 📖 读取知识库（人物、设定、文风规则）
- 📝 生成 3 个章纲版本供你选择
- ✍️ 根据选定章纲写完整章节（6000-10000字）
- 🔍 自查并修正常见问题
- 💾 更新知识库

> **提示**：权限模式建议选"全自动"；首次使用时 AI 会引导你完成基础设定

---

### 4. 其他使用方式

**方式 A：Claude Code / Cursor / Windsurf**

如果你熟悉命令行和代码编辑器：

```bash
# 进入项目目录
cd craft-companion

# 用支持 CLAUDE.md 的工具打开
claude-code .  # 或 cursor . / windsurf .
```

在编辑器中输入：`请帮我创作第1章`

**方式 B：CLI 工具（注意！！暂时无法使用）**

需要 Node.js 18.0+ 环境：

```bash
# 安装依赖
npm install

# 创建新项目
node tools/init.js

# 使用 CLI 工具
node tools/novel-cli.js new-chapter 1
node tools/novel-cli.js check
node tools/novel-cli.js archive 1
```

---

### 5. （可选）导入已有内容

如果你已经写了部分章节，可以导入现有内容：

```bash
node tools/import.js --project ./我的小说 --file 我的章节.txt
```

导入工具会自动分析并提取：
- 人物信息（性格、说话方式、行为模式）
- 世界观设定
- 时间线
- 文风特征
- 伏笔线索

详细说明见 [导入现有作品](docs/03-导入现有作品.md)

---

### 常见问题

**Q: 首次创作时 AI 说知识库为空？**
A: 正常现象。AI 会引导你先完成基础设定。你也可以手动编辑 `知识库/` 目录下的文件。

**Q: Cherry Studio 找不到知识库文件？**
A: 确保在 Agent 设置中正确指定了工作目录为 `craft-companion` 项目根目录。

**Q: 可以用其他 AI 工具吗？**
A: 可以。任何支持 CLAUDE.md 或能读取知识库文件的 AI 工具都可以使用（Claude Code、Cursor、Windsurf 等）。


## 项目结构

```
Craft Companion/               # 框架根目录
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
AI 读取知识库后，生成3个不同侧重点的章纲版本，例：

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

AI 本身没有记忆，每次对话都是全新开始。 Craft Companion通过结构化知识库解决这个问题：

- **渐进式披露 分层加载**：AI 只读取当前需要的文件，避免 token 浪费
- **唯一真相源**：所有设定、人物、进展都在知识库中，不会出现"AI 记错了"的情况
- **持续更新**：每完成一章，知识库自动更新，保持同步

### 错题集 = AI 的自我纠正

每次你修改 AI 的输出，都是一次"纠错"。NovelForge 把这些纠错记录下来，例：

```markdown
## AI-006：AI味过重的抽象表达
【问题类型】：文风偏离/AI感
【出现章节】：第xx章初稿
【具体描述】：小明分析小王时写了"那不是威胁，是划线"。这种抽象化的二元对立表达带有明显AI味道，且"××"一词用于形容某人面对××的态度不恰当。
【原因分析】：AI倾向使用精炼的、概括性的判断句来总结人物行为，形成一种"万物皆可归纳"的AI感。对人物关系的权力语境考虑不足。
【解决方案】：改为具体的、基于小明观察视角的描述："在XX局干了二十三年的人，对流程和规矩摸得比谁都清。他那句话不多，但意思很明确，我儿子会配合，但别越线。"
【经验总结】：避免用抽象化的总结句（"这不是X，是Y"格式）来概括人物行为。应从观察者视角出发，用具体细节和合理推断来展现对另一个人的判断。同时注意权力语境——公民与执法者之间的互动措辞要得体。
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

Craft Companion 提供 MCP（Model Context Protocol）服务器，可在 Claude Desktop 中使用：

```json
{
  "mcpServers": {
    "novel-knowledge": {
      "command": "node",
      "args": ["path/to/craft-companion/novel-knowledge-mcp-server/dist/index.js"],
      "env": {
        "KNOWLEDGE_BASE_PATH": "path/to/你的项目/知识库"
      }
    }
  }
}
```

### CLI 工具

使用全局命令（推荐）：

```bash
cd 我的小说

# 创建新章节工作文件
craft-companion new-chapter 5

# 归档已完成章节
craft-companion archive 5

# 验证知识库完整性
craft-companion check

# 更新知识库
craft-companion update-kb 5
```

或从源码目录使用：

```bash
# 在 Craft Companion 根目录
node tools/novel-cli.js new-chapter 5
```

## 文档

- [快速开始](docs/01-快速开始.md)
- [知识库设计理念](docs/02-知识库设计理念.md)
- [导入现有作品](docs/03-导入现有作品.md)
- [工作流详解](docs/04-工作流详解.md)
- [自定义与扩展](docs/05-自定义与扩展.md)
- [Cherry Studio MCP 配置（可选）](docs/06-Cherry-Studio使用指南.md)

## 适用场景

Craft Companion 特别适合：

- **长篇小说创作** — 需要管理复杂人物关系和多条故事线
- **系列作品** — 需要保持世界观一致性
- **续写/改写** — 已有部分内容，需要 AI 延续风格
- **多人协作** — 知识库作为共享的"设定圣经"

## 设计理念：Harness Engineering

Craft Companion 遵循 **Harness Engineering** 理念——不依赖更强大的 AI，而是通过架构设计让普通 AI 持续稳定地做对。

### 什么是 Harness Engineering

| 维度 | Prompt Engineering | Context Engineering | Harness Engineering |
|------|-------------------|-------------------|---------------------|
| 核心问题 | "怎么说"让 AI 理解 | "给什么资料"让 AI 做对 | "设计什么环境"让 AI 持续做对 |
| 失败模式 | AI "没听懂" | AI "没看到关键信息" | AI "做着做着就偏了" |

Harness Engineering 的核心是：**让错误路径在结构上无法发生**，而不是"告诉 AI 不要犯错"。

### Craft Companion 的四大机制

| Harness 机制 | Craft Companion 中的实现 |
|-------------|-------------------------|
| **结构化文档 + 渐进式披露** | 知识库5层分级 + CLAUDE.md 作为索引地图，AI 只读当前需要的 |
| **架构约束（确定性护栏）** | 写前护栏 + 核心红线 + 伏笔植入前三问，从源头阻止错误 |
| **反馈循环（自审机制）** | 阶段4 AI自查 + 错题集逐条对照 + 终版自查清单 |
| **熵管理（持续学习）** | 终版后知识库7项强制更新 + 微调意图学习库 |

### 独特之处

**微调意图学习库**是核心创新——每次你修改 AI 的输出，AI 会分析修改意图，提取规则，更新到学习库。这意味着 AI 会从你的每一次反馈中学习，越用越懂你的风格。

这正是 Harness Engineering 的精髓：**不靠一次性的提示词优化，而是建立持续改进的系统**。

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
