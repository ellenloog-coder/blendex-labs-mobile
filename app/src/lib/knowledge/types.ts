import type { Locale } from '../i18n';

export type { Locale };

export interface KnowledgeBody {
  kind: 'markdown' | 'html';
  source: string;
}

export interface KnowledgeArticle {
  slug: string;
  locale: Locale;
  pairSlug: string | null;
  categoryId: string;
  title: string;
  summary: string;
  readingTime: string;
  updatedAt: string;
  relatedTool: string;
  tags: string[];
  quickTakeaways: string[];
  body: KnowledgeBody;
  featured: boolean;
}

export interface KnowledgeIndex {
  source: string;
  sourceUrl: string;
  sourceCommit: string | null;
  generatedAt: string;
  articleCount: number;
  articles: KnowledgeArticle[];
}
