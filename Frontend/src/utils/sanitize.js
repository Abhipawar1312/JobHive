import DOMPurify from "dompurify";

/**
 * Sanitize untrusted user-generated HTML or Markdown to prevent Cross-Site Scripting (XSS).
 * @param {string} dirty Untrusted HTML or text content
 * @returns {string} Sanitized safe string
 */
export const sanitizeHtml = (dirty) => {
    if (!dirty || typeof dirty !== "string") return "";
    return DOMPurify.sanitize(dirty, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target", "rel"],
    });
};

/**
 * Sanitize Markdown source text before feeding into Markdown parser/editor.
 * Strips script tags, malicious onerror attributes, and javascript: URIs.
 * @param {string} markdownText Raw markdown string
 * @returns {string} Safe markdown string
 */
export const sanitizeMarkdown = (markdownText) => {
    if (!markdownText || typeof markdownText !== "string") return "";
    return DOMPurify.sanitize(markdownText);
};

export default sanitizeHtml;
