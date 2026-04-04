import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
}

const SITE_NAME = 'Swipe & Play Arcade';
const BASE_URL = 'https://swipe-and-play-arcade.lovable.app';
const OG_IMAGE = 'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8e5fb9f4-dbe7-4811-a928-e372d7ca3c0d/id-preview-49546593--e8516427-044c-4403-a88f-85e9c5ff9c88.lovable.app-1772445308102.png';

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function useSEO({ title, description, canonical, ogType = 'website' }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', OG_IMAGE, true);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);

    // Canonical
    const url = canonical ? `${BASE_URL}${canonical}` : window.location.href;
    setMeta('og:url', url, true);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }, [title, description, canonical, ogType]);
}
