// CatalogPage.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category, Favorite, Product } from "@/lib/types";
import styles from "./CatalogPage.module.css";

export function CatalogPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [ordering, setOrdering] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const productRequest = useRef(0);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.product.id)),
    [favorites],
  );

  const loadProducts = useCallback(async () => {
    const request = ++productRequest.current;
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (categorySlug) params.category_slug = categorySlug;
    if (ordering) params.ordering = ordering;
    if (popularOnly) params.is_popular = "true";

    const response = await api.products(params);
    if (request === productRequest.current) setProducts(response.results);
  }, [categorySlug, ordering, popularOnly, search]);

  const loadPublicData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [categoryResponse] = await Promise.all([api.categories(), loadProducts()]);
      setCategories(categoryResponse.results);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      setFavorites(await api.favorites());
    } catch {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const requireAuth = () => {
    if (user) return true;
    router.push("/auth");
    return false;
  };

  const handleAddToCart = async (productId: number) => {
    if (!requireAuth()) return;

    setBusyProductId(productId);
    setError("");

    try {
      await api.addToCart(productId);
      window.dispatchEvent(new Event("cart:changed"));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusyProductId(null);
    }
  };

  const handleFavorite = async (productId: number) => {
    if (!requireAuth()) return;

    setError("");
    try {
      if (favoriteIds.has(productId)) {
        await api.removeFavorite(productId);
      } else {
        await api.addFavorite(productId);
      }
      setFavorites(await api.favorites());
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Пиццерия Ронни · Хорошо быть вместе</p>
          <h1>Тёплый вечер.<br />Любимые люди.<br /><em>Та самая пицца.</em></h1>
          <p>
            Золотистая корочка, тянущийся сыр и ваши любимые начинки.
            Соберите всех за одним столом. Мы позаботимся о пицце.
          </p>
          <div className={styles.heroActions}>
            <a href="#menu" className={styles.primaryLink}>
              Выбрать пиццу <span aria-hidden="true">↗</span>
            </a>
            <span>Для маленьких и больших поводов</span>
          </div>
        </div>

        <div className={styles.heroProduct}>
          <div className={styles.heroImage}>
            <Image src="/hero-pizza.webp" alt="Пепперони с золотистой корочкой" fill preload sizes="(max-width: 580px) 80vw, (max-width: 800px) 45vw, 520px" />
          </div>
          <div className={styles.heroMeta}>
            <span>Рецепт хорошего вечера</span>
            <strong>Пицца + ваша компания</strong>
            <b aria-hidden="true">♡</b>
          </div>
          <span className={styles.leaf} aria-hidden="true" />
        </div>
      </section>

      <div className={styles.perks}>
        <span><b aria-hidden="true">✳</b> Пицца на любой вкус</span>
        <span><b aria-hidden="true">♡</b> Для уютных встреч</span>
        <span><b aria-hidden="true">↗</b> Доставка и самовывоз</span>
      </div>

      <section className={styles.toolbar} id="menu">
        <div>
          <p className={styles.kicker}>Найдите свою любимую</p>
          <h2>Что будем заказывать?</h2>
          <p className={styles.resultCount} role="status">
            {loading ? "Загружаем ассортимент…" : `Показано товаров: ${products.length}`}
          </p>
        </div>

        <form
          className={styles.filters}
          onSubmit={(event) => {
            event.preventDefault();
            loadProducts().catch((err) => setError(String(err)));
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Название или ингредиент"
            aria-label="Поиск"
          />
          <select
            value={categorySlug}
            onChange={(event) => setCategorySlug(event.target.value)}
            aria-label="Категория"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={ordering}
            onChange={(event) => setOrdering(event.target.value)}
            aria-label="Сортировка"
          >
            <option value="">Сначала фирменные</option>
            <option value="price">Сначала дешевле</option>
            <option value="-price">Сначала дороже</option>
            <option value="name">По названию</option>
          </select>
          <button
            className={popularOnly ? styles.toggleActive : styles.toggle}
            type="button"
            onClick={() => setPopularOnly((value) => !value)}
            aria-pressed={popularOnly}
          >
            Хиты
          </button>
          <button className={styles.filterButton} type="submit">
            Найти
          </button>
        </form>
      </section>

      <div className={styles.categoryRow}>
        <button
          className={!categorySlug && !search && !popularOnly ? styles.categoryActive : styles.category}
          type="button"
          onClick={() => {
            setCategorySlug("");
            setSearch("");
            setPopularOnly(false);
          }}
          aria-pressed={!categorySlug && !search && !popularOnly}
        >
          Всё меню
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={
              categorySlug === category.slug ? styles.categoryActive : styles.category
            }
            type="button"
            onClick={() => setCategorySlug(category.slug)}
            aria-pressed={categorySlug === category.slug}
          >
            {category.name}
            <span>{category.products_count}</span>
          </button>
        ))}
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.grid} role="status" aria-label="Загрузка меню" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className={styles.skeleton} key={index} />
          ))}
        </div>
      ) : products.length ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.has(product.id)}
              onAdd={handleAddToCart}
              onFavorite={handleFavorite}
              busy={busyProductId === product.id}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте другую категорию или более широкий поиск.</p>
        </div>
      )}
    </div>
  );
}


