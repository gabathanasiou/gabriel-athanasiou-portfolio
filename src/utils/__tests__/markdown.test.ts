import { describe, it, expect } from 'vitest';
import { parseMarkdown, htmlToText } from '../markdown';

describe('parseMarkdown', () => {
  it('returns an empty string for empty input', () => {
    expect(parseMarkdown('')).toBe('');
    expect(parseMarkdown(undefined as unknown as string)).toBe('');
  });

  it('escapes raw HTML instead of executing it', () => {
    const html = parseMarkdown('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<img');
    expect(html).not.toMatch(/<img[^>]*onerror/i);
    expect(html).toContain('&lt;img');
  });

  it('escapes script and style payloads', () => {
    const html = parseMarkdown('<script>alert(1)</script><style>*{display:none}</style>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<style');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes quotes so a destination cannot break out of the href', () => {
    const html = parseMarkdown('[x](https://example.com/" onmouseover="alert(1))');
    expect(html).not.toContain('onmouseover="alert');
  });

  it('drops executable markdown link destinations and keeps the label', () => {
    expect(parseMarkdown('[click](javascript:alert(1))')).toBe('<p>click</p>');
    expect(parseMarkdown('[click](JaVaScRiPt:alert(1))')).toBe('<p>click</p>');
    expect(parseMarkdown('[click](java\tscript:alert(1))')).toBe('<p>click</p>');
    expect(parseMarkdown('[click](&#106;avascript:alert(1))')).toBe('<p>click</p>');
    expect(parseMarkdown('[click](data:text/html;base64,PHNjcmlwdD4=)')).toBe('<p>click</p>');
  });

  it('keeps safe links and hardens the anchor', () => {
    expect(parseMarkdown('[site](https://example.com)')).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a>'
    );
    expect(parseMarkdown('[mail](mailto:hi@example.com)')).toContain('href="mailto:hi@example.com"');
    expect(parseMarkdown('[rel](/work/film)')).toContain('href="/work/film"');
    expect(parseMarkdown('[anchor](#top)')).toContain('href="#top"');
  });

  it('renders the supported markdown subset', () => {
    expect(parseMarkdown('# Title')).toContain('<h1>Title</h1>');
    expect(parseMarkdown('## Title')).toContain('<h2>Title</h2>');
    expect(parseMarkdown('### Title')).toContain('<h3>Title</h3>');
    expect(parseMarkdown('**bold**')).toContain('<strong>bold</strong>');
    expect(parseMarkdown('*italic*')).toContain('<em>italic</em>');
    expect(parseMarkdown('- one\n- two')).toContain('<li>one</li>');
    expect(parseMarkdown('> quote')).toContain('<blockquote>quote</blockquote>');
    expect(parseMarkdown('one\n\ntwo')).toBe('<p>one</p><p>two</p>');
  });

  it('preserves ampersands and angle brackets as text', () => {
    expect(parseMarkdown('Tom & Jerry')).toBe('<p>Tom &amp; Jerry</p>');
    expect(parseMarkdown('a < b')).toBe('<p>a &lt; b</p>');
  });
});

describe('htmlToText', () => {
  it('strips tags and restores escaped characters for previews', () => {
    expect(htmlToText(parseMarkdown('**Tom & Jerry** <b>x</b>'))).toBe('Tom & Jerry <b>x</b>');
  });
});
