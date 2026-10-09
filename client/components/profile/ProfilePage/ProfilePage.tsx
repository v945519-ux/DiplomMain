"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Order, ProfileUpdatePayload, UserProfile } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import styles from "./ProfilePage.module.css";

type Tab = "profile" | "orders";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "orders" ? "orders" : "profile";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<ProfileUpdatePayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([api.profile(), api.orders()]);
      setProfile(p);
      setOrders(o);
      setForm({
        first_name: p.user.first_name,
        last_name: p.user.last_name,
        email: p.user.email,
        phone: p.phone,
        address: p.address,
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      setSuccess("✅ Профиль сохранён");
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));

  if (!user) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <h1>🔐 Профиль</h1>
            <p>Войдите в аккаунт для доступа к профилю</p>
            <Button 
              variant="primary" 
              onClick={() => router.push("/")}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              На главную
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>👤 Личный кабинет</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "profile" ? styles.tabActive : ""}`}
            onClick={() => setTab("profile")}
          >
            📋 Профиль
          </button>
          <button
            className={`${styles.tab} ${tab === "orders" ? styles.tabActive : ""}`}
            onClick={() => setTab("orders")}
          >
            📦 История заказов
            {orders.length > 0 && <span className={styles.tabBadge}>{orders.length}</span>}
          </button>
        </div>

        {error && <div className={styles.error}>❌ {error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {loading ? (
          <div className={styles.loading}>
            <span style={{ color: "#c084fc" }}>⏳</span> Загрузка...
          </div>
        ) : tab === "profile" ? (
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <Input
                label="Имя"
                value={form.first_name || ""}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
              <Input
                label="Фамилия"
                value={form.last_name || ""}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Телефон"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
              />
              <div className={styles.fullWidth}>
                <Input
                  label="Адрес доставки"
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="ул. Примерная, д. 1, кв. 1"
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <span className={styles.username}>
                👋 Логин: <strong>{profile?.user.username}</strong>
              </span>
              <Button type="submit" glow disabled={saving}>
                {saving ? "💜 Сохранение..." : "💾 Сохранить изменения"}
              </Button>
            </div>
          </form>
        ) : (
          <div className={styles.orders}>
            {orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <p>📭 У вас пока нет заказов</p>
                <Button 
                  variant="primary" 
                  onClick={() => router.push("/#menu")}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  🍕 Перейти в меню
                </Button>
              </div>
            ) : (
              <ul className={styles.orderList}>
                {orders.map((order) => (
                  <li key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.orderId}>🆔 Заказ #{order.id}</span>
                        <span className={styles.orderDate}>📅 {formatDate(order.created_at)}</span>
                      </div>
                      <span className={`${styles.orderStatus} ${styles[`status_${order.status}`]}`}>
                        {order.status_display}
                      </span>
                    </div>

                    <ul className={styles.orderItems}>
                      {order.items.map((item) => (
                        <li key={item.id} className={styles.orderItem}>
                          <span>🍽️ {item.product_name}</span>
                          <span className={styles.orderItemQty}>× {item.quantity}</span>
                          <span className={styles.orderItemPrice}>{formatPrice(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.orderFooter}>
                      <div className={styles.orderMeta}>
                        <span>🚚 {order.delivery_type_display}</span>
                        <span>💳 {order.payment_method_display}</span>
                        {order.delivery_address && <span>📍 {order.delivery_address}</span>}
                      </div>
                      <span className={styles.orderTotal}>💰 {formatPrice(order.total_price)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
