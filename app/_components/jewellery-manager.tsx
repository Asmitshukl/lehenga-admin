"use client";

import { FormEvent, useEffect, useState } from "react";

import { adminRequest } from "../_lib/admin-api";
import { buildImagePayload } from "../_lib/image-upload";
import { CatalogCard } from "./catalog-card";
import { MockImageDropzone, type MockUploadImage } from "./mock-image-dropzone";

type CollectionOption = {
  id: string;
  name: string;
};

type JewelleryItem = {
  id: string;
  name: string;
  sku: string;
  type: string;
  rentalPricePerDay: string;
  images: Array<{ id: string; imageUrl: string; altText?: string | null }>;
};

const jewelleryTypes = [
  "NECKLACE",
  "EARRINGS",
  "MAANG_TIKKA",
  "BANGLE",
  "BRACELET",
  "RING",
  "NATH",
  "WAIST_BELT",
  "ANKLET",
  "BROOCH",
  "SET",
  "OTHER",
];

export function JewelleryManager() {
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<MockUploadImage[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    type: "SET",
    shortDescription: "",
    description: "",
    material: "",
    color: "",
    finish: "",
    stoneDetails: "",
    occasion: "",
    rentalPricePerDay: "",
    securityDeposit: "",
    originalPrice: "",
    minimumRentalDays: "1",
    stockQuantity: "1",
    collectionId: "",
  });

  async function loadData() {
    try {
      setError(null);
      const [collectionsData, itemsData] = await Promise.all([
        adminRequest<CollectionOption[]>("/admin/collections", { withAuth: true }),
        adminRequest<JewelleryItem[]>("/admin/jewellery", { withAuth: true }),
      ]);
      setCollections(collectionsData);
      setItems(itemsData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load jewellery page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const [collectionsData, itemsData] = await Promise.all([
          adminRequest<CollectionOption[]>("/admin/collections", { withAuth: true }),
          adminRequest<JewelleryItem[]>("/admin/jewellery", { withAuth: true }),
        ]);

        if (cancelled) {
          return;
        }

        setError(null);
        setCollections(collectionsData);
        setItems(itemsData);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load jewellery page");
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
      const images = await buildImagePayload(selectedImages);

      await adminRequest("/admin/jewellery", {
        method: "POST",
        withAuth: true,
        body: {
          name: form.name,
          slug: form.slug || undefined,
          sku: form.sku,
          type: form.type,
          shortDescription: form.shortDescription || undefined,
          description: form.description || undefined,
          material: form.material || undefined,
          color: form.color || undefined,
          finish: form.finish || undefined,
          stoneDetails: form.stoneDetails || undefined,
          occasion: form.occasion || undefined,
          rentalPricePerDay: Number(form.rentalPricePerDay),
          securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : undefined,
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          minimumRentalDays: Number(form.minimumRentalDays),
          stockQuantity: Number(form.stockQuantity),
          collectionId: form.collectionId || undefined,
          images,
        },
      });

      setForm({
        name: "",
        slug: "",
        sku: "",
        type: "SET",
        shortDescription: "",
        description: "",
        material: "",
        color: "",
        finish: "",
        stoneDetails: "",
        occasion: "",
        rentalPricePerDay: "",
        securityDeposit: "",
        originalPrice: "",
        minimumRentalDays: "1",
        stockQuantity: "1",
        collectionId: "",
      });
      setSelectedImages([]);
      await loadData();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await adminRequest(`/admin/jewellery/${id}`, {
        method: "DELETE",
        withAuth: true,
      });
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  return (
    <div className="admin-grid-two admin-grid-form">
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h3>Add jewellery item</h3>
        </div>
        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Name</span>
            <input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required />
          </label>
          <label className="admin-field">
            <span>SKU</span>
            <input value={form.sku} onChange={(e) => setForm((c) => ({ ...c, sku: e.target.value }))} required />
          </label>
          <label className="admin-field">
            <span>Slug</span>
            <input value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span>Type</span>
            <select value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))}>
              {jewelleryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Rental price per day</span>
            <input
              type="number"
              value={form.rentalPricePerDay}
              onChange={(e) => setForm((c) => ({ ...c, rentalPricePerDay: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field">
            <span>Stock quantity</span>
            <input
              type="number"
              value={form.stockQuantity}
              onChange={(e) => setForm((c) => ({ ...c, stockQuantity: e.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Category</span>
            <select
              value={form.collectionId}
              onChange={(e) => setForm((c) => ({ ...c, collectionId: e.target.value }))}
            >
              <option value="">No category</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Material</span>
            <input
              value={form.material}
              onChange={(e) => setForm((c) => ({ ...c, material: e.target.value }))}
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Short description</span>
            <input
              value={form.shortDescription}
              onChange={(e) => setForm((c) => ({ ...c, shortDescription: e.target.value }))}
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
            />
          </label>
          <MockImageDropzone
            label="Jewellery image upload"
            hint="Select jewellery images. They will be uploaded to S3 when you save."
            value={selectedImages}
            onChange={setSelectedImages}
          />

          {error ? <p className="admin-error-banner admin-field-full">{error}</p> : null}

          <button className="admin-primary-button admin-field-full" type="submit" disabled={submitting}>
            {submitting ? "Saving jewellery..." : "Add jewellery"}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h3>Jewellery catalog</h3>
        </div>
        {loading ? <p className="admin-empty-state">Loading jewellery...</p> : null}
        <div className="admin-card-list">
          {items.map((item) => (
            <CatalogCard
              key={item.id}
              title={item.name}
              subtitle={`${item.type} · SKU ${item.sku}`}
              meta={`${item.images.length} image(s)`}
              imageUrl={item.images[0]?.imageUrl}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
          {!loading && items.length === 0 ? (
            <p className="admin-empty-state">No jewellery added yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
