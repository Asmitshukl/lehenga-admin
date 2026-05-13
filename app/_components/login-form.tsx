"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { adminRequest } from "../_lib/admin-api";
import { setAdminToken } from "../_lib/admin-auth";

type LoginResponse = {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await adminRequest<LoginResponse>("/admin/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setAdminToken(response.token);
      router.push("/");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Unable to login right now",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-auth-form" onSubmit={handleSubmit}>
      <label className="admin-field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@lehenga.com"
          required
        />
      </label>

      <label className="admin-field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />
      </label>

      {error ? <p className="admin-error-banner">{error}</p> : null}

      <button type="submit" className="admin-primary-button" disabled={loading}>
        {loading ? "Signing in..." : "Enter admin"}
      </button>
    </form>
  );
}
