"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const API_BASE = `${process.env.NEXT_PUBLIC_BASE_URL}`;

const statusStyles = {
  pending:    "bg-[#fdf0d8] text-[#b8790a]",
  processing: "bg-[#e3eefb] text-[#2d6fb8]",
  accepted:   "bg-[#dcf2e3] text-[#1f8a4c]",
  shipped:    "bg-[#e9e4fa] text-[#6b46c1]",
  delivered:  "bg-[#dcf2e3] text-[#1f8a4c]",
  cancelled:  "bg-[#fbeaea] text-[#c0392b]",
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
// Main Page — PRIVATE: buyer's own orders only, filtered server-side
// by GET /api/orders?email=... (already scoped to buyerInfo.email)
// =====================================================
export default function MyOrdersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const buyerEmail = session?.user?.email || null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cancellingIds, setCancellingIds] = useState(new Set());

  // ── Auth guard — redirect unauthenticated users to sign-in ──────────
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  // ── Fetch this buyer's orders ────────────────────────────────────
  useEffect(() => {
    if (isPending || !buyerEmail) return;

    async function fetchOrders() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(
          `${API_BASE}/api/orders?email=${encodeURIComponent(buyerEmail)}`
        );
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Couldn't load your orders. Check that your API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isPending, buyerEmail]);

  // ── Cancel an order — calls the backend, which restores stock too ──
  async function handleCancel(orderId) {
    if (!buyerEmail) return;

    setCancellingIds((prev) => new Set(prev).add(orderId));

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: buyerEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Couldn't cancel this order.");
        return;
      }

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

  // ── Auth gate: show skeleton while session resolves, render nothing
  //    if logged out (redirect above already kicks in) ────────────────
  if (isPending || (!session && !isPending)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <OrdersSkeleton />
        </div>
      </div>
    );
  }

  const showLoading = loading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <Link
          href="/dashboard/buyer"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-green-600" />
          My Orders
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your orders and cancel if needed.{" "}
          {orders.length > 0 && `(${orders.length} order${orders.length > 1 ? "s" : ""})`}
        </p>

        {showLoading && <OrdersSkeleton />}

        {!showLoading && errorMsg && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
            {errorMsg}
          </div>
        )}

        {!showLoading && !errorMsg && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-2xl border border-gray-200 p-10 sm:p-16 text-center"
          >
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              When you buy something, itll show up here.
            </p>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Browse Products
            </Link>
          </motion.div>
        )}

        {!showLoading && !errorMsg && orders.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="mt-6 flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {orders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  isCancelling={cancellingIds.has(order._id)}
                  onCancel={() => handleCancel(order._id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Single order card
// =====================================================
function OrderRow({ order, isCancelling, onCancel }) {
  const isCancelled = order.orderStatus === "cancelled";
  const isDelivered = order.orderStatus === "delivered";
  const canCancel = !isCancelled && !isDelivered;

  const thumb = order.productSnapshot?.image || "/placeholder-product.png";
  const total = (order.productSnapshot?.price || 0) * (order.quantity || 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
      className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
        isCancelled ? "border-gray-100 opacity-70" : "border-gray-200"
      }`}
    >
      {/* Product thumbnail */}
      <img
        src={thumb}
        alt={order.productSnapshot?.name}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-50"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            {order.productSnapshot?.name || "—"}
          </p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
              statusStyles[order.orderStatus] || statusStyles.processing
            }`}
          >
            {order.orderStatus}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          #{order._id.slice(-6).toUpperCase()} · Qty {order.quantity || 1} · {formatDate(order.createdAt)}
        </p>
        {order.sellerInfo?.name && (
          <p className="text-xs text-gray-400 mt-0.5">Sold by {order.sellerInfo.name}</p>
        )}
      </div>

      {/* Price + action */}
      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-2.5 flex-shrink-0">
        <p className="text-sm sm:text-base font-bold text-gray-900">{formatPrice(total)}</p>

        {canCancel ? (
          <motion.button
            onClick={onCancel}
            disabled={isCancelling}
            whileHover={{ scale: isCancelling ? 1 : 1.03 }}
            whileTap={{ scale: isCancelling ? 1 : 0.96 }}
            className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            {isCancelling ? "Cancelling…" : "Cancel Order"}
          </motion.button>
        ) : (
          <span className="text-xs text-gray-300">
            {isCancelled ? "Cancelled" : "Completed"}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// =====================================================
// Loading skeleton
// =====================================================
function OrdersSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200" />
      ))}
    </div>
  );
}