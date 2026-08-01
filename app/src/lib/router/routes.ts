import type { Component } from 'svelte';
import HomePage from '../pages/HomePage.svelte';
import WorkspacePage from '../pages/WorkspacePage.svelte';
import AssistantPage from '../pages/AssistantPage.svelte';
import ReportsPage from '../pages/ReportsPage.svelte';
import MorePage from '../pages/MorePage.svelte';
import KnowledgeHomePage from '../pages/knowledge/KnowledgeHomePage.svelte';
import KnowledgeCategoryPage from '../pages/knowledge/KnowledgeCategoryPage.svelte';
import ArticleReaderPage from '../pages/knowledge/ArticleReaderPage.svelte';
import ToolPreviewPage from '../pages/ToolPreviewPage.svelte';
import ReportDetailPage from '../pages/ReportDetailPage.svelte';

export type RouteName =
  | 'home'
  | 'workspace'
  | 'assistant'
  | 'reports'
  | 'more'
  | 'knowledge'
  | 'knowledge-category'
  | 'knowledge-article'
  | 'tool-preview'
  | 'report-detail';

export type RouteParams = Record<string, string>;

export interface AppRoute {
  path: string;
  name: RouteName;
  component: Component;
  titleKey: string;
  showNav?: boolean;
  hideAppHeader?: boolean;
  matcher: (path: string) => RouteParams | null;
}

function patternMatcher(pattern: string): (path: string) => RouteParams | null {
  const keys: string[] = [];
  const parts = pattern.split('/').map((segment) => {
    if (segment.startsWith(':')) {
      keys.push(segment.slice(1));
      return '([^/]+)';
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  const regex = new RegExp(`^${parts.join('/')}$`);
  return (path: string): RouteParams | null => {
    const match = regex.exec(path);
    if (!match) return null;
    const params: RouteParams = {};
    keys.forEach((key, index) => {
      params[key] = decodeURIComponent(match[index + 1]);
    });
    return params;
  };
}

export const routes: AppRoute[] = [
  { path: '/', name: 'home', component: HomePage, titleKey: 'nav.home', matcher: patternMatcher('/') },
  { path: '/workspace', name: 'workspace', component: WorkspacePage, titleKey: 'nav.workspace', matcher: patternMatcher('/workspace') },
  { path: '/assistant', name: 'assistant', component: AssistantPage, titleKey: 'nav.assistant', matcher: patternMatcher('/assistant') },
  { path: '/reports', name: 'reports', component: ReportsPage, titleKey: 'nav.reports', matcher: patternMatcher('/reports') },
  { path: '/more', name: 'more', component: MorePage, titleKey: 'nav.more', matcher: patternMatcher('/more') },
  { path: '/knowledge', name: 'knowledge', component: KnowledgeHomePage, titleKey: 'knowledge.title', matcher: patternMatcher('/knowledge') },
  {
    path: '/knowledge/category/:categoryId',
    name: 'knowledge-category',
    component: KnowledgeCategoryPage,
    titleKey: 'knowledge.title',
    matcher: patternMatcher('/knowledge/category/:categoryId'),
  },
  {
    path: '/knowledge/article/:slug',
    name: 'knowledge-article',
    component: ArticleReaderPage,
    titleKey: 'knowledge.title',
    showNav: false,
    hideAppHeader: true,
    matcher: patternMatcher('/knowledge/article/:slug'),
  },
  {
    path: '/workspace/tool/:toolId',
    name: 'tool-preview',
    component: ToolPreviewPage,
    titleKey: 'nav.workspace',
    matcher: patternMatcher('/workspace/tool/:toolId'),
  },
  {
    path: '/reports/:reportId',
    name: 'report-detail',
    component: ReportDetailPage,
    titleKey: 'nav.reports',
    matcher: patternMatcher('/reports/:reportId'),
  },
];

export interface RouteMatch {
  route: AppRoute;
  params: RouteParams;
}

export function matchRoute(path: string): RouteMatch {
  for (const route of routes) {
    const params = route.matcher(path);
    if (params) return { route, params };
  }
  return { route: routes[0], params: {} };
}
