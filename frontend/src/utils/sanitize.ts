import DOMPurify from 'dompurify';

/** Etiquetas HTML permitidas en contenido de noticias (sin script, iframe, etc.) */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
  'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'span',
  'img',
];

/** Atributos permitidos (href en enlaces, src/alt en imágenes) */
const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'class'];

/**
 * Sanitiza HTML para evitar XSS. Solo permite etiquetas y atributos seguros.
 * Usar siempre antes de pasar contenido a dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

/** Extrae la URL de la primera imagen del HTML (para miniatura en listado). */
export function getFirstImageFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * Agrupa imágenes consecutivas del contenido en bloques de galería.
 * Si hay 2 o más <p><img></p> o <img> seguidas, las envuelve en <div class="noticia-gallery">.
 * Debe ejecutarse en el cliente (usa document).
 */
export function wrapImageGalleries(html: string): string {
  if (typeof document === 'undefined') return html;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;

  const isImageOnlyP = (el: Element): boolean => {
    if (el.tagName !== 'P') return false;
    const imgs = el.querySelectorAll('img');
    if (imgs.length !== 1) return false;
    const text = (el.textContent || '').trim();
    return text === '';
  };

  const getOneImgFromP = (p: Element): HTMLImageElement | null => {
    const img = p.querySelector('img');
    return img ? (img.cloneNode(true) as HTMLImageElement) : null;
  };

  const children = Array.from(wrap.children);
  const result: (Element | DocumentFragment)[] = [];
  let run: HTMLImageElement[] = [];

  const flushRun = () => {
    if (run.length >= 2) {
      const gallery = document.createElement('div');
      gallery.className = 'noticia-gallery';
      run.forEach((img) => gallery.appendChild(img));
      result.push(gallery);
    } else if (run.length === 1) {
      const p = document.createElement('p');
      p.appendChild(run[0]);
      result.push(p);
    }
    run = [];
  };

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.tagName === 'IMG') {
      run.push(el.cloneNode(true) as HTMLImageElement);
      continue;
    }
    if (isImageOnlyP(el)) {
      const img = getOneImgFromP(el);
      if (img) {
        run.push(img);
        continue;
      }
    }
    flushRun();
    result.push(el.cloneNode(true) as Element);
  }
  flushRun();

  wrap.innerHTML = '';
  result.forEach((node) => wrap.appendChild(node));
  return wrap.innerHTML;
}
