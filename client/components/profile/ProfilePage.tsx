"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { mediaUrl } from "@/lib/images";
import type { Favorite, Order, UserProfile } from "@/lib/types";
import styles from "./ProfilePage.module.css";

function initials(profile: UserProfile | null, fallback: string) {
  const first = profile?.user.first_name?.[0] ?? fallback[0] ?? "P";
  const last = profile?.user.last_name?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [profileResponse, orderResponse, favoriteResponse] = await Promise.all([
        api.profile(),
        api.orders(),
        api.favorites(),
      ]);

      setProfile(profileResponse);
      setOrders(orderResponse);
      setFavorites(favoriteResponse);
      setForm({
        first_name: profileResponse.user.first_name || "",
        last_name: profileResponse.user.last_name || "",
        email: profileResponse.user.email || "",
        phone: profileResponse.phone || "",
        address: profileResponse.address || "",
      });
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const nextProfile = await api.updateProfile(form);
      setProfile(nextProfile);
      await refreshUser();
      setMessage("Профиль обновлен.");
    } catch (err) {
      setError(String(err));
    } finally {
      setPending(false);
    }
  };

  if (!user) {
    return (
      <section className={styles.authState}>
        <h1>Профиль доступен после входа</h1>
        <p>Авторизуйтесь, чтобы видеть адрес, избранное и историю заказов.</p>
        <Link href="/auth">Войти</Link>
      </section>
    );
  }

  const avatar = mediaUrl(profile?.avatar);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatar}>
          {avatar ? (
            <Image src={avatar} alt={user.username} fill sizes="112px" />
          ) : (
            <span>{initials(profile, user.username)}</span>
          )}
        </div>
        <div>
          <p className={styles.kicker}>Кабинет</p>
          <h1>{profile?.user.first_name || user.username}</h1>
          <p className={styles.subtitle}>
            {orders.length} заказов · {favorites.length} избранных позиций
          </p>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.success}>{message}</div>}

      {loading ? (
        <div className={styles.loading}>Загрузка профиля...</div>
      ) : (
        <div className={styles.layout}>
          <form className={styles.form} onSubmit={saveProfile}>
            <h2>Данные</h2>
            <div className={styles.split}>
              <label>
                Имя
                <input
                  value={form.first_name}
                  onChange={(event) =>
                    setForm((state) => ({
                      ...state,
                      first_name: event.target.value,
                    }))
                  }
                  autoComplete="given-name"
                />
              </label>
              <label>
                Фамилия
                <input
                  value={form.last_name}
                  onChange={(event) =>
                    setForm((state) => ({
                      ...state,
                      last_name: event.target.value,
                    }))
                  }
                  autoComplete="family-name"
                />
              </label>
            </div>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((state) => ({ ...state, email: event.target.value }))
                }
                autoComplete="email"
              />
            </label>
            <label>
              Телефон
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((state) => ({ ...state, phone: event.target.value }))
                }
                autoComplete="tel"
              />
            </label>
            <label>
              Адрес доставки
              <textarea
                value={form.address}
                onChange={(event) =>
                  setForm((state) => ({ ...state, address: event.target.value }))
                }
                rows={4}
              />
            </label>
            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? "Сохраняем" : "Сохранить изменения"}
            </button>
          </form>

          <aside className={styles.favorites}>
            <div className={styles.sectionTitle}>
              <h2>Избранное</h2>
              <Link href="/">В меню</Link>
            </div>
            {favorites.length ? (
              <div className={styles.favoriteList}>
                {favorites.slice(0, 4).map((favorite) => {
                  const image = mediaUrl(favorite.product.image);

                  return (
                    <article className={styles.favoriteItem} key={favorite.id}>
                      <div className={styles.favoriteImage}>
                        {image ? (
                          <Image
                            src={image}
                            alt={favorite.product.name}
                            fill
                            sizes="74px"
                          />
                        ) : (
                          <span>{favorite.product.name.slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <strong>{favorite.product.name}</strong>
                        <span>{formatPrice(favorite.product.price)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className={styles.muted}>Пока пусто.</p>
            )}
          </aside>
        </div>
      )}

      <section className={styles.orders}>
        <div className={styles.sectionTitle}>
          <h2>История заказов</h2>
          <Link href="/cart">Корзина</Link>
        </div>

        {orders.length ? (
          <div className={styles.orderList}>
            {orders.map((order) => (
              <article className={styles.order} key={order.id}>
                <div className={styles.orderHead}>
                  <div>
                    <span>#{order.id}</span>
                    <strong>{order.status_display}</strong>
                  </div>
                  <div>
                    <b>{formatPrice(order.total_price)}</b>
                    <time dateTime={order.created_at}>
                      {formatDate(order.created_at)}
                    </time>
                  </div>
                </div>
                <div className={styles.orderMeta}>
                  <span>{order.delivery_type_display}</span>
                  <span>{order.payment_method_display}</span>
                  <span>{order.phone}</span>
                </div>
                <ul className={styles.orderItems}>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span>
                        {item.product_name} x{item.quantity}
                      </span>
                      <strong>{formatPrice(item.subtotal)}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyOrders}>
            <h3>Заказов пока нет</h3>
            <p>После оформления история появится здесь.</p>
          </div>
        )}
      </section>
    </section>
  );
}
