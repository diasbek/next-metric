/** Official Meta Pixel snippet — must appear as a raw <script> in <head>
 *  so Event Manager / Pixel Helper can detect `fbq` without waiting for
 *  Next.js client hydration. */
export const FACEBOOK_PIXEL_ID = "1564976404618400";

export function getFacebookPixelInitScript(pixelId: string): string {
  const id = pixelId.trim();
  if (!id) return "";

  return `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
`.trim();
}

export function getFacebookPixelNoscriptUrl(pixelId: string): string {
  const id = pixelId.trim();
  if (!id) return "";
  return `https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`;
}
