import type { Locale } from '../i18n';

export interface KnowledgeCategory {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const categories: KnowledgeCategory[] = [
  {
    id: 'methodology',
    name: {
      en: 'Methodology & Standards',
      'zh-CN': '方法论与标准解读',
    },
    description: {
      en: 'Clear explanations of quality methods, standards and decision logic.',
      'zh-CN': '清晰解释质量方法、标准要求与决策逻辑。',
    },
  },
  {
    id: 'engineering',
    name: {
      en: 'Engineering Best Practices',
      'zh-CN': '工程最佳实践',
    },
    description: {
      en: 'Practical workflows, checklists and controls that teams can apply.',
      'zh-CN': '可直接应用的工程流程、检查清单与控制方法。',
    },
  },
  {
    id: 'intelligence',
    name: {
      en: 'Quality Engineering Intelligence Insights',
      'zh-CN': '质量工程智能化',
    },
    description: {
      en: 'Insights on how data and engineering methods are changing quality work.',
      'zh-CN': '关于数据与工程方法如何改变质量工程工作的洞察。',
    },
  },
];

export function getCategory(id: string): KnowledgeCategory | undefined {
  return categories.find((category) => category.id === id);
}
