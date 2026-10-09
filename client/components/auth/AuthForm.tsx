"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import styles from "./AuthForm.module.css";

type Mode = "login" | "register";

const initialRegisterState = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  password: "",
  password_confirm: "",
};

export function AuthForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [loginState, setLoginState] = useState({
    username: "",
    password: "",
  });
  const [registerState, setRegisterState] = useState(initialRegisterState);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      if (mode === "login") {
        await login(loginState.username, loginState.password);
      } else {
        if (registerState.password !== registerState.password_confirm) {
          setError("Пароли не совпадают");
          setPending(false);
          return;
        }
        await register(registerState);
      }
      router.push("/profile");
    } catch (err) {
      setError(String(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.visual}>
        <p className={styles.kicker}>Клуб пиццерии Ронни</p>
        <h1>Личный кабинет для любимых заказов</h1>
        <div className={styles.stats}>
          <span>Профиль</span>
          <span>История</span>
          <span>Повтор заказа</span>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Авторизация">
          <button
            className={mode === "login" ? styles.tabActive : styles.tab}
            type="button"
            onClick={() => setMode("login")}
          >
            Вход
          </button>
          <button
            className={mode === "register" ? styles.tabActive : styles.tab}
            type="button"
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "login" ? (
            <>
              <label>
                Логин
                <input
                  value={loginState.username}
                  onChange={(event) =>
                    setLoginState((state) => ({
                      ...state,
                      username: event.target.value,
                    }))
                  }
                  required
                  autoComplete="username"
                  placeholder="Введите логин"
                />
              </label>
              <label>
                Пароль
                <input
                  type="password"
                  value={loginState.password}
                  onChange={(event) =>
                    setLoginState((state) => ({
                      ...state,
                      password: event.target.value,
                    }))
                  }
                  required
                  autoComplete="current-password"
                  placeholder="Введите пароль"
                />
              </label>
            </>
          ) : (
            <>
              <div className={styles.split}>
                <label>
                  Имя
                  <input
                    value={registerState.first_name}
                    onChange={(event) =>
                      setRegisterState((state) => ({
                        ...state,
                        first_name: event.target.value,
                      }))
                    }
                    autoComplete="given-name"
                    placeholder="Ваше имя"
                  />
                </label>
                <label>
                  Фамилия
                  <input
                    value={registerState.last_name}
                    onChange={(event) =>
                      setRegisterState((state) => ({
                        ...state,
                        last_name: event.target.value,
                      }))
                    }
                    autoComplete="family-name"
                    placeholder="Ваша фамилия"
                  />
                </label>
              </div>
              <label>
                Логин
                <input
                  value={registerState.username}
                  onChange={(event) =>
                    setRegisterState((state) => ({
                      ...state,
                      username: event.target.value,
                    }))
                  }
                  required
                  autoComplete="username"
                  placeholder="Придумайте логин"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={registerState.email}
                  onChange={(event) =>
                    setRegisterState((state) => ({
                      ...state,
                      email: event.target.value,
                    }))
                  }
                  autoComplete="email"
                  placeholder="email@example.com"
                />
              </label>
              <label>
                Телефон
                <input
                  value={registerState.phone}
                  onChange={(event) =>
                    setRegisterState((state) => ({
                      ...state,
                      phone: event.target.value,
                    }))
                  }
                  autoComplete="tel"
                  placeholder="+7 (999) 000-00-00"
                />
              </label>
              <div className={styles.split}>
                <label>
                  Пароль
                  <input
                    type="password"
                    value={registerState.password}
                    onChange={(event) =>
                      setRegisterState((state) => ({
                        ...state,
                        password: event.target.value,
                      }))
                    }
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="мин. 6 символов"
                  />
                </label>
                <label>
                  Повтор пароля
                  <input
                    type="password"
                    value={registerState.password_confirm}
                    onChange={(event) =>
                      setRegisterState((state) => ({
                        ...state,
                        password_confirm: event.target.value,
                      }))
                    }
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="повторите пароль"
                  />
                </label>
              </div>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submit} type="submit" disabled={pending}>
            {pending
              ? "Подождите..."
              : mode === "login"
                ? "Войти"
                : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </section>
  );
}

