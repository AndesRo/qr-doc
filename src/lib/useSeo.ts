import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description?: string;
  noindex?: boolean;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Actualiza el <title> y las meta etiquetas relevantes para cada página de
 * la SPA. Las páginas administrativas se marcan como noindex para que no
 * queden expuestas en buscadores.
 */
export function useSeo({ title, description, noindex = false }: SeoOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
    }
    setMeta("og:title", title, "property");
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, noindex]);
}
