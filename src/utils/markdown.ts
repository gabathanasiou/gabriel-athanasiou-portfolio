
// Renders Airtable rich text (Markdown) to HTML for dangerouslySetInnerHTML.
//
// Post content is untrusted CMS input. Escape HTML first, then generate the
// markup ourselves: raw HTML in a post renders as literal text, and link
// destinations are scheme-checked. The data pipeline sanitizes the same field
// at the output boundary; this is the render-boundary backstop for the case
// where the JSON is written by hand.

const DANGEROUS_URL = /^(javascript|vbscript|data|file|blob|about|chrome|jar):/i;

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

/** Decode the entity tricks a browser accepts inside an href. */
const decodeEntities = (value: string): string =>
    value
        .replace(/&amp;/gi, '&')
        .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);?/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
        .replace(/&colon;/gi, ':')
        .replace(/&tab;|&newline;/gi, '');

/** True for URLs a browser would execute or treat as a local file. */
const isUnsafeDestination = (destination: string): boolean => {
    const normalized = decodeEntities(destination)
        .replace(/[\u0000-\u0020\u007f]/g, '')
        .toLowerCase();
    return DANGEROUS_URL.test(normalized);
};

// Simple Markdown Parser for Airtable Rich Text
export const parseMarkdown = (markdown: string) => {
    if (!markdown) return '';

    let html = escapeHtml(markdown);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Links — the destination is already attribute-safe (quotes escaped), so
    // only executable schemes need rejecting. The balanced-paren group keeps
    // destinations like `.../a_(b)` intact; a trailing quoted title is stripped.
    html = html.replace(
        /\[([^\]\n]*)\]\(\s*((?:[^()\n]|\([^()\n]*\))*)\)/g,
        (match, label, rawDestination) => {
            const destination = rawDestination.replace(/\s+&quot;[^&]*&quot;\s*$/, '').trim();
            if (isUnsafeDestination(destination)) return label;
            return `<a href="${destination}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        }
    );

    // Lists (Unordered)
    html = html.replace(/^\s*-\s+(.*)/gim, '<ul><li>$1</li></ul>');
    // Fix consecutive lists
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Blockquotes (`>` was escaped to `&gt;` above)
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

    // Line breaks into paragraphs
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(p => {
        // Wrap in <p> if it's not already a header or list
        if (!p.match(/^<(h|ul|blockquote)/)) {
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }
        return p;
    }).join('');

    return html;
};

/** Plain text for card previews: drop the markup, restore the escaped characters. */
export const htmlToText = (html: string): string =>
    html
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
