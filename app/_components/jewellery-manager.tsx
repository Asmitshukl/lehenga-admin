"use client";

import { FormEvent, useEffect, useState } from "react";

import { adminRequest } from "../_lib/admin-api";
import { buildImagePayload } from "../_lib/image-upload";
import { CatalogCard } from "./catalog-card";
import { MockImageDropzone, type MockUploadImage } from "./mock-image-dropzone";

type CategoryOption = {
  id: string;
  name: string;
};

type JewelleryItem = {
  id: string;
  name: string;
  sku: string;
  type: string;
  shortDescription?: string | null;
  description?: string | null;
  color?: string | null;
  finish?: string | null;
  stoneDetails?: string | null;
  occasion?: string | null;
  rentalPricePerDay: string;
  securityDeposit?: string | null;
  minimumRentalDays?: number | null;
  stockQuantity: number;
  category?: { id: string; name: string } | null;
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
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<MockUploadImage[]>([]);
  const [editingItem, setEditingItem] = useState<JewelleryItem | null>(null);
  const [editImages, setEditImages] = useState<MockUploadImage[]>([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    type: "SET",
    shortDescription: "",
    description: "",
    color: "",
    finish: "",
    stoneDetails: "",
    occasion: "",
    rentalPricePerDay: "",
    securityDeposit: "",
    minimumRentalDays: "1",
    stockQuantity: "1",
    categoryId: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    type: "SET",
    shortDescription: "",
    description: "",
    color: "",
    finish: "",
    stoneDetails: "",
    occasion: "",
    rentalPricePerDay: "",
    securityDeposit: "",
    minimumRentalDays: "1",
    stockQuantity: "1",
    categoryId: "",
  });

  async function loadData() {
    try {
      setError(null);
      const [categoriesData, itemsData] = await Promise.all([
        adminRequest<CategoryOption[]>("/admin/categories", { withAuth: true }),
        adminRequest<JewelleryItem[]>("/admin/jewellery", { withAuth: true }),
      ]);
      setCategories(categoriesData);
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
        const [categoriesData, itemsData] = await Promise.all([
          adminRequest<CategoryOption[]>("/admin/categories", { withAuth: true }),
          adminRequest<JewelleryItem[]>("/admin/jewellery", { withAuth: true }),
        ]);

        if (cancelled) {
          return;
        }

        setError(null);
        setCategories(categoriesData);
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
          sku: form.sku,
          type: form.type,
          shortDescription: form.shortDescription || undefined,
          description: form.description || undefined,
          color: form.color || undefined,
          finish: form.finish || undefined,
          stoneDetails: form.stoneDetails || undefined,
          occasion: form.occasion || undefined,
          rentalPricePerDay: Number(form.rentalPricePerDay),
          securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : undefined,
          minimumRentalDays: Number(form.minimumRentalDays),
          stockQuantity: Number(form.stockQuantity),
          categoryId: form.categoryId || undefined,
          images,
        },
      });

      setForm({
        name: "",
        sku: "",
        type: "SET",
        shortDescription: "",
        description: "",
        color: "",
        finish: "",
        stoneDetails: "",
        occasion: "",
        rentalPricePerDay: "",
        securityDeposit: "",
        minimumRentalDays: "1",
        stockQuantity: "1",
        categoryId: "",
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

  function openEdit(item: JewelleryItem) {
    setEditingItem(item);
    setEditImages([]);
    setEditForm({
      name: item.name,
      sku: item.sku,
      type: item.type,
      shortDescription: item.shortDescription ?? "",
      description: item.description ?? "",
      color: item.color ?? "",
      finish: item.finish ?? "",
      stoneDetails: item.stoneDetails ?? "",
      occasion: item.occasion ?? "",
      rentalPricePerDay: item.rentalPricePerDay,
      securityDeposit: item.securityDeposit ?? "",
      minimumRentalDays: String(item.minimumRentalDays ?? 1),
      stockQuantity: String(item.stockQuantity ?? 0),
      categoryId: item.category?.id ?? "",
    });
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const images = editImages.length > 0 ? await buildImagePayload(editImages) : undefined;

      await adminRequest(`/admin/jewellery/${editingItem.id}`, {
        method: "PATCH",
        withAuth: true,
        body: {
          name: editForm.name,
          sku: editForm.sku,
          type: editForm.type,
          shortDescription: editForm.shortDescription || undefined,
          description: editForm.description || undefined,
          color: editForm.color || undefined,
          finish: editForm.finish || undefined,
          stoneDetails: editForm.stoneDetails || undefined,
          occasion: editForm.occasion || undefined,
          rentalPricePerDay: Number(editForm.rentalPricePerDay),
          securityDeposit: editForm.securityDeposit ? Number(editForm.securityDeposit) : undefined,
          minimumRentalDays: Number(editForm.minimumRentalDays),
          stockQuantity: Number(editForm.stockQuantity),
          categoryId: editForm.categoryId || undefined,
          ...(images ? { images } : {}),
        },
      });

      setEditingItem(null);
      setEditImages([]);
      await loadData();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update jewellery");
    } finally {
      setSubmitting(false);
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
            <span>Security deposit</span>
            <input
              type="number"
              min={0}
              value={form.securityDeposit}
              onChange={(e) => setForm((c) => ({ ...c, securityDeposit: e.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Minimum rental days</span>
            <input
              type="number"
              min={1}
              value={form.minimumRentalDays}
              onChange={(e) => setForm((c) => ({ ...c, minimumRentalDays: e.target.value }))}
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
              value={form.categoryId}
              onChange={(e) => setForm((c) => ({ ...c, categoryId: e.target.value }))}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              meta={`${item.images.length} image(s) · ${item.stockQuantity} in stock`}
              imageUrl={item.images[0]?.imageUrl}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
          {!loading && items.length === 0 ? (
            <p className="admin-empty-state">No jewellery added yet.</p>
          ) : null}
        </div>
      </section>

      {editingItem ? (
        <div className="admin-preview-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-jewellery-title">
          <div className="admin-preview-modal">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">Edit jewellery</span>
                <h3 id="edit-jewellery-title">{editingItem.name}</h3>
              </div>
              <button type="button" className="admin-ghost-button" onClick={() => setEditingItem(null)}>
                Close
              </button>
            </div>
            <form className="admin-form-grid" onSubmit={handleEditSubmit}>
              <label className="admin-field">
                <span>Name</span>
                <input value={editForm.name} onChange={(e) => setEditForm((c) => ({ ...c, name: e.target.value }))} required />
              </label>
              <label className="admin-field">
                <span>SKU</span>
                <input value={editForm.sku} onChange={(e) => setEditForm((c) => ({ ...c, sku: e.target.value }))} required />
              </label>
              <label className="admin-field">
                <span>Type</span>
                <select value={editForm.type} onChange={(e) => setEditForm((c) => ({ ...c, type: e.target.value }))}>
                  {jewelleryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span>Rental price per day</span>
                <input type="number" value={editForm.rentalPricePerDay} onChange={(e) => setEditForm((c) => ({ ...c, rentalPricePerDay: e.target.value }))} required />
              </label>
              <label className="admin-field">
                <span>Security deposit</span>
                <input type="number" min={0} value={editForm.securityDeposit} onChange={(e) => setEditForm((c) => ({ ...c, securityDeposit: e.target.value }))} />
              </label>
              <label className="admin-field">
                <span>Minimum rental days</span>
                <input type="number" min={1} value={editForm.minimumRentalDays} onChange={(e) => setEditForm((c) => ({ ...c, minimumRentalDays: e.target.value }))} />
              </label>
              <label className="admin-field">
                <span>Stock quantity</span>
                <input type="number" min={0} value={editForm.stockQuantity} onChange={(e) => setEditForm((c) => ({ ...c, stockQuantity: e.target.value }))} />
              </label>
              <label className="admin-field">
                <span>Category</span>
                <select value={editForm.categoryId} onChange={(e) => setEditForm((c) => ({ ...c, categoryId: e.target.value }))}>
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field admin-field-full">
                <span>Short description</span>
                <input value={editForm.shortDescription} onChange={(e) => setEditForm((c) => ({ ...c, shortDescription: e.target.value }))} />
              </label>
              <label className="admin-field admin-field-full">
                <span>Description</span>
                <textarea rows={4} value={editForm.description} onChange={(e) => setEditForm((c) => ({ ...c, description: e.target.value }))} />
              </label>
              <MockImageDropzone
                label="Replace jewellery images"
                hint="Select new images only if you want to replace the current set."
                value={editImages}
                onChange={setEditImages}
              />
              <button className="admin-primary-button admin-field-full" type="submit" disabled={submitting}>
                {submitting ? "Saving jewellery..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
