// 类型定义
export interface Character {
  name: string;
  age?: number;
  ability?: string;
  personality: string;
  currentStatus: string;
  filePath: string;
}

export interface PlotPoint {
  id: string;
  content: string;
  status: '待揭示' | '部分揭示' | '已揭示';
  chapter?: number;
  notes?: string;
}

export interface ChapterFile {
  chapterNumber: number;
  fileName: string;
  filePath: string;
  stage: '章纲草案' | '选定章纲' | '初稿' | '修订稿' | '终版';
  version?: string;
}

export interface ConsistencyIssue {
  type: 'OOC' | '数值错误' | '时间线错误' | '设定冲突';
  severity: 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  suggestion?: string;
}

export interface SearchResult {
  filePath: string;
  fileName: string;
  matchedContent: string;
  relevanceScore?: number;
}

export interface KnowledgeBaseStats {
  totalFiles: number;
  coreContextFiles: number;
  characterFiles: number;
  worldviewFiles: number;
  lastUpdated?: string;
}
