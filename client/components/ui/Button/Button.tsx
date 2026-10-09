import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  glow = false,
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    glow ? styles.glow : "",
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      <span className={styles.content}>{children}</span>
    </button>
  );
}
