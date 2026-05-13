"use client";

import { useEffect, useState } from "react";

import { type DashboardData, fetchDashboardData } from "../_lib/admin-api";

const emptyData: DashboardData = {
  collections: [],
  lehengas: [],
  jewellery: [],
};

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const dashboardData = await fetchDashboardData();

        if (cancelled) {
          return;
        }

        setData(dashboardData);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const statCards = [
    {
      label: "Active collections",
      value: data.collections.length,
      hint: "Seasonal and event-led edits",
    },
    {
      label: "Lehengas in catalog",
      value: data.lehengas.length,
      hint: "Rental-ready inventory cards",
    },
    {
      label: "Jewellery styles",
      value: data.jewellery.length,
      hint: "Add-ons that complete the look",
    },
  ];

  return (
    <div className="admin-stack">
      {error ? <p className="admin-error-banner">{error}</p> : null}

      <section className="admin-stat-grid">
        {statCards.map((card) => (
          <article key={card.label} className="admin-stat-card">
            <span>{card.label}</span>
            <strong>{loading ? "--" : card.value}</strong>
            <p>{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="admin-grid-two">
        <article className="admin-panel">
          <div className="admin-panel-heading">
            <h3>Latest collections</h3>
          </div>
          <div className="admin-list">
            {data.collections.slice(0, 5).map((item) => (
              <div key={item.id} className="admin-list-item">
                <strong>{item.name}</strong>
              </div>
            ))}
            {!loading && data.collections.length === 0 ? (
              <p className="admin-empty-state">No collections added yet.</p>
            ) : null}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <h3>Catalog snapshot</h3>
          </div>
          <div className="admin-notes-card">
            <p>
              Use the side navigation to add collections first, then attach lehengas and jewellery
              items to the right edit.
            </p>
            <ul>
              <li>Multiple image URLs are supported.</li>
              <li>Lehenga sizes can be managed while creating the product.</li>
              <li>All admin pages are connected to your Express backend.</li>
            </ul>
          </div>
        </article>
      </section>
    </div>
  );
}
