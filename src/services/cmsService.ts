import { Project, BlogPost, HomeConfig } from '../types';
import { calculateReadingTime } from '../utils/helpers/textHelpers';

// Re-export commonly used utilities for backwards compatibility
export { getEmbedUrl } from '../utils/videoHelpers';
export { calculateReadingTime };

// ==========================================
// TYPES
// ==========================================

interface ApiResponse {
    projects: Project[];
    posts: BlogPost[];
    config: HomeConfig;
}

// ==========================================
// CACHE MANAGEMENT
// ==========================================

let cachedData: ApiResponse | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes client-side cache

// ==========================================
// DATA FETCHING FROM CLOUDINARY CDN
// ==========================================

// jsDelivr CDN URL for static portfolio data (primary source)
// detect portfolio mode from environment variable (set per Netlify site)
const PORTFOLIO_MODE = import.meta.env.VITE_PORTFOLIO_MODE || 'directing';
const JSDELIVR_DATA_URL = `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@data/${PORTFOLIO_MODE}/portfolio-data.json`;
const LOCAL_DATA_URL = `/${PORTFOLIO_MODE}/portfolio-data.json`;

// Generate cache-busting URL with timestamp
const getCacheBustedUrl = (baseUrl: string): string => {
    const timestamp = Date.now();
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}_t=${timestamp}`;
};

if (import.meta.env.DEV) {
    console.log(`[cmsService] 🏁 Initialized in ${PORTFOLIO_MODE} mode`);
    console.log(`[cmsService] 🌍 CDN URL: ${JSDELIVR_DATA_URL}`);
    console.log(`[cmsService] 🏠 Local URL: ${LOCAL_DATA_URL}`);
}

const fetchCachedData = async (): Promise<ApiResponse> => {
    // Check if cache is still valid
    if (cachedData && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
        if (import.meta.env.DEV) console.log('[cmsService] Using client-side cache');
        return cachedData;
    }

    // Try jsDelivr CDN first (primary source)
    try {
        // Add timestamp to bypass CDN cache and get fresh data
        const freshUrl = getCacheBustedUrl(JSDELIVR_DATA_URL);
        if (import.meta.env.DEV) console.log('[cmsService] Fetching fresh data from jsDelivr CDN');

        const response = await fetch(freshUrl, {
            cache: 'no-store' // Bypass browser cache
        });

        if (!response.ok) {
            throw new Error(`Cloudinary fetch failed: ${response.statusText}`);
        }

        const data = await response.json();

        cachedData = {
            projects: data.projects || [],
            posts: data.posts || [],
            config: data.config || getDefaultConfig()
        };
        cacheTimestamp = Date.now();

        if (import.meta.env.DEV) {
            console.log(`[cmsService] ✅ Loaded from jsDelivr: ${cachedData.projects.length} projects, ${cachedData.posts.length} posts`);
        }

        return cachedData;
    } catch (jsdelivrError) {
        if (import.meta.env.DEV) {
            console.warn('[cmsService] ⚠️ jsDelivr fetch failed, trying local fallback:', jsdelivrError);
        }

        // Fallback 1: Preferred local folder path (/${mode}/portfolio-data.json)
        try {
            const localUrl = getCacheBustedUrl(LOCAL_DATA_URL);
            if (import.meta.env.DEV) console.log(`[cmsService] Trying local fallback (folder path): ${localUrl}`);

            const response = await fetch(localUrl);

            // Verify it's actually JSON and not an SPA fallback HTML page
            const contentType = response.headers.get('content-type');
            if (!response.ok || !contentType?.includes('application/json')) {
                throw new Error(`Local fetch failed or returned non-JSON: ${response.status}`);
            }

            const data = await response.json();
            return processLoadedData(data, 'Local Folder');
        } catch (localFolderError) {
            console.error('[cmsService] ❌ Both jsDelivr and primary Local Folder fetch failed');
            console.error('jsDelivr error:', jsdelivrError);
            console.error('Local folder error:', localFolderError);

            if (cachedData) return cachedData;

            return {
                projects: [],
                posts: [],
                config: getDefaultConfig()
            };
        }
    }
};

// Helper to handle data processing and logging
const processLoadedData = (data: any, source: string): ApiResponse => {
    cachedData = {
        projects: data.projects || [],
        posts: data.posts || [],
        config: data.config || getDefaultConfig()
    };
    cacheTimestamp = Date.now();

    if (import.meta.env.DEV) {
        console.log(`[cmsService] ✅ Loaded from ${source}: ${cachedData.projects.length} projects, ${cachedData.posts.length} posts`);
        console.log(`[cmsService]    Portfolio ID from data: ${cachedData.config.portfolioId}`);
    }

    return cachedData;
};

// Default config fallback
const getDefaultConfig = (): HomeConfig => ({
    showreel: {
        enabled: false,
        videoUrl: '',
        placeholderImage: ''
    },
    contact: {
        email: '',
        phone: '',
        repUK: '',
        repUSA: '',
        instagram: '',
        vimeo: '',
        linkedin: ''
    },
    about: {
        bio: "Gabriel Athanasiou is a director and visual artist based between London and Athens.",
        profileImage: ''
    },
    allowedRoles: [],
    defaultOgImage: ''
});

// ==========================================
// PUBLIC API
// ==========================================

export const cmsService = {
    /**
     * Fetch all data (projects, posts, config) from cached endpoint
     */
    fetchAll: async (): Promise<ApiResponse> => {
        return fetchCachedData();
    },

    /**
     * Get home page configuration
     */
    getHomeConfig: async (): Promise<HomeConfig> => {
        const data = await fetchCachedData();
        return data.config;
    },

    /**
     * Get all projects
     */
    getProjects: async (): Promise<Project[]> => {
        const data = await fetchCachedData();
        return data.projects;
    },

    /**
     * Get all blog posts
     */
    getBlogPosts: async (): Promise<BlogPost[]> => {
        const data = await fetchCachedData();
        return data.posts;
    },

    /**
     * Force refresh cache (call after manual sync or when checking for updates)
     */
    invalidateCache: () => {
        cachedData = null;
        cacheTimestamp = null;
        if (import.meta.env.DEV) console.log('[cmsService] Cache invalidated');
    },

    /**
     * Check if there are updates available (non-blocking background check)
     */
    checkForUpdates: async (): Promise<boolean> => {
        if (!cachedData) return false;

        try {
            const response = await fetch('/.netlify/functions/get-data', {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) return false;

            const newData = await response.json();
            const lastUpdatedHeader = response.headers.get('X-Last-Updated');

            // Simple check: compare data lengths
            const hasUpdates =
                newData.projects?.length !== cachedData.projects.length ||
                newData.posts?.length !== cachedData.posts.length;

            if (hasUpdates) {
                if (import.meta.env.DEV) console.log('[cmsService] Updates detected');
            }

            return hasUpdates;
        } catch (error) {
            if (import.meta.env.DEV) console.warn('[cmsService] Update check failed:', error);
            return false;
        }
    }
};
