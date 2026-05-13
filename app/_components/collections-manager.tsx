"use client";

import { FormEvent, useEffect, useState } from "react";

import { adminRequest } from "../_lib/admin-api";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  season: string;
  audience: string;
  isFeatured: boolean;
  displayOrder: number;
};

const seasons = ["SPRING", "SUMMER", "MONSOON", "AUTUMN", "WINTER", "FESTIVE", "ALL_SEASON"];
const audiences = ["WOMEN", "MEN", "UNISEX", "KIDS"];

const seasonLabels: Record<string, string> = {
  SPRING: "Bridal Edit",
  SUMMER: "Wedding Festive",
  MONSOON: "Reception Looks",
  AUTUMN: "Mehendi Moments",
  WINTER: "Royal Winter Wear",
  FESTIVE: "Celebration Styles",
  ALL_SEASON: "All Occasion",
};

const audienceLabels: Record<string, string> = {
  WOMEN: "Bride",
  MEN: "Groom",
  UNISEX: "Family",
  KIDS: "Kids",
};

export function CollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    season: "ALL_SEASON",
    audience: "WOMEN",
    isFeatured: false,
    displayOrder: "0",
  });

  async function loadCollections() {
    try {
      setError(null);
      const data = await adminRequest<Collection[]>("/admin/collections", { withAuth: true });
      setCollections(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load collections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const data = await adminRequest<Collection[]>("/admin/collections", { withAuth: true });

        if (cancelled) {
          return;
        }

        setError(null);
        setCollections(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load collections");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await adminRequest<Collection>("/admin/collections", {
        method: "POST",
        withAuth: true,
        body: {
          name: form.name,
          slug: form.slug || undefined,
          description: form.description || undefined,
          season: form.season,
          audience: form.audience,
          isFeatured: form.isFeatured,
          displayOrder: Number(form.displayOrder || 0),
        },
      });

      setForm({
        name: "",
        slug: "",
        description: "",
        season: "ALL_SEASON",
        audience: "WOMEN",
        isFeatured: false,
        displayOrder: "0",
      });
      await loadCollections();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await adminRequest(`/admin/collections/${id}`, {
        method: "DELETE",
        withAuth: true,
      });
      await loadCollections();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  return (
    <div className="admin-grid-two admin-grid-form">
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h3>Create category</h3>
        </div>
        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Category name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Bridal Couture"
              required
            />
          </label>

          <label className="admin-field">
            <span>Custom slug</span>
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="bridal-couture"
            />
          </label>

          <label className="admin-field admin-field-full">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Describe what belongs in this category."
              rows={4}
            />
          </label>

          <label className="admin-field">
            <span>Category style</span>
            <select
              value={form.season}
              onChange={(event) => setForm((current) => ({ ...current, season: event.target.value }))}
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {seasonLabels[season] ?? season}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Audience</span>
            <select
              value={form.audience}
              onChange={(event) =>
                setForm((current) => ({ ...current, audience: event.target.value }))
              }
            >
              {audiences.map((audience) => (
                <option key={audience} value={audience}>
                  {audienceLabels[audience] ?? audience}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Display order</span>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayOrder: event.target.value }))
              }
            />
          </label>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm((current) => ({ ...current, isFeatured: event.target.checked }))
              }
            />
            <span>Feature this category on the storefront</span>
          </label>

          {error ? <p className="admin-error-banner admin-field-full">{error}</p> : null}

          <button className="admin-primary-button admin-field-full" type="submit" disabled={submitting}>
            {submitting ? "Saving category..." : "Add category"}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h3>Current categories</h3>
        </div>
        {loading ? <p className="admin-empty-state">Loading categories...</p> : null}
        <div className="admin-card-list">
          {collections.map((collection) => (
            <article key={collection.id} className="admin-catalog-card">
              <div>
                <strong>{collection.name}</strong>
                <p>
                  {seasonLabels[collection.season] ?? collection.season} ·{" "}
                  {audienceLabels[collection.audience] ?? collection.audience}
                </p>
                <span>{collection.slug}</span>
              </div>
              <button type="button" className="admin-danger-button" onClick={() => handleDelete(collection.id)}>
                Delete
              </button>
            </article>
          ))}
          {!loading && collections.length === 0 ? (
            <p className="admin-empty-state">No categories yet. Create the first one from the form.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
