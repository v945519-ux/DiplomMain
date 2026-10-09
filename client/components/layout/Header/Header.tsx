"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import Button from "@/components/ui/Button/Button";
import AuthModal from "@/components/auth/AuthModal/AuthModal";
import styles from "./Header.module.css";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = cart?.total_items ?? 0;
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>⧫</span>
            <div>
              <span className={styles.logoName}>Пиццерия Ронни</span>
              <span className={styles.logoTag}>BEST PIZZA</span>
            </div>
          </Link>

          <nav className={styles.nav}>
            <Link href="/#menu" className={styles.navLink}>
              Меню
            </Link>
            <Link href="/#categories" className={styles.navLink}>
              Категории
            </Link>
            {user && (
              <>
                <Link href="/cart" className={styles.navLink}>
                  Корзина
                  {cartCount > 0 && (
                    <span className={styles.badge}>{cartCount}</span>
                  )}
                </Link>
                <Link href="/profile" className={styles.navLink}>
                  Профиль
                </Link>
              </>
            )}
          </nav>

          <div className={styles.actions}>
            {user ? (
              <div className={styles.userBlock}>
                <Link href="/profile" className={styles.greeting}>
                  Привет, <strong>{user.username}</strong>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className={styles.logoutButton}
                >
                  Выйти
                </Button>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuth("login")}
                  className={styles.loginButton}
                >
                  Войти
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openAuth("register")}
                  className={styles.registerButton}
                >
                  Регистрация
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
