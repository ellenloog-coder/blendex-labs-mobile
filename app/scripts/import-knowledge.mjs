#!/usr/bin/env node
/**
 * Mobile-side knowledge content adapter (Phase 0.2).
 *
 * Reads the existing Blendex Labs knowledge repository (read-only), normalizes
 * bilingual articles, copies referenced images into the app, and generates a
 * bundled offline content index at src/content/knowledge.generated.json.
 *
 * Usage:
 *   npm run import:knowledge
 *   KNOWLEDGE_SOURCE=/path/to/knowledge npm run import:knowledge
 *
 * The source repository is never modified.
 */
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SOURCE = '/Users/ellen/Documents/main toolkit/quality-engineering-tools/knowledge';
const sourceDir = path.resolve(process.env.KNOWLEDGE_SOURCE ?? DEFAULT_SOURCE);
const appRoot = fileURLToPath(new URL('..', import.meta.url));
const outFile = path.join(appRoot, 'src/content/knowledge.generated.json');
const assetsDir = path.join(appRoot, 'public/knowledge-assets');

const CATEGORY_MAP = [
  { id: 'methodology', names: ['方法论与标准解读', 'Methodology & Standards'] },
  { id: 'engineering', names: ['工程最佳实践', 'Engineering Best Practices'] },
  { id: 'intelligence', names: ['质量工程智能化', 'Quality Engineering Intelligence Insights'] },
];

function categoryId(category) {
  const entry = CATEGORY_MAP.find((c) => c.names.includes(String(category).trim()));
  if (!entry) throw new Error(`Unknown category in source content: ${category}`);
  return entry.id;
}

function localeOf(slug) {
  return slug.endsWith('-en') ? 'en' : 'zh-CN';
}

/* --- YAML frontmatter (subset used by the knowledge base) --- */
function parseValue(raw) {
  let value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
  }
  return value.replace(/^"|"$/g, '');
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return null;
  const data = {};
  let key = null;
  for (const rawLine of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z]+):\s*(.*)$/.exec(rawLine);
    if (kv) {
      key = kv[1];
      data[key] = parseValue(kv[2]);
    } else if (key && /^-\s+(.+)$/.test(rawLine.trim())) {
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push(rawLine.trim().replace(/^-\s+/, '').replace(/^"|"$/g, ''));
    }
  }
  return data;
}

/* --- HTML article extraction --- */
function extractBetween(html, openTag) {
  const start = html.indexOf(openTag);
  if (start < 0) return null;
  const contentStart = start + openTag.length;
  let depth = 1;
  let i = contentStart;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf('<section', i);
    const nextClose = html.indexOf('</section>', i);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + '<section'.length;
    } else {
      depth -= 1;
      i = nextClose + '</section>'.length;
    }
  }
  return html.slice(contentStart, depth === 0 ? i - '</section>'.length : undefined);
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
}

