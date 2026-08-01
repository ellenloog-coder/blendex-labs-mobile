export interface Heading {
  level: number;
  text: string;
  id: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, href: string) =>
      `<a href="${href}" target="_blank" rel="noopener">${label}</a>`,
  );
  return out;
}

function renderTable(rows: string[]): string {
  const cells = rows.map((row) =>
    row.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()),
  );
  const header = cells[0] ?? [];
  const body = cells.slice(2).filter((row) => row.some((cell) => cell !== ''));
  return (
    '<div class="table-wrap"><table><thead><tr>' +
    header.map((cell) => `<th>${renderInline(cell)}</th>`).join('') +
    '</tr></thead><tbody>' +
    body
      .map(
        (row) =>
          '<tr>' + row.map((cell) => `<td>${renderInline(cell)}</td>`).join('') + '</tr>',
      )
      .join('') +
    '</tbody></table></div>'
  );
}

function renderCallout(text: string): string {
  const labelMatch = text.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)/);
  let tone = 'note';
  if (/核心结论|Core conclusion/i.test(text)) tone = 'core';
  else if (/工程注意|Engineering note/i.test(text)) tone = 'caution';
  else if (/常见误区|Common misconception/i.test(text)) tone = 'misconception';
  const label = labelMatch?.[1]?.trim() ?? '';
  const body = (labelMatch?.[2] ?? text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${renderInline(line)}</p>`)
    .join('');
  return `<div class="callout ${tone}">${
    label ? `<h3>${escapeHtml(label)}</h3>` : ''
  }${body}</div>`;
}

/** Renders the markdown subset used by the knowledge base (trusted bundled content). */
export function renderMarkdown(markdown: string): string {
  const math: string[] = [];
  const text = markdown.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_match, body: string) => {
    math.push(body.trim());
    return `\n@@MATH:${math.length - 1}@@\n`;
  });

  const lines = text.split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let quote: string[] = [];
  let table: string[] | null = null;
  let headingIndex = 0;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listType) {
      const tag = listType;
      html.push(
        `<${tag}>${listItems
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join('')}</${tag}>`,
      );
      listType = null;
      listItems = [];
    }
  };
  const flushQuote = () => {
    if (quote.length > 0) {
      html.push(renderCallout(quote.join('\n')));
      quote = [];
    }
  };
  const flushTable = () => {
    if (table) {
      html.push(renderTable(table));
      table = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const mathMatch = /^@@MATH:(\d+)@@$/.exec(line);
    if (mathMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      html.push(
        `<div class="formula" role="img" aria-label="formula">${escapeHtml(
          math[Number(mathMatch[1])],
        )}</div>`,
      );
      continue;
    }
    if (/^\s*$/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      continue;
    }
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      const level = heading[1].length;
      html.push(`<h${level} id="sec-${headingIndex++}">${renderInline(heading[2])}</h${level}>`);
      continue;
    }
    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      html.push('<hr />');
      continue;
    }
    if (line.startsWith('|')) {
      flushParagraph();
      flushList();
      flushQuote();
      table = table ?? [];
      table.push(line);
      continue;
    }
    if (table) flushTable();
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      flushQuote();
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(bullet[1]);
      continue;
    }
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (numbered) {
      flushParagraph();
      flushQuote();
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(numbered[1]);
      continue;
    }
    if (listType) flushList();
    if (line.startsWith('>')) {
      flushParagraph();
      flushList();
      quote.push(line.replace(/^>\s?/, ''));
      continue;
    }
    if (quote.length > 0) flushQuote();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();
  flushTable();
  return html.join('\n');
}

export function extractMarkdownHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      id: `sec-${index++}`,
    });
  }
  return headings;
}

export function extractHtmlHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/g;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: Number(match[1]),
      text: match[2].replace(/<[^>]+>/g, '').trim(),
      id: `sec-${index++}`,
    });
  }
  return headings;
}
