import type { Product } from "@/lib/types";
import ProductCard from "@/components/catalog/ProductCard/ProductCard";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: Product[];
  favoriteIds?: Set<number>;
  onAddToCart?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  favoriteIds = new Set(),
  onAddToCart,
  onToggleFavorite,
  showActions = false,
  emptyMessage = "Товары не найдены",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🍕</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          isFavorite={favoriteIds.has(product.id)}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
