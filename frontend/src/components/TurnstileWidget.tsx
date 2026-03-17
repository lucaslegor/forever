import { useEffect, useRef, useId, useState } from 'react';

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const MOBILE_BREAKPOINT_PX = 480;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

export interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  /** Si no se pasa, en viewport <= 480px se usa 'compact' para que no se corte en móvil */
  size?: 'normal' | 'compact' | 'flexible';
}

export function TurnstileWidget({ siteKey, onVerify, onExpire, theme = 'light', size: sizeProp }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const uniqueId = useId().replace(/:/g, '-');
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const [effectiveSize, setEffectiveSize] = useState<'normal' | 'compact' | 'flexible'>(() =>
    typeof sizeProp === 'string' ? sizeProp : (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT_PX ? 'compact' : 'normal')
  );

  useEffect(() => {
    if (typeof sizeProp === 'string') {
      setEffectiveSize(sizeProp);
      return;
    }
    const check = () => setEffectiveSize(window.innerWidth <= MOBILE_BREAKPOINT_PX ? 'compact' : 'normal');
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [sizeProp]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const removeOurWidget = () => {
      if (widgetIdRef.current != null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };

    const runRender = () => {
      if (!window.turnstile || !containerRef.current) return;
      removeOurWidget();
      const container = containerRef.current;
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        theme,
        size: effectiveSize,
        callback: (token) => onVerifyRef.current(token),
        'expired-callback': () => {
          onExpireRef.current?.();
        },
      });
    };

    const existingScript = document.querySelector(`script[src="${TURNSTILE_SCRIPT}"]`);

    if (existingScript) {
      if (window.turnstile) {
        runRender();
      } else {
        const poll = setInterval(() => {
          if (window.turnstile) {
            clearInterval(poll);
            runRender();
          }
        }, 50);
        return () => {
          clearInterval(poll);
          removeOurWidget();
        };
      }
      return () => removeOurWidget();
    }

    if (window.turnstile) {
      runRender();
      return () => removeOurWidget();
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = runRender;
    document.head.appendChild(script);

    return () => {
      removeOurWidget();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [siteKey, theme, effectiveSize]);

  return <div ref={containerRef} id={`turnstile-${uniqueId}`} />;
}
