import { describe, expect, it } from 'vitest';
import {
  extractMarkdownHeadings,
  renderMarkdown,
} from '../src/lib/knowledge/markdown';

const sample = `
## Heading Two

Intro paragraph with **bold** and \`code\` and [a link](https://example.com).

| A | B |
|---|---|
| 1 | 2 |

> **核心结论**
> Some core point.

- item one
- item two

$$Cpk = \\min(...)$$
`;

describe('markdown renderer', () => {
  it('renders headings, inline styles, links and code', () => {
    const html = renderMarkdown(sample);
    expect(html).toContain('<h2 id="sec-0">Heading Two</h2>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener">a link</a>');
  });

  it('renders tables with a scroll wrapper', () => {
    const html = renderMarkdown(sample);
    expect(html).toContain('<div class="table-wrap"><table>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders callouts with tone classes', () => {
    const html = renderMarkdown(sample);
    expect(html).toContain('<div class="callout core">');
    expect(html).toContain('<h3>核心结论</h3>');
  });

  it('renders ordered and unordered lists', () => {
    const html = renderMarkdown(sample);
    expect(html).toContain('<ul><li>item one</li><li>item two</li></ul>');
  });

  it('renders math blocks without external assets', () => {
    const html = renderMarkdown(sample);
    expect(html).toContain('class="formula"');
    expect(html).toContain('Cpk');
  });

  it('extracts headings with stable ids', () => {
    const headings = extractMarkdownHeadings(sample);
    expect(headings).toEqual([{ level: 2, text: 'Heading Two', id: 'sec-0' }]);
  });
});
