import type { Metadata } from "next";

import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "Lehenga Admin Login",
  description: "Login for the Lehenga admin dashboard",
};

export default function LehengaAdminLoginPage() {
  return (
    <main className="admin-auth-page">
      <section className="admin-auth-hero">
        <span className="admin-eyebrow">Lehenga Admin</span>
        <h1>Manage every edit from one warm, polished control room.</h1>
        <p>
          Add collections, publish lehengas, and build jewellery assortments that match the main
          storefront aesthetic.
        </p>
      </section>

      <section className="admin-auth-card">
        <div className="admin-panel-heading">
          <h2>Sign in</h2>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
