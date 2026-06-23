"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Pencil, Xmark } from "@gravity-ui/icons";
import { Package } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const API_BASE = `${process.env.NEXT_PUBLIC_BASE_URL}`;

// ── Status badge colors — same palette as your original OrdersTable ───
const statusStyles = {
  Pending: "bg-[#fdf0d8] text-[#b8790a]",
  pending: "bg-[#fdf0d8] text-[#b8790a]",
  Accepted: "bg-[#dcf2e3] text-[#1f8a4c]",
  Processing: "bg-[#e3eefb] text-[#2d6fb8]",
  processing: "bg-[#e3eefb] text-[#2d6fb8]",
  Shipped: "bg-[#e9e4fa] text-[#6b46c1]",
  Delivered: "bg-[#dcf2e3] text-[#1f8a4c]",
  delivered: "bg-[#dcf2e3] text-[#1f8a4c]",
  Cancelled: "bg-[#fbeaea] text-[#c0392b]",
  cancelled: "bg-[#fbeaea] text-[#c0392b]",
};

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(n) {
  return `৳ ${Number(n || 0).toLocaleString("en-US")}`;
}

// =====================================================
// Main Page — fetches only THIS seller's orders from the backend
// =====================================================
export default function SellerOrdersPage() {
  const { data: session, isPending } = useSession();
  const sellerEmail = session?.user?.email || null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cancellingIds, setCancellingIds] = useState(new Set());

  // ── Fetch this seller's orders ──────────────────────────────────
  useEffect(() => {
    if (isPending || !sellerEmail) return;

    async function fetchSellerOrders() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(
          `${API_BASE}/api/orders/seller?email=${encodeURIComponent(sellerEmail)}`
        );
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Couldn't load orders. Check that your API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchSellerOrders();
  }, [isPending, sellerEmail]);

  // ── Cancel an order — calls the backend, which restores stock too ──
  async function handleCancel(orderId) {
    if (!sellerEmail) return;

    setCancellingIds((prev) => new Set(prev).add(orderId));

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sellerEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Couldn't cancel this order.");
        return;
      }

      // update locally so the row reflects "cancelled" without a refetch
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: "cancelled" } : o
        )
      );
      toast.success("Order cancelled successfully.");
    } catch (err) {
      console.error("Cancel failed", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  const showLoading = isPending || loading;

  return (
    <div className="min-h-screen bg-[#f7f9f4] px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1f4d3c] mb-5">My Orders (Seller)</h1>

        {showLoading && <OrdersTableSkeleton />}

        {!showLoading && errorMsg && (
          <div className="rounded-2xl border border-[#e4e9dc] bg-white p-10 text-center text-[#7a8a78]">
            {errorMsg}
          </div>
        )}

        {!showLoading && !errorMsg && orders.length === 0 && (
          <div className="rounded-2xl border border-[#e4e9dc] bg-white p-10 sm:p-14 text-center">
            <Package className="w-10 h-10 text-[#d8e0cf] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#1f2d22]">No orders yet</h3>
            <p className="text-sm text-[#7a8a78] mt-1">
              Orders placed for your products will show up here.
            </p>
          </div>
        )}

        {!showLoading && !errorMsg && orders.length > 0 && (
          <OrdersTable
            orders={orders}
            onCancel={handleCancel}
            cancellingIds={cancellingIds}
          />
        )}
      </div>
    </div>
  );
}

// =====================================================
// Manage Orders table — same structure as your original component,
// now reading real fields from the backend order documents:
//   _id, productSnapshot.name, buyerInfo.name, orderStatus, createdAt
// =====================================================
function OrdersTable({ orders, onCancel, cancellingIds }) {
  return (
    <div className="rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1f4d3c]">Manage Orders</h2>
        <span className="text-sm text-[#9aa896]">{orders.length} total</span>
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e4e9dc] text-xs font-semibold uppercase tracking-wide text-[#9aa896]">
              <th className="py-2.5 pr-4">Order ID</th>
              <th className="py-2.5 pr-4">Product</th>
              <th className="py-2.5 pr-4">Buyer</th>
              <th className="py-2.5 pr-4">Total</th>
              <th className="py-2.5 pr-4">Status</th>
              <th className="py-2.5 pr-4">Date</th>
              <th className="py-2.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {orders.map((order, i) => {
                const isCancelling = cancellingIds.has(order._id);
                const isCancelled = order.orderStatus === "cancelled";
                return (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="border-b border-[#f0f3ec] last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-[#2c6b4f]">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4 text-[#1f2d22]">
                      {order.productSnapshot?.name || "—"}
                    </td>
                    <td className="py-3 pr-4 text-[#5b6b58]">
                      {order.buyerInfo?.name || order.buyerInfo?.email || "—"}
                    </td>
                    <td className="py-3 pr-4 text-[#1f2d22]">
                      {formatPrice(
                        (order.productSnapshot?.price || 0) * (order.quantity || 1)
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          statusStyles[order.orderStatus] || statusStyles.Pending
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#5b6b58]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <RowAction
                          icon={Pencil}
                          label="Update status"
                          onClick={() => toast("Status update coming soon")}
                        />
                        <RowAction
                          icon={Xmark}
                          label="Cancel order"
                          tone="danger"
                          disabled={isCancelled || isCancelling}
                          onClick={() => onCancel(order._id)}
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 grid gap-3 sm:hidden">
        <AnimatePresence>
          {orders.map((order, i) => {
            const isCancelling = cancellingIds.has(order._id);
            const isCancelled = order.orderStatus === "cancelled";
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="rounded-xl border border-[#e4e9dc] p-3.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#2c6b4f]">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      statusStyles[order.orderStatus] || statusStyles.Pending
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#1f2d22]">
                  {order.productSnapshot?.name || "—"}
                </p>
                <p className="text-xs text-[#7a8a78]">
                  {order.buyerInfo?.name || order.buyerInfo?.email} · {formatDate(order.createdAt)}
                </p>
                <p className="text-sm font-semibold text-[#1f2d22] mt-1">
                  {formatPrice((order.productSnapshot?.price || 0) * (order.quantity || 1))}
                </p>
                <div className="mt-3 flex items-center justify-end gap-1.5">
                  <RowAction
                    icon={Pencil}
                    label="Update status"
                    onClick={() => toast("Status update coming soon")}
                  />
                  <RowAction
                    icon={Xmark}
                    label="Cancel order"
                    tone="danger"
                    disabled={isCancelled || isCancelling}
                    onClick={() => onCancel(order._id)}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RowAction({ icon: Icon, label, onClick, tone = "default", disabled = false }) {
  const toneClass = disabled
    ? "text-[#d3dccd] cursor-not-allowed"
    : tone === "danger"
    ? "text-[#9aa896] hover:bg-[#fbeaea] hover:text-[#c0392b]"
    : "text-[#9aa896] hover:bg-[#eef3e2] hover:text-[#2c6b4f]";
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex size-7 items-center justify-center rounded-lg transition-colors ${toneClass}`}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6 animate-pulse">
      <div className="h-5 w-32 bg-[#eef3e2] rounded-lg mb-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 w-full bg-[#f5f7f1] rounded-lg mb-2" />
      ))}
    </div>
  );
}