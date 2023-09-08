export function getUrl() {
  return new URL(location.href);
}
const getHost = (url: string) => new URL(url).host;
export function getFaviconUrl(url: string, size = 50): string {
  return `https://icon.horse/icon/${getHost(url)}/${size}`;
}
