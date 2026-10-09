"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onAddToCart?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  showActions?: boolean;
  index?: number;
}

export default function ProductCard({
  product,
  isFavorite = false,
  onAddToCart,
  onToggleFavorite,
  showActions = false,
  index = 0,
}: ProductCardProps) {
  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <Link href={`/products/${product.slug}`} className={styles.imageLink}>
        <div className={styles.imageWrap}>
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className={styles.image}
          />
          <div className={styles.imageOverlay} />
          {product.is_popular && (
            <div className={styles.badgeWrap}>
              <Badge variant="popular">Хит</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          <Badge variant="accent">{product.category_name}</Badge>
          {product.weight && (
            <span className={styles.weight}>{product.weight} г</span>
          )}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        <p className={styles.description}>
          {product.description.length > 80
            ? product.description.slice(0, 80) + "…"
            : product.description}
        </p>

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.price)}</span>

          {showActions ? (
            <div className={styles.actions}>
              <button
                className={`${styles.favBtn} ${isFavorite ? styles.favActive : ""}`}
                onClick={() => onToggleFavorite?.(product.id)}
                aria-label="Избранное"
              >
                {isFavorite ? "★" : "☆"}
              </button>
              <Button
                size="sm"
                onClick={() => onAddToCart?.(product.id)}
              >
                В корзину
              </Button>
            </div>
          ) : (
            <Link href={`/products/${product.slug}`}>
              <Button variant="outline" size="sm">
                Подробнее
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className={styles.glowBorder} />
    </article>
  );
}
