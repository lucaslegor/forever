import { useEffect } from 'react';

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://cscdforever.com';
const DEFAULT_TITLE = 'Club Social Cultural y Deportivo For Ever La Plata';
const DEFAULT_DESCRIPTION =
  'Sistema de pagos online, cuotas y alquiler de cancha del Club Social Cultural y Deportivo For Ever, La Plata.';

export interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  /** Para noticias: título de la noticia en el title */
  articleTitle?: string;
}

function getOrCreateMeta(name: string, attribute: 'name' | 'property'): HTMLMetaElement {
  const selector = attribute === 'name' ? `meta[name="${name}"]` : `meta[property="${name}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  const el = getOrCreateMeta(name, attribute);
  el.setAttribute('content', content);
}

export function Seo({ title, description, path = '', noIndex, articleTitle }: SeoProps) {
  const fullTitle = articleTitle ? `${articleTitle} | ${DEFAULT_TITLE}` : (title || DEFAULT_TITLE);
  const fullDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = path ? `${SITE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : SITE_URL;
  useEffect(() => {
    document.title = fullTitle;
    setMeta('description', fullDescription);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', fullDescription, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', fullDescription);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
  }, [fullTitle, fullDescription, canonicalUrl, noIndex]);

  return null;
}
