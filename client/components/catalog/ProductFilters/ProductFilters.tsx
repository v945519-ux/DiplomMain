// ProductFilters.tsx
"use client";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import styles from "./ProductFilters.module.css";

interface ProductFiltersProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function ProductFilters({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onApply,
  onReset,
}: ProductFiltersProps) {
  return (
    <div className={styles.filters}>
      <Input
        type="number"
        placeholder="Мин. цена"
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Макс. цена"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
      />
      <Button onClick={onApply}>Применить</Button>
      <Button variant="ghost" onClick={onReset}>
        Сбросить
      </Button>
    </div>
  );
}