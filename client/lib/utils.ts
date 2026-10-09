import { mediaUrl } from "./images";

export function getImageUrl(path: string | null | undefined): string {
  return mediaUrl(path) || "/placeholder-pizza.svg";
}

export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(num);
}
