// ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/images";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onAdd: (productId: number) => void;
  onFavorite: (productId: number) => void;
  busy?: boolean;
}

export function ProductCard({
  product,
  isFavorite,
  onAdd,
  onFavorite,
  busy,
}: ProductCardProps) {
  const image = mediaUrl(product.image);

  return (
    <article className={styles.card}>
      <Link href={`/products/${product.slug}`} className={styles.imageWrap} aria-label={product.name}>
        {product.is_popular && <span className={styles.badge}>Хит</span>}
        {image ? (
          <Image
            className={styles.image}
            src={image}
            unoptimized={image.startsWith("/catalog/")}
            alt={product.name}
            fill
            sizes="(max-width: 580px) 90vw, (max-width: 800px) 45vw, (max-width: 1100px) 30vw, 300px"
            loading="lazy"
          />
        ) : (
          <Image src="/placeholder-pizza.svg" alt={product.name} fill className={styles.image} sizes="300px" />
        )}
      </Link>

      <div className={styles.body}>
        <div>
          <p className={styles.category}>{product.category_name}</p>
          <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
          {product.description && <p className={styles.description}>{product.description}</p>}
        </div>

        <div className={styles.meta}>
          <span>{formatPrice(product.price)}</span>
          {product.weight ? <small>{product.weight} г</small> : <small>фирменный размер</small>}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.primary}
            type="button"
            disabled={busy}
            onClick={() => onAdd(product.id)}
          >
            {busy ? "Добавляем" : "В корзину"}
          </button>
          <button
            className={isFavorite ? styles.favoriteActive : styles.favorite}
            type="button"
            onClick={() => onFavorite(product.id)}
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? "Убрать из избранного" : "В избранное"}: ${product.name}`}
            title={isFavorite ? "Убрать из избранного" : "В избранное"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>
          </button>
        </div>
      </div>
    </article>
  );
}
