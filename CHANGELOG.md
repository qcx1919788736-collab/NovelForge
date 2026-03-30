# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-29

### Added

- 初始发布
- 5 层知识库结构（核心上下文、人物档案、世界观设定、故事进展、写作参考）
- 6 阶段创作工作流（章纲发散 → 选择 → 正文产出 → AI自查 → 人类修正 → 归档）
- 完整的模板系统（template/）
- 5 个导入 prompt（提取人物、世界观、时间线、文风、伏笔）
- 5 个引导 prompt（核心概念、主角、结构、文风、准备创作）
- CLI 工具集：
  - `init.js` - 项目初始化
  - `import-cli.js` - 导入现有作品
  - `novel-cli.js` - 章节管理和一致性检查
- 详细文档：
  - 快速开始指南
  - 知识库设计理念
  - 导入现有作品指南
  - 工作流详解
  - 自定义与扩展指南
- 开源项目标准文件：
  - MIT License
  - Contributing Guidelines
  - .gitignore

### Documentation

- README.md - 项目概述和快速开始
- CLAUDE.md - AI 协作指令模板
- docs/ - 完整文档目录

## [Unreleased]

### Planned

- MCP 服务器适配（知识库查询工具）
- 自动化知识库更新脚本
- 更多场景范例模板
- 多语言支持
- Web UI（可选）

---

## 版本说明

### 1.0.0 - 首个稳定版本

这是 NovelForge 的首个公开版本，从一个具体小说项目中提炼而来。

**核心特性**：
- 结构化知识库系统
- 可执行的文风规则
- 错误驱动学习机制
- 完整的导入和引导流程

**适用场景**：
- 长篇小说创作
- AI 协作写作
- 需要严格一致性控制的创作项目

**已知限制**：
- 主要针对 Claude 优化，其他模型可能需要调整
- CLI 工具功能基础，部分操作需要手动完成
- 文档和示例主要为中文

**贡献者**：
- 初始开发：[你的名字]
- 基于项目：《焦灵综合征》创作实践

---

更新日志格式参考：
- `Added` - 新功能
- `Changed` - 现有功能的变更
- `Deprecated` - 即将移除的功能
- `Removed` - 已移除的功能
- `Fixed` - 错误修复
- `Security` - 安全相关更新
