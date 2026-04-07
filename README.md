<div align="center">

# Craft Companion

### 让 AI 真正理解你的小说，而不是每章都重新猜。

**AI 协作小说创作框架**

结构化知识库 ✦ 双入口初始化 ✦ 5 阶段工作流

![Version](https://img.shields.io/badge/version-1.2.0-8b5cf6?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-14b8a6?style=flat-square)
![Local First](https://img.shields.io/badge/local--first-yes-f97316?style=flat-square)
![Dual Entry](https://img.shields.io/badge/onboarding-dual--entry-ec4899?style=flat-square)
![Workflow](https://img.shields.io/badge/workflow-5--stage-3b82f6?style=flat-square)

</div>

---

## 最新更新（v1.2.0）

- 统一 AI 入口：新增 `AI入口_统一指令.md`
- 旧项目一键升级：`craft-companion bootstrap-entry`
- 一键健康检查：`craft-companion doctor`
- 双层质量保障：执行层自查 + 评估层复核
- 连接异常排查：覆盖 `tls: bad record MAC`

查看完整发布说明：
- `docs/releases/v1.2.0.md`

---

## 先看这里（最短路径）

如果你只想最快跑通，不想被文档绕晕，直接做这 4 步：

```bash
git clone https://github.com/qcx1919788736-collab/craft-companion.git
cd craft-companion
node tools/init.js
# 进入你刚创建的项目目录后：
craft-companion doctor
```

然后给 AI 发第一句：

```text
请先读取 CLAUDE.md、START_HERE.md、AI入口_统一指令.md，然后带我完成第一步，不要提前写正文。
```

---

## 选择你的起点

### 从零开始写新小说
适合：还没有正文，想和 AI 一起搭建作品。

你会得到的体验：
- 创建项目
- AI 读取 `START_HERE.md`
- AI 参考 `提示模板/从零开始/` 的步骤模板引导你完成初始化
- 再进入正式创作

### 导入已有小说
适合：已经写了几章、几十章，想迁移到 Craft Companion。

你会得到的体验：
- 创建项目
- AI 读取 `START_HERE.md`
- AI 参考 `提示模板/导入已有小说/` 的步骤模板引导你完成导入
- 再进入正式创作

> **一句话理解**：
> - 没有正文 → 走 **从零开始**
> - 已有正文 → 走 **导入已有小说**

## 工作方式

```mermaid
flowchart TB
  U[用户目标] --> R{入口分流}
  R -->|从零开始| B1[初始化模板]
  R -->|导入已有| B2[导入模板]
  B1 --> KB[结构化知识库就绪]
  B2 --> KB

  subgraph L1[执行层 Writer]
    W1[阶段1 章纲]
    W2[阶段2 初稿]
    W3[阶段3.1 执行层自查]
  end

  subgraph L2[评估层 Evaluator]
    E1[阶段3.2 评估层复核]
    E2[输出: confirmed / disputed / dismissed]
  end

  subgraph L3[仲裁层 Arbiter]
    A1[人类裁决 disputed]
    A2[阶段4 修订]
    A3[阶段5 终版确认]
  end

  KB --> W1 --> W2 --> W3 --> E1 --> E2 --> A1 --> A2 --> A3
  A3 --> CP[(检查点与知识库更新)]

  classDef layer fill:#f6f8fa,stroke:#57606a,stroke-width:1px,color:#24292f;
  classDef gate fill:#fff8c5,stroke:#9a6700,stroke-width:1px,color:#3d2f00;
  class L1,L2,L3 layer;
  class R,A1 gate;
```

---

## 快速开始

### 1. 获取项目

```bash
git clone https://github.com/qcx1919788736-collab/craft-companion.git
cd craft-companion
```

### 2. 创建项目

```bash
node tools/init.js
```

创建完成后会生成：
- 项目目录
- `CLAUDE.md`
- 基础知识库目录
- `START_HERE.md`（告诉你下一步去哪）
- `提示模板/`（可直接在项目目录里使用）
- `docs/`（项目内说明文档）
- `tools/`（项目内可执行脚本）

### 3. 按你的模式继续

#### 如果你选了“从零开始”
AI 会读取 `START_HERE.md`，并参考以下步骤模板来引导你完成初始化：
- `提示模板/从零开始/01-定义核心概念.md`
- `提示模板/从零开始/02-构建主角.md`
- `提示模板/从零开始/03-设计故事结构.md`
- `提示模板/从零开始/04-建立文风.md`
- `提示模板/从零开始/05-准备开始创作.md`

#### 如果你选了“导入已有小说”
AI 会读取 `START_HERE.md`，并参考以下步骤模板来引导你完成导入：
- `提示模板/导入已有小说/01-提取人物信息.md`
- `提示模板/导入已有小说/02-提取世界观设定.md`
- `提示模板/导入已有小说/03-构建时间线.md`
- `提示模板/导入已有小说/04-分析文风特征.md`
- `提示模板/导入已有小说/05-识别伏笔线索.md`

> 这些模板主要是给 AI 参考的流程材料，不是要求用户手动逐个导入的操作说明。

---

## 5 阶段工作流

1. **章纲**：先生成章节方向或方案
2. **初稿**：写出正文初稿
3. **自查**：执行层自查 + 评估层复核
4. **修订**：根据反馈修改
5. **终版确认**：确认最终版本并更新知识库

```mermaid
flowchart TD
  A[1. 章纲\n生成A/B/C并停住] --> G1{人类选择章纲}
  G1 --> B[2. 初稿\n正文产出]
  B --> C1[3.1 执行层自查\n先修可确定问题]
  C1 --> C2[3.2 评估层复核\n三分结果输出]
  C2 --> G2{存在 disputed?}
  G2 -->|是| H[仲裁\n原文+建议改写块]
  G2 -->|否| D[4. 修订\n合并 confirmed]
  H --> D
  D --> E[5. 终版确认\n知识库更新+检查点归档]
  E --> F[进入下一章]

  classDef gate fill:#fff8c5,stroke:#9a6700,stroke-width:1px,color:#3d2f00;
  class G1,G2 gate;
```

这套工作流的目标不是“让 AI 一把写完”，而是让 AI 在稳定约束下持续协作。

---

## 常用命令

```bash
# 创建新项目
node tools/init.js

# 导入已有作品的提示模板辅助
node tools/import-cli.js

# CLI 功能（按当前仓库实际情况使用）
craft-companion --help

# 给已有项目补齐统一入口（不动正文）
craft-companion bootstrap-entry

# 健康检查（入口/模板/接力/检查点）
craft-companion doctor
```

`bootstrap-entry` 会补齐入口与基础骨架（`CLAUDE.md`、`提示模板/`、`docs/`、核心上下文基础文件），不会改你的正文章节文件。

---

## 推荐使用方式

### 方式 A（首推）：Codex / Claude Code

这是当前最推荐的协作方式，原因是：
- 更容易发挥多 Agent 协作能力（尤其是复核、批量检查、并行任务）
- 更适合执行“执行层 + 评估层”双层流程
- 命令行闭环更完整，适合持续迭代

建议让 AI 先读取：
1. `CLAUDE.md`
2. `START_HERE.md`
3. `AI入口_统一指令.md`
4. 你当前步骤对应的模板文件

推荐首条消息：

```text
请先读取 CLAUDE.md、START_HERE.md、AI入口_统一指令.md，然后带我完成第一步，不要提前写正文。
```

### 方式 B：Cherry Studio（新手友好）

优势：
- 可视化界面更直观
- 新手上手更轻松

边界：
- 在复杂多 Agent 编排和长链路协作上，通常不如 Codex / Claude Code 可控
- 更适合轻量创作与流程体验，不一定能发挥“最强协作模式”

如果你用的是 Cherry Studio，可以先看官方文档：
- [项目简介 | Cherry Studio](https://docs.cherry-ai.com/)
- `docs/06-Cherry-Studio使用指南.md`

### 方式 C：OpenClaw / 柴油C6 集成
接入时，第一轮只需要先帮用户分流：
- 从零开始写新小说
- 导入已有小说

分流后再进入具体步骤，不要一上来问很多问题。

---

## 项目结构

```text
Craft Companion/
├── tools/
├── novel-knowledge-mcp-server/
├── docs/
├── 提示模板/
│   ├── 从零开始/
│   ├── 导入已有小说/
│   └── 通用流程/
│
└── 你的项目/
    ├── CLAUDE.md
    ├── START_HERE.md
    ├── 提示模板/
    ├── docs/
    ├── tools/
    ├── 知识库/
    ├── 工作区/
    └── _归档/
```

---

## 核心特点

- **结构化知识库**：人物、设定、故事进展、写作参考分层维护
- **5 阶段工作流**：减少 AI 跑偏
- **提示模板双入口**：从零开始 / 导入已有小说
- **隐私优先**：本地使用，不上传私人创作资料
- **Harness 思路**：不靠“玄学 prompt”，而靠稳定流程

---

## 文档

- `docs/01-快速开始.md`
- `docs/02-知识库设计理念.md`
- `docs/03-导入现有作品.md`
- `docs/04-工作流详解.md`
- `docs/05-自定义与扩展.md`
- `docs/06-Cherry-Studio使用指南.md`
- `docs/07-架构设计原则.md`
- `docs/08-检查点机制.md`
- `docs/09-评估层与复核机制.md`
- `docs/10-ClaudeCode与Codex上手指南.md`
- `docs/11-连接错误排查.md`
- `docs/12-发布与更新展示规范.md`
- `docs/13-体验验收与一致性检查清单.md`
- `docs/releases/v1.2.0.md`

---

## 当前建议

如果你是第一次用，**不要直接看所有文档**。先做这四件事：

1. `node tools/init.js`
2. 打开 `START_HERE.md`
3. 运行 `craft-companion doctor`
4. 按你的模式完成第一步模板

这样最快，不容易绕晕。

如果你是导入已有本地项目，建议先运行：

```bash
craft-companion bootstrap-entry
craft-companion doctor
```