function extractMetaText(html, selector) {
  const match = html.match(new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`));
  return match ? stripTags(match[1]) : '';
}

function extractListItems(html) {
  const items = [];
  const listMatch = html.match(/<ul>([\s\S]*?)<\/ul>/);
  if (listMatch) {
    for (const li of listMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/g)) {
      items.push(stripTags(li[1]));
    }
  }
  return items;
}

function extractMetaRegion(html, className) {
  const region = html.match(
    new RegExp(`<div[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/div>`),
  );
  if (!region) return [];
  return [...region[1].matchAll(/<span>([\s\S]*?)<\/span>/g)].map((m) => stripTags(m[1]));
}

function extractClassText(html, className) {
  const region = html.match(
    new RegExp(
      `class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/[a-z]+>` +
        `|class="[^"]*${className}[^"]*"[^>]*/>`,
    ),
  );
  return region ? stripTags(region[1] ?? '') : '';
}

async function extractHtmlArticle(filePath) {
  const html = await readFile(filePath, 'utf8');
  const fileSlug = path.basename(filePath, '.html');
  const metaMatch = html.match(
    /<script type="application\/json" id="article-metadata">([\s\S]*?)<\/script>/,
  );
  let meta = null;
  if (metaMatch) {
    try {
      meta = JSON.parse(metaMatch[1]);
    } catch {
      meta = null;
    }
  }

  const body = extractBetween(html, '<section data-article-body>') ?? '';
  const takeawayItems = extractListItems(html.match(/quick-takeaways([\s\S]*?)<\/section>/)?.[0] ?? '');
  const metaSpans = extractMetaRegion(html, 'article-meta');

  const updatedMatch = html.match(/(\d{4}-\d{2}-\d{2})/);
  const title =
    meta?.title ??
    extractMetaText(html, 'h1') ??
    extractMetaText(html, 'title').replace(/\s*\|\s*Blendex Labs$/, '');
  const category = meta?.category ?? extractClassText(html, 'article-category');
  const summary =
    meta?.summary ??
    html.match(/<meta name="description" content="([^"]+)"/)?.[1] ??
    extractMetaText(html, 'p');

  return {
    slug: meta?.slug ?? fileSlug,
    title,
    category,
    summary,
    readingTime: meta?.readingTime ?? metaSpans[0] ?? '',
    updatedAt: meta?.updatedAt ?? updatedMatch?.[1] ?? '',
    relatedTool: meta?.relatedTool ?? metaSpans[1] ?? '',
    tags: meta?.tags ?? [],
    quickTakeaways: meta?.quickTakeaways ?? takeawayItems,
    bodyHtml: body,
  };
}

/* --- Markdown article extraction --- */
async function extractMarkdownArticle(filePath) {
  const text = await readFile(filePath, 'utf8');
  const meta = parseFrontmatter(text);
  if (!meta) throw new Error(`Missing frontmatter in ${filePath}`);
  let body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  body = body.replace(/^\s*#\s+[^\n]+\n?/, ''); // remove leading H1 (title is metadata)
  return {
    slug: meta.slug,
    title: meta.title,
    category: meta.category,
    summary: meta.summary,
    readingTime: meta.readingTime,
    updatedAt: meta.updatedAt,
    relatedTool: meta.relatedTool,
    tags: meta.tags ?? [],
    quickTakeaways: meta.quickTakeaways ?? [],
    bodyMarkdown: body.trim(),
  };
}

/* --- Image copying (local, offline) --- */
async function copyBodyImages(articleDir, bodyHtml) {
  const srcs = [...bodyHtml.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  let out = bodyHtml;
  for (const src of srcs) {
    if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) continue;
    const resolved = path.resolve(articleDir, src);
    const basename = path.basename(resolved);
    try {
      await copyFile(resolved, path.join(assetsDir, basename));
      out = out.split(`src="${src}"`).join(`src="/knowledge-assets/${basename}"`);
    } catch {
      // leave as-is
    }
  }
  return out;
}

/* --- Main --- */
async function main() {
  await mkdir(assetsDir, { recursive: true });
  await mkdir(path.dirname(outFile), { recursive: true });

  const allFiles = (await readdir(sourceDir)).filter(
    (name) => /\.(md|html)$/.test(name) && !name.startsWith('index') && !name.includes('template'),
  );
  const mdBases = new Set(
    allFiles.filter((name) => name.endsWith('.md')).map((name) => name.replace(/\.md$/, '')),
  );
  // Prefer the markdown source when an article has both .md and .html representations.
  const files = allFiles.filter(
    (name) => name.endsWith('.md') || !mdBases.has(name.replace(/\.html$/, '')),
  );

  const raw = [];
  for (const name of files.sort()) {
    const filePath = path.join(sourceDir, name);
    const text = await readFile(filePath, 'utf8');
    if (name.endsWith('.md')) {
      raw.push({ name, meta: await extractMarkdownArticle(filePath), md: true });
    } else if (text.includes('data-article-body')) {
      const meta = await extractHtmlArticle(filePath);
      meta.bodyHtml = await copyBodyImages(path.dirname(filePath), meta.bodyHtml);
      raw.push({ name, meta, html: true });
    }
  }

  const slugs = new Set(raw.map((item) => item.meta.slug));
  const articles = raw.map(({ meta }) => {
    const slug = meta.slug;
    const locale = localeOf(slug);
    const pairSlug = locale === 'en' ? slug.replace(/-en$/, '') : `${slug}-en`;
    return {
      slug,
      locale,
      pairSlug: slugs.has(pairSlug) ? pairSlug : null,
      categoryId: categoryId(meta.category),
      title: meta.title,
      summary: meta.summary ?? '',
      readingTime: meta.readingTime ?? '',
      updatedAt: meta.updatedAt ?? '',
      relatedTool: meta.relatedTool ?? '',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      quickTakeaways: Array.isArray(meta.quickTakeaways) ? meta.quickTakeaways : [],
      body: meta.bodyMarkdown
        ? { kind: 'markdown', source: meta.bodyMarkdown }
        : { kind: 'html', source: meta.bodyHtml ?? '' },
      featured: slug === 'ai-transforming-quality-engineering',
    };
  });

  articles.sort((a, b) => a.slug.localeCompare(b.slug));

  const output = {
    source: 'main toolkit/quality-engineering-tools/knowledge (read-only)',
    generatedAt: new Date().toISOString(),
    articleCount: articles.length,
    articles,
  };

  await writeFile(outFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Imported ${articles.length} articles -> ${path.relative(appRoot, outFile)}`);
  for (const a of articles) {
    console.log(`  [${a.locale}] ${a.slug} (${a.categoryId}) pair=${a.pairSlug ?? '-'}`);
  }
}

main().catch((error) => {
  console.error('Knowledge import failed:', error.message);
  process.exit(1);
});
