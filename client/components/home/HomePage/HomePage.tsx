"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import type { Category, Favorite, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Hero from "@/components/catalog/Hero/Hero";
import CategoryList from "@/components/catalog/CategoryList/CategoryList";
import ProductFilters from "@/components/catalog/ProductFilters/ProductFilters";
import ProductGrid from "@/components/catalog/ProductGrid/ProductGrid";
import Button from "@/components/ui/Button/Button";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { user } = useAuth();
  const { cart, addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [error, setError] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const loadProducts = useCallback(async (params?: Record<string, string>) => {
    try {
      const prods = await api.products(params);
      setProducts(prods.results);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const loadPublic = useCallback(async () => {
    try {
      const cats = await api.categories();
      setCategories(cats.results);
      await loadProducts();
    } catch (e) {
      setError(String(e));
    }
  }, [loadProducts]);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const f = await api.favorites();
      setFavorites(f);
    } catch (e) {
      setError(String(e));
    }
  }, [user]);

  useEffect(() => {
    loadPublic();
  }, [loadPublic]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleCategorySelect = async (slug: string) => {
    setCategoryFilter(slug);
    const params: Record<string, string> = {};
    if (slug) params.category_slug = slug;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    await loadProducts(params);
  };

  const handleFilter = async () => {
    const params: Record<string, string> = {};
    if (categoryFilter) params.category_slug = categoryFilter;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    await loadProducts(params);
  };

  const handleReset = async () => {
    setCategoryFilter("");
    setMinPrice("");
    setMaxPrice("");
    await loadProducts();
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId);
    } catch (e) {
      setError(String(e));
    }
  };

  const handleToggleFavorite = async (productId: number) => {
    const exists = favorites.some((f) => f.product.id === productId);
    try {
      if (exists) {
        await api.removeFavorite(productId);
      } else {
        await api.addFavorite(productId);
      }
      const f = await api.favorites();
      setFavorites(f);
    } catch (e) {
      setError(String(e));
    }
  };

  const favoriteIds = new Set(favorites.map((f) => f.product.id));

  return (
    <div className={styles.page}>
      <Header />
      <Hero />

      {error && (
        <div className={styles.error}>
          <button onClick={() => setError("")} className={styles.errorClose}>✕</button>
          {error}
        </div>
      )}

      <main className={styles.main}>
        <section id="categories" className={styles.section}>
          <h2 className={styles.sectionTitle}>Категории</h2>
          <CategoryList
            categories={categories}
            activeSlug={categoryFilter}
            onSelect={handleCategorySelect}
          />
        </section>

        <section id="menu" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Меню
              <span className={styles.count}>{products.length}</span>
            </h2>
            <ProductFilters
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onApply={handleFilter}
              onReset={handleReset}
            />
          </div>

          <ProductGrid
            products={products}
            favoriteIds={favoriteIds}
            onAddToCart={user ? handleAddToCart : undefined}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
            showActions={!!user}
          />
        </section>

        {user && cart && cart.total_items > 0 && (
          <section id="cart" className={styles.cartBanner}>
            <div className={styles.cartBannerInfo}>
              <span>В корзине {cart.total_items} поз.</span>
              <span className={styles.cartBannerPrice}>{formatPrice(cart.total_price)}</span>
            </div>
            <Link href="/cart">
              <Button glow>Перейти в корзину</Button>
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
