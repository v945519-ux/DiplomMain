"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import styles from "./AppShell.module.css";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const cart = await api.cart();
      setCartCount(cart.total_items);
    } catch {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  useEffect(() => {
    window.addEventListener("cart:changed", loadCartCount);
    return () => window.removeEventListener("cart:changed", loadCartCount);
  }, [loadCartCount]);

  const navItems = [
    { href: "/", label: "Меню" },
    { href: "/cart", label: `Корзина${cartCount ? ` (${cartCount})` : ""}` },
    { href: "/profile", label: "Профиль" },
  ];

  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skipLink">К содержимому</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Пиццерия Ронни">
          <span className={styles.mark} aria-hidden="true">
            <Image src="/ronni-chef.webp" alt="" width={60} height={60} loading="eager" unoptimized />
          </span>
          <span>
            <small>Пиццерия</small>
            <strong>Ронни</strong>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Основная навигация">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cx(styles.navLink, pathname === item.href && styles.active)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.account}>
          {user ? (
            <>
              <span className={styles.username}>
                {user.first_name || user.username}
              </span>
              <button
                className={styles.ghostButton}
                type="button"
                onClick={() => {
                  logout();
                  setCartCount(0);
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <Link className={styles.cta} href="/auth">
              Войти
            </Link>
          )}
        </div>
      </header>

      <main className={styles.main} id="main-content" tabIndex={-1}>{children}</main>
    </div>
  );
}
