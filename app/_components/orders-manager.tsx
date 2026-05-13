"use client";

import { useEffect, useState } from "react";

import { adminRequest } from "../_lib/admin-api";

type OrderItem = {
  id: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  sizeLabelSnapshot?: string | null;
  quantity: number;
  rentalDays: number;
  lineTotal: string;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        const data = await adminRequest<Order[]>("/admin/orders", { withAuth: true });

        if (cancelled) {
          return;
        }

        setOrders(data);
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load orders");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h3>Created orders</h3>
      </div>

      {loading ? <p className="admin-empty-state">Loading orders...</p> : null}
      {error ? <p className="admin-error-banner">{error}</p> : null}

      <div className="admin-list">
        {orders.map((order) => (
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
          </article>
        ))}
      </div>

      {!loading && orders.length === 0 ? (
        <p className="admin-empty-state">No orders have been created yet.</p>
      ) : null}
    </section>
  );
}
