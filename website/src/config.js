// Exports shared configuration values for the website
// Keep minimal to avoid bundling overhead.

export const DOCS_URL = (import.meta?.env?.VITE_DOCS_URL) || '/docs';
