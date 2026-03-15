import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
}

const BASE_URL = "https://www.littleherolibrary.com";
const SITE_NAME = "Little Hero Library";

export function useSEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    const fullTitle =
      title === SITE_NAME
        ? `${title} — Personalised Bedtime Stories for Children`
        : `${title} | ${SITE_NAME}`;

    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical ? `${BASE_URL}${canonical}` : BASE_URL);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    // Update canonical link
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical ? `${BASE_URL}${canonical}` : BASE_URL);
  }, [title, description, canonical]);
}
