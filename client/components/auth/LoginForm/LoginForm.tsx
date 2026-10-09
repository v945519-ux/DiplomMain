"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      onSuccess?.();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Вход</h2>
      <p className={styles.subtitle}>Добро пожаловать в премиальную пиццерию </p>

      <Input
        label="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Введите логин"
        required
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Введите пароль"
        required
      />

      {error && <div className={styles.error}>{error}</div>}

      <Button type="submit" glow fullWidth disabled={loading}>
        {loading ? "Вход..." : "Войти"}
      </Button>

      {onSwitchToRegister && (
        <p className={styles.switch}>
          Нет аккаунта?{" "}
          <button type="button" onClick={onSwitchToRegister} className={styles.link}>
            Зарегистрироваться
          </button>
        </p>
      )}
    </form>
  );
}
