"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Button from "@/components/ui/Button/Button";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, updateQuantity, removeItem, refreshCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const profile = await api.profile();
      await api.createOrder({
        delivery_type: "delivery",
        payment_method: "card",
        phone: profile.phone || "+79990000000",
        delivery_address: profile.address || "Адрес не указан",
        comment: "Заказ с сайта",
      });
      router.push("/profile?tab=orders");
      await refreshCart();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.emptyState}>
          <h1>Корзина</h1>
          <p>Войдите в аккаунт, чтобы просматривать корзину</p>
          <Link href="/">
            <Button>На главную</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Корзина</h1>
          {cart && cart.total_items > 0 && (
            <span className={styles.badge}>{cart.total_items} поз.</span>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!cart || cart.items.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Корзина пуста — добавьте пиццу из меню</p>
            <Link href="/#menu">
              <Button glow>Перейти в меню</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <ul className={styles.list}>
              {cart.items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <Link href={`/products/${item.product.slug}`} className={styles.imageLink}>
                    <div className={styles.imageWrap}>
                      <Image
                        src={getImageUrl(item.product.image)}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className={styles.image}
                      />
                    </div>
                  </Link>

                  <div className={styles.itemInfo}>
                    <Link href={`/products/${item.product.slug}`} className={styles.itemName}>
                      {item.product.name}
                    </Link>
                    <span className={styles.itemPrice}>{formatPrice(item.product.price)}</span>
                  </div>

                  <div className={styles.qtyControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      aria-label="Уменьшить"
                    >
                      −
                    </button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Увеличить"
                    >
                      +
                    </button>
                  </div>

                  <span className={styles.subtotal}>{formatPrice(item.subtotal)}</span>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                    aria-label="Удалить"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <aside className={styles.summary}>
              <div className={styles.totalRow}>
                <span>Итого</span>
                <span className={styles.totalPrice}>{formatPrice(cart.total_price)}</span>
              </div>
              <Button glow fullWidth onClick={handleCheckout} disabled={loading}>
                {loading ? "Оформление..." : "Оформить заказ"}
              </Button>
              <Link href="/#menu" className={styles.continueLink}>
                Продолжить покупки
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
