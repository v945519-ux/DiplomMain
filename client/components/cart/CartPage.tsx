"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { mediaUrl } from "@/lib/images";
import type { Cart, OrderChoices } from "@/lib/types";
import styles from "./CartPage.module.css";

const defaultForm = {
  delivery_type: "delivery",
  payment_method: "card",
  phone: "",
  delivery_address: "",
  comment: "",
};

export function CartPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [choices, setChoices] = useState<OrderChoices | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const notifyCartChanged = () => window.dispatchEvent(new Event("cart:changed"));

  const loadCartData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [cartResponse, profileResponse, choicesResponse] = await Promise.all([
        api.cart(),
        api.profile(),
        api.orderChoices(),
      ]);

      setCart(cartResponse);
      setChoices(choicesResponse);
      setForm((state) => ({
        ...state,
        phone: state.phone || profileResponse.phone,
        delivery_address: state.delivery_address || profileResponse.address,
      }));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!cart) return;
    setError("");

    try {
      const nextCart =
        quantity < 1
          ? await api.removeCartItem(itemId)
          : await api.updateCartItem(itemId, quantity);
      setCart(nextCart);
      notifyCartChanged();
    } catch (err) {
      setError(String(err));
    }
  };

  const clearCart = async () => {
    setError("");

    try {
      await api.clearCart();
      const nextCart = await api.cart();
      setCart(nextCart);
      notifyCartChanged();
    } catch (err) {
      setError(String(err));
    }
  };

  const createOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart?.total_items) return;

    setPending(true);
    setMessage("");
    setError("");

    try {
      const order = await api.createOrder(form);
      setMessage(`Заказ #${order.id} принят. Статус: ${order.status_display}.`);
      const nextCart = await api.cart();
      setCart(nextCart);
      setForm((state) => ({ ...state, comment: "" }));
      notifyCartChanged();
    } catch (err) {
      setError(String(err));
    } finally {
      setPending(false);
    }
  };

  if (!user) {
    return (
      <section className={styles.authState}>
        <h1>Корзина ждет входа</h1>
        <p>Войдите или создайте аккаунт, чтобы оформить заказ.</p>
        <Link href="/auth">Войти</Link>
      </section>
    );
  }

  const hasItems = Boolean(cart?.total_items);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Заказ</p>
          <h1>Корзина</h1>
        </div>
        {hasItems && (
          <button className={styles.clear} type="button" onClick={clearCart}>
            Очистить
          </button>
        )}
      </header>

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.success}>{message}</div>}

      {loading ? (
        <div className={styles.loading}>Загрузка корзины...</div>
      ) : hasItems && cart ? (
        <div className={styles.layout}>
          <div className={styles.items}>
            {cart.items.map((item) => {
              const image = mediaUrl(item.product.image);

              return (
                <article className={styles.item} key={item.id}>
                  <div className={styles.itemImage}>
                    {image ? (
                      <Image
                        src={image}
                        unoptimized={image.startsWith("/catalog/")}
                        alt={item.product.name}
                        fill
                        sizes="104px"
                      />
                    ) : (
                      <span>{item.product.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <span>{item.product.category_name}</span>
                    <h2>{item.product.name}</h2>
                    <p>{formatPrice(item.subtotal)}</p>
                  </div>
                  <div className={styles.counter}>
                    <button
                      type="button"
                      aria-label="Уменьшить"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <strong>{item.quantity}</strong>
                    <button
                      type="button"
                      aria-label="Увеличить"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className={styles.remove}
                    type="button"
                    onClick={() => updateQuantity(item.id, 0)}
                  >
                    Удалить
                  </button>
                </article>
              );
            })}
          </div>

          <form className={styles.checkout} onSubmit={createOrder}>
            <div className={styles.totalRow}>
              <span>Итого</span>
              <strong>{formatPrice(cart.total_price)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Позиции</span>
              <strong>{cart.total_items}</strong>
            </div>

            <label>
              Получение
              <select
                value={form.delivery_type}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    delivery_type: event.target.value,
                  }))
                }
              >
                {(choices?.delivery_types ?? []).map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Оплата
              <select
                value={form.payment_method}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    payment_method: event.target.value,
                  }))
                }
              >
                {(choices?.payment_methods ?? []).map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Телефон
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((state) => ({ ...state, phone: event.target.value }))
                }
                required
                autoComplete="tel"
              />
            </label>

            <label>
              Адрес
              <textarea
                value={form.delivery_address}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    delivery_address: event.target.value,
                  }))
                }
                required={form.delivery_type === "delivery"}
                rows={3}
              />
            </label>

            <label>
              Комментарий
              <textarea
                value={form.comment}
                onChange={(event) =>
                  setForm((state) => ({ ...state, comment: event.target.value }))
                }
                rows={3}
              />
            </label>

            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? "Оформляем" : "Оформить заказ"}
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>Корзина пустая</h2>
          <p>Добавьте пиццу из меню, и оформление появится здесь.</p>
          <Link href="/">Перейти в меню</Link>
        </div>
      )}
    </section>
  );
}
