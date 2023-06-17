export default function isPortkeyApp() {
  const ua = navigator.userAgent;
  return ua.indexOf('Portkey') !== -1;
}
