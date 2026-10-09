import Button from "@/components/ui/Button/Button";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bgGlow} />
      <div className={styles.content}>
        <span className={styles.eyebrow}>Дровяная печь · Свежие ингредиенты</span>
        <h1 className={styles.title}>
          Премиальная пицца
          <span className={styles.accent}> с характером</span>
        </h1>
        <p className={styles.description}>
          Тонкое тесто, авторские соусы и итальянские сыры.
          Каждая пицца — произведение кулинарного искусства.
        </p>
        <div className={styles.actions}>
          <a href="#menu">
            <Button size="lg" glow>
              Смотреть меню
            </Button>
          </a>
          <a href="#categories">
            <Button variant="outline" size="lg">
              Категории
            </Button>
          </a>
        </div>
      </div>
      <div className={styles.decor}>
        <div className={styles.ring} />
        <div className={styles.ring2} />
      </div>
    </section>
  );
}
