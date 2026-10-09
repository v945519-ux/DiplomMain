import styles from "./Badge.module.css";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "popular" | "accent";
}

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
