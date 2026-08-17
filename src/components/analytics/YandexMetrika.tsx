"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

interface YandexMetrikaProps {
  counterId: string;
}

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  }
}

export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const id = Number(counterId);
  const pathname = usePathname();
  const skipNextHit = useRef(true);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    if (skipNextHit.current) {
      skipNextHit.current = false;
      return;
    }
    window.ym?.(id, "hit", window.location.href);
  }, [id, pathname]);

  if (!Number.isFinite(id) || id <= 0) return null;

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
ym(${id}, 'init', {
  ssr: true,
  webvisor: false,
  clickmap: true,
  ecommerce: 'dataLayer',
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce: true,
  trackLinks: true
});
          `.trim(),
        }}
      />
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: "absolute", left: -9999 }}
            alt="Yandex Metrika"
          />
        </div>
      </noscript>
    </>
  );
}
