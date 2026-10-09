"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductDetail } from "@/lib/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import styles from "./ProductDetailView.module.css";

interface ProductDetailViewProps {
  product: ProductDetail;
  isFavorite?: boolean;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  showActions?: boolean;
  pending?: boolean;
}

export default function ProductDetailView({
  product,
  isFavorite = false,
  onAddToCart,
  onToggleFavorite,
  showActions = false,
  pending = false,
}: ProductDetailViewProps) {
  const image = getImageUrl(product.image);
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>
        ← Назад к меню
      </Link>

      <div className={styles.layout}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrap}>
            <Image
              src={image}
              unoptimized={image.startsWith("/catalog/")}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.image}
              preload
            />
            <div className={styles.imageGlow} />
          </div>
          {product.is_popular && (
            <div className={styles.popularBadge}>
              <Badge variant="popular">Хит продаж</Badge>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.meta}>
            <Badge variant="accent">{product.category_name}</Badge>
            {product.weight && (
              <span className={styles.weight}>{product.weight} г</span>
            )}
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          {showActions && (
            <div className={styles.actions}>
              <Button size="lg" onClick={onAddToCart} disabled={pending}>
                {pending ? "Добавляем…" : "Добавить в корзину"}
              </Button>
              <button
                className={`${styles.favBtn} ${isFavorite ? styles.favActive : ""}`}
                onClick={onToggleFavorite}
                aria-pressed={isFavorite}
              >
                {isFavorite ? "★ В избранном" : "☆ В избранное"}
              </button>
            </div>
          )}

          {!showActions && (
            <p className={styles.authHint}>
              <Link href="/auth" className={styles.authLink}>
                Войдите или зарегистрируйтесь
              </Link>
              , чтобы добавить в корзину
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
