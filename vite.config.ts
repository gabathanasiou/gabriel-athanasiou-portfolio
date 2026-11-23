import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

interface SiteMeta {
    title: string;
    name: string;
    description: string;
    url: string;
    ogImage: string;
    colorScheme: 'light' | 'dark';
    themeColor: string;
    htmlClass: string;
    fonts: string;
}

const SITES: Record<'directing' | 'postproduction', SiteMeta> = {
    directing: {
        title: 'GABRIEL ATHANASIOU | Director',
        name: 'GABRIEL ATHANASIOU',
        description: 'Director based in London & Athens. Narrative, Commercial, Music Video.',
        url: 'https://directedbygabriel.com',
        ogImage: 'https://res.cloudinary.com/date24ay6/image/upload/v1772822180/portfolio-config-directing-defaultOg.jpg',
        colorScheme: 'dark',
        themeColor: '#050505',
        htmlClass: 'dark-theme',
        fonts: 'family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400',
    },
    postproduction: {
        title: 'LEMON POST | Freelance Colorist & Editor | London',
        name: 'Lemon Post',
        description: 'Fresh post-production services. Specializing in DaVinci Resolve Colour Grading and Creative Editing. Elevate your footage with Lemon Post. Watch the portfolio.',
        url: 'https://lemonpost.studio',
        ogImage: 'https://res.cloudinary.com/date24ay6/image/upload/v1772845699/portfolio-config-postproduction-defaultOg.jpg',
        colorScheme: 'light',
        themeColor: '#ffffff',
        htmlClass: 'light-theme',
        fonts: 'family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700',
    },
};

/**
 * Writes the per-portfolio static head at build time.
 *
 * Without this, both domains ship the directing site's title, canonical and
 * og:url, and social crawlers (which do not run JavaScript) never see the
 * correct metadata for lemonpost.studio.
 */
/**
 * Build the per-portfolio llms.txt index.
 *
 * Google Search ignores llms.txt, but Chrome Lighthouse's agentic-browsing
 * audit validates it, and coding agents can use it as a compact site map.
 */
function buildLlmsTxt(portfolioMode: 'directing' | 'postproduction'): string {
    const site = SITES[portfolioMode];
    const isPost = portfolioMode === 'postproduction';
    const pages: Array<[string, string, string]> = isPost
        ? [
            ['Home', '/', 'Featured post-production work and showreel.'],
            ['All Work', '/work', 'Colour grading and editing portfolio.'],
            ['About', '/about', 'Studio profile and contact.'],
        ]
        : [
            ['Home', '/', 'Featured directing work and showreel.'],
            ['Filmography', '/work', 'Narrative, commercial and music video projects.'],
            ['Journal', '/journal', 'Notes and behind-the-scenes writing.'],
            ['About', '/about', 'Biography and contact.'],
            ['Game', '/game', 'Filmography trivia.'],
        ];

    return [
        `# ${site.name} - ${isPost ? 'Post-Production' : 'Director'}`,
        '',
        `> ${site.description}`,
        '',
        '## Pages',
        ...pages.map(([label, path, description]) => `- [${label}](${site.url}${path}): ${description}`),
        '',
        '## Machine-readable',
        `- [Sitemap](${site.url}/sitemap.xml)`,
        '',
    ].join('\n');
}

function portfolioHtmlPlugin(portfolioMode: 'directing' | 'postproduction'): Plugin {
    const site = SITES[portfolioMode];
    const llmsTxt = buildLlmsTxt(portfolioMode);
    const fontHref = `https://fonts.googleapis.com/css2?${site.fonts}&display=swap`;
    const fontLinks = [
        `<link rel="preload" as="style" href="${fontHref}">`,
        `<link href="${fontHref}" rel="stylesheet" media="print" onload="this.media='all'">`,
        `<noscript><link href="${fontHref}" rel="stylesheet"></noscript>`,
    ].join('\n    ');

    return {
        name: 'portfolio-html-meta',
        transformIndexHtml: {
            order: 'pre',
            handler(html) {
                return html
                    .replaceAll('__HTML_CLASS__', site.htmlClass)
                    .replaceAll('__COLOR_SCHEME__', site.colorScheme)
                    .replaceAll('__THEME_COLOR__', site.themeColor)
                    .replaceAll('__SITE_TITLE__', site.title)
                    .replaceAll('__SITE_NAME__', site.name)
                    .replaceAll('__SITE_DESCRIPTION__', site.description)
                    .replaceAll('__OG_IMAGE__', site.ogImage)
                    .replaceAll('__SITE_URL__', site.url)
                    .replaceAll('__FONT_LINKS__', fontLinks);
            },
        },
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'llms.txt',
                source: llmsTxt,
            });
        },
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const pathname = (req.url || '').split('?')[0];
                if (pathname !== '/llms.txt') {
                    next();
                    return;
                }
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end(llmsTxt);
            });
        },
    };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const portfolioMode = (env.VITE_PORTFOLIO_MODE || process.env.VITE_PORTFOLIO_MODE || 'directing') as 'directing' | 'postproduction';

    return {
      plugins: [portfolioHtmlPlugin(portfolioMode), react()],
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          overlay: true,
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
      },
    };
});
