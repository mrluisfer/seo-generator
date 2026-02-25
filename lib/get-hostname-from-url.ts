export function getHostnameFromUrl(url: string): string | null {
  if (!url) {
    return null;
  }

  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch {
    return null;
  }
}
