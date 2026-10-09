"use client";

import type { Cart } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button/Button";
import styles from "./CartSection.module.css";

interface CartSectionProps {
  cart: Cart | null;
  onCheckout: () => void;
  loading?: boolean;
}

export default function CartSection({ cart, onCheckout, loading }: CartSectionProps) {
  if (!cart) return null;

  return (
    <section id="cart" className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Корзина</h2>
        <span className={styles.count}>{cart.total_items} поз.</span>
      </div>

      {cart.items.length === 0 ? (
        <p className={styles.empty}>Корзина пуста — добавьте пиццу из меню</p>
      ) : (
        <>
          <ul className={styles.list}>
            {cart.items.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.product.name}</span>
                  <span className={styles.itemQty}>× {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>

          <div className={styles.total}>
            <span>Итого</span>
            <span className={styles.totalPrice}>{formatPrice(cart.total_price)}</span>
          </div>

          <Button glow fullWidth onClick={onCheckout} disabled={loading}>
            {loading ? "Оформление..." : "Оформить заказ"}
          </Button>
        </>
      )}
    </section>
  );
}
