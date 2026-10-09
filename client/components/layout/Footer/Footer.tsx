import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>Пиццерия Ронни<span aria-hidden="true">.</span></Link>
          <p>Пицца. Тепло. Вместе.</p>
        </div>
        <nav className={styles.nav} aria-label="Навигация в подвале">
          <Link href="/#menu">Меню</Link>
          <Link href="/cart">Корзина</Link>
          <Link href="/profile">Личный кабинет</Link>
        </nav>
        <div className={styles.info}>
          <p>Ежедневно 10:00 — 23:00</p>
          <small>© 2026 Пиццерия Ронни</small>
        </div>
      </div>
    </footer>
  );
}

