"use client";

import { ChangeEvent, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import styles from "./page.module.css";

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: ChangeEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Não foi possível autenticar.");
        return;
      }

      router.replace("/scraper");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Acesso restrito</h1>
        <input
          className={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button
          type="submit"
          label={loading ? "Entrando..." : "Entrar"}
          disabled={loading || password.length === 0}
        />
      </form>
    </div>
  );
}
