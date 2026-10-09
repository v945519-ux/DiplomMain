"use client";

import { useEffect, useState } from "react";
import LoginForm from "@/components/auth/LoginForm/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm/RegisterForm";
import styles from "./AuthModal.module.css";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
        {mode === "login" ? (
          <LoginForm
            onSuccess={onClose}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={onClose}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
}
