"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import styles from "./RegisterForm.module.css";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirm) {
      setError("Пароли не совпадают");
      return;
    }

    if (form.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        password: form.password,
        password_confirm: form.password_confirm,
        email: form.email || undefined,
        first_name: form.first_name || undefined,
        phone: form.phone || undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Регистрация</h2>
      <p className={styles.subtitle}>Создайте аккаунт и заказывайте премиальную пиццу </p>

      <div className={styles.row}>
        <Input
          label="Логин"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          placeholder="username"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Имя"
          value={form.first_name}
          onChange={(e) => update("first_name", e.target.value)}
          placeholder="Ваше имя"
        />
        <Input
          label="Телефон"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+7 (999) 000-00-00"
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Пароль"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="мин. 6 символов"
          required
          minLength={6}
        />
        <Input
          label="Повтор пароля"
          type="password"
          value={form.password_confirm}
          onChange={(e) => update("password_confirm", e.target.value)}
          placeholder="повторите пароль"
          required
          minLength={6}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Button type="submit" glow fullWidth disabled={loading}>
        {loading ? "Регистрация..." : "Создать аккаунт"}
      </Button>

      {onSwitchToLogin && (
        <p className={styles.switch}>
          Уже есть аккаунт?{" "}
          <button type="button" onClick={onSwitchToLogin} className={styles.link}>
            Войти
          </button>
        </p>
      )}
    </form>
  );
}
