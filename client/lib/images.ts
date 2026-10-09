import { API_ORIGIN } from "./api";
import catalogImages from "./catalog-images.json";

const localImages: Record<string, string> = catalogImages;

export function mediaUrl(src?: string | null) {
  if (!src) return "";
  if (/^(data:|blob:)/i.test(src)) return src;
  let relative = src;
  if (/^https?:/i.test(src)) {
    const url = new URL(src);
    if (url.origin !== new URL(API_ORIGIN).origin) return src;
    relative = decodeURIComponent(url.pathname);
  }
  const clean = relative.replace(/^\/+/, "");
  const mediaPath = clean.startsWith("media/") ? clean : `media/${clean}`;
  // Existing photos are pre-sized WebP assets served without a Django round trip.
  // New uploads keep working through the normal media endpoint until the next sync.
  return localImages[mediaPath] || `${API_ORIGIN}/${mediaPath}`;
}
