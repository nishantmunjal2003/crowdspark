import React, { useEffect } from 'react';

const BASE_URL = 'https://crowdspark.nishantmunjal.com';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

export default function SEO({
    title = 'CrowdSpark - Interactive Live Quizzes & Polls',
    description = 'Create AI-powered quizzes, host live interactive sessions with real-time gamified leaderboards, instant feedback, and seamless mobile participation.',
    keywords = 'interactive quizzes, live polls, AI quiz generator, classroom gamification, audience engagement platform, live leaderboards, real-time assessment, Kahoot alternative, CrowdSpark',
    canonicalPath = '',
    ogType = 'website',
    ogImage = DEFAULT_IMAGE,
    structuredData = null
}) {
    useEffect(() => {
        // 1. Update Title
        const fullTitle = title.includes('CrowdSpark') ? title : `${title} | CrowdSpark`;
        document.title = fullTitle;

        // Helper to update or create meta tags
        const updateMeta = (attrName, attrVal, content) => {
            if (!content) return;
            let elem = document.querySelector(`meta[${attrName}="${attrVal}"]`);
            if (!elem) {
                elem = document.createElement('meta');
                elem.setAttribute(attrName, attrVal);
                document.head.appendChild(elem);
            }
            elem.setAttribute('content', content);
        };

        // 2. Primary Meta Tags
        updateMeta('name', 'description', description);
        updateMeta('name', 'keywords', keywords);

        // 3. Canonical Link
        const canonicalUrl = `${BASE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);

        // 4. Open Graph Tags
        updateMeta('property', 'og:title', fullTitle);
        updateMeta('property', 'og:description', description);
        updateMeta('property', 'og:url', canonicalUrl);
        updateMeta('property', 'og:type', ogType);
        updateMeta('property', 'og:image', ogImage);
        updateMeta('property', 'og:site_name', 'CrowdSpark');

        // 5. Twitter Card Tags
        updateMeta('name', 'twitter:card', 'summary_large_image');
        updateMeta('name', 'twitter:title', fullTitle);
        updateMeta('name', 'twitter:description', description);
        updateMeta('name', 'twitter:image', ogImage);

        // 6. Dynamic JSON-LD Structured Data for Route
        let scriptElem = document.getElementById('route-structured-data');
        if (structuredData) {
            if (!scriptElem) {
                scriptElem = document.createElement('script');
                scriptElem.id = 'route-structured-data';
                scriptElem.type = 'application/ld+json';
                document.head.appendChild(scriptElem);
            }
            scriptElem.textContent = JSON.stringify(structuredData);
        } else if (scriptElem) {
            scriptElem.remove();
        }

    }, [title, description, keywords, canonicalPath, ogType, ogImage, structuredData]);

    return null;
}
