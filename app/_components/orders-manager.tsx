"use client";

import { FormEvent, useEffect, useState } from "react";

import { adminRequest } from "../_lib/admin-api";

type OrderItem = {
  id: string;
  itemType: "LEHENGA" | "JEWELLERY";
  productNameSnapshot: string;
  skuSnapshot: string;
  sizeLabelSnapshot?: string | null;
  quantity: number;
  rentalDays: number;
  lineTotal: string;
  lehengaId?: string | null;
  jewelleryId?: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  rentalStartDate: string;
  rentalEndDate: string;
  subtotalAmount: string;
  securityDeposit: string;
  totalAmount: string;
  specialInstructions?: string | null;
  internalNotes?: string | null;
  customer: {
    firstName: string;
    phone: string;
    email?: string | null;
  };
  pickupLocation: {
    name: string;
  };
  items: OrderItem[];
};

type ProductOption = {
  id: string;
  name: string;
};

type EditItemDraft = {
  id: string;
  itemType: "LEHENGA" | "JEWELLERY";
  productId: string;
  quantity: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lehengas, setLehengas] = useState<ProductOption[]>([]);
  const [jewellery, setJewellery] = useState<ProductOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    rentalStartDate: "",
    rentalEndDate: "",
    specialInstructions: "",
    internalNotes: "",
    items: [] as EditItemDraft[],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    try {
      const [ordersData, lehengasData, jewelleryData] = await Promise.all([
        adminRequest<Order[]>("/admin/orders", { withAuth: true }),
        adminRequest<ProductOption[]>("/admin/lehengas", { withAuth: true }),
        adminRequest<ProductOption[]>("/admin/jewellery", { withAuth: true }),
      ]);

      setOrders(ordersData);
      setLehengas(lehengasData);
      setJewellery(jewelleryData);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      if (!cancelled) {
        await loadOrders();
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  async function handleFulfilled(orderId: string) {
    setSubmitting(true);
    setError(null);

    try {
      await adminRequest(`/admin/orders/${orderId}`, {
        method: "PATCH",
        withAuth: true,
        body: {
          status: "FULFILLED",
        },
      });
      await loadOrders();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(order: Order) {
    setEditingOrder(order);
    setEditForm({
      rentalStartDate: order.rentalStartDate.slice(0, 10),
      rentalEndDate: order.rentalEndDate.slice(0, 10),
      specialInstructions: order.specialInstructions ?? "",
      internalNotes: order.internalNotes ?? "",
      items: order.items.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        productId: item.itemType === "LEHENGA" ? item.lehengaId ?? "" : item.jewelleryId ?? "",
        quantity: String(item.quantity),
      })),
    });
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingOrder) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await adminRequest(`/admin/orders/${editingOrder.id}`, {
        method: "PATCH",
        withAuth: true,
        body: {
          rentalStartDate: editForm.rentalStartDate,
          rentalEndDate: editForm.rentalEndDate,
          specialInstructions: editForm.specialInstructions || undefined,
          internalNotes: editForm.internalNotes || undefined,
          items: editForm.items.map((item) =>
            item.itemType === "LEHENGA"
              ? {
                  itemType: item.itemType,
                  lehengaId: item.productId,
                  quantity: Number(item.quantity || 1),
                }
              : {
                  itemType: item.itemType,
                  jewelleryId: item.productId,
                  quantity: Number(item.quantity || 1),
                },
          ),
        },
      });

      setEditingOrder(null);
      await loadOrders();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to edit order");
    } finally {
      setSubmitting(false);
    }
  }

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleOrders = normalizedSearchQuery
    ? orders.filter((order) => {
        const haystack = [
          order.id,
          order.orderNumber,
          order.customer.firstName,
          order.customer.phone,
          order.customer.email ?? "",
          order.status,
          order.paymentStatus,
          ...order.items.map((item) => item.productNameSnapshot),
          ...order.items.map((item) => item.skuSnapshot),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearchQuery);
      })
    : orders;

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h3>Created orders</h3>
      </div>

      <label className="admin-field admin-order-search">
        <span>Search orders</span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by order ID, order number, customer, lehenga, jewellery, SKU..."
        />
      </label>

      {loading ? <p className="admin-empty-state">Loading orders...</p> : null}
      {error ? <p className="admin-error-banner">{error}</p> : null}

      <div className="admin-list">
        {visibleOrders.map((order) => (
          <article key={order.id} className="admin-list-item admin-order-card">
            <div className="admin-order-card-head">
              <strong>{order.orderNumber}</strong>
              <span className="admin-order-total">Rs {order.totalAmount}</span>
            </div>

            <div className="admin-order-grid">
              <p>
                {order.customer.firstName} · {order.customer.phone}
                {order.customer.email ? ` · ${order.customer.email}` : ""}
              </p>
              <p>
                {order.status} · {order.paymentStatus}
              </p>
              <p>
                {formatDate(order.rentalStartDate)} to {formatDate(order.rentalEndDate)}
              </p>
              <p>Pickup: {order.pickupLocation.name}</p>
              <p className="admin-order-items">
                Items:{" "}
                {order.items
                  .map(
                    (item) =>
                      `${item.productNameSnapshot}${item.sizeLabelSnapshot ? ` (${item.sizeLabelSnapshot})` : ""} x${item.quantity}`,
                  )
                  .join(", ")}
              </p>
            </div>

            <div className="admin-order-actions">
              <button
                type="button"
                className="admin-primary-button"
                onClick={() => handleFulfilled(order.id)}
                disabled={submitting || order.status === "FULFILLED"}
              >
                Fulfilled
              </button>
              <button type="button" className="admin-secondary-button" onClick={() => openEdit(order)}>
                Edit
              </button>
              <button type="button" className="admin-ghost-button" onClick={() => openEdit(order)}>
                Update
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && visibleOrders.length === 0 ? (
        <p className="admin-empty-state">
          {orders.length === 0 ? "No orders have been created yet." : "No orders matched your search."}
        </p>
      ) : null}

      {editingOrder ? (
        <div className="admin-preview-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-order-title">
          <div className="admin-preview-modal">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">Order editing</span>
                <h3 id="edit-order-title">{editingOrder.orderNumber}</h3>
              </div>
              <button type="button" className="admin-ghost-button" onClick={() => setEditingOrder(null)}>
                Close
              </button>
            </div>

            <form className="admin-stack" onSubmit={handleEditSubmit}>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Rental start date</span>
                  <input
                    type="date"
                    required
                    value={editForm.rentalStartDate}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, rentalStartDate: event.target.value }))
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Rental end date</span>
                  <input
                    type="date"
                    required
                    value={editForm.rentalEndDate}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, rentalEndDate: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="admin-stack">
                {editForm.items.map((item, index) => {
                  const productOptions = item.itemType === "LEHENGA" ? lehengas : jewellery;

                  return (
                    <div key={item.id} className="admin-order-editor-row">
                      <span>{item.itemType}</span>
                      <select
                        value={item.productId}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            items: current.items.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, productId: event.target.value } : entry,
                            ),
                          }))
                        }
                      >
                        <option value="">Select product</option>
                        {productOptions.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            items: current.items.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, quantity: event.target.value } : entry,
                            ),
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <label className="admin-field">
                <span>Special instructions</span>
                <textarea
                  rows={3}
                  value={editForm.specialInstructions}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, specialInstructions: event.target.value }))
                  }
                />
              </label>
              <label className="admin-field">
                <span>Internal notes</span>
                <textarea
                  rows={3}
                  value={editForm.internalNotes}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, internalNotes: event.target.value }))
                  }
                />
              </label>

              <button className="admin-primary-button" type="submit" disabled={submitting}>
                {submitting ? "Saving order..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
