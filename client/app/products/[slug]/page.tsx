"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Favorite, ProductDetail } from "@/lib/types";
import ProductDetailView from "@/components/product/ProductDetailView/ProductDetailView";
import styles from "./page.module.css";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      const p = await api.product(slug);
      setProduct(p);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const f = await api.favorites();
      setFavorites(f);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleAddToCart = async () => {
    if (!product || pending) return;
    setPending(true);
    try {
      await api.addToCart(product.id);
      window.dispatchEvent(new Event("cart:changed"));
      setAdded(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setPending(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    const exists = favorites.some((f) => f.product.id === product.id);
    try {
      if (exists) {
        await api.removeFavorite(product.id);
      } else {
        await api.addFavorite(product.id);
      }
      const f = await api.favorites();
      setFavorites(f);
    } catch (e) {
      setError(String(e));
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Товар не найден</h2>
          <p>{error || "Проверьте ссылку"}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isFavorite = favorites.some((f) => f.product.id === product.id);

  return (
    <div className={styles.page}>
      {error && <div className={styles.errorBanner} role="alert">{error}</div>}
      {added && <div className={styles.successBanner} role="status">Добавлено в корзину!</div>}
      <ProductDetailView
        product={product}
        isFavorite={isFavorite}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        showActions={!!user}
        pending={pending}
      />
    </div>
  );
}
