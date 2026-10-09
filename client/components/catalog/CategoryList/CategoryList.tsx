// CategoryList.tsx
"use client";

import type { Category } from "@/lib/types";
import styles from "./CategoryList.module.css";

interface CategoryListProps {
  categories: Category[];
  activeSlug?: string;
  onSelect: (slug: string) => void;
}

export default function CategoryList({
  categories,
  activeSlug = "",
  onSelect,
}: CategoryListProps) {
  const totalCount = categories.reduce((sum, c) => sum + c.products_count, 0);

  return (
    <div className={styles.list}>
      <button
        className={`${styles.chip} ${!activeSlug ? styles.active : ""}`}
        onClick={() => onSelect("")}
      >
        {!activeSlug && <span className={styles.dot} />}
        Все
        <span className={styles.count}>{totalCount}</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.chip} ${activeSlug === cat.slug ? styles.active : ""}`}
          onClick={() => onSelect(cat.slug)}
        >
          {activeSlug === cat.slug && <span className={styles.dot} />}
          {cat.name}
          <span className={styles.count}>{cat.products_count}</span>
        </button>
      ))}
    </div>
  );
}