"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Zap,
  X,
  ShoppingBag,
  MapPin,
  User,
  Mail,
  Store,
  CheckCircle2,
  Loader2,
  BadgeCheck,
  CreditCard,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

// =====================================================
// CONFIG
// =====================================================
const API_BASE = `${process.env.NEXT_PUBLIC_BASE_URL}`;

function formatPrice(n) {
  return `৳ ${Number(n || 0).toLocaleString("en-US")}`;
}

// =====================================================
// BuyNowButton — reusable across:
//   • CartPage      (pass product + userEmail)
//   • WishlistPage  (pass product + userEmail)
//   • ProductDetailPage (pass product + userEmail)
//
// Only users with role "buyer" can place orders. Sellers (and anyone
// without a buyer role) get a toast error instead of opening the modal.
//
// Props:
//   product    — the full product object from MongoDB
//   userEmail  — logged-in user's email (from session) — kept for backwards
//                compatibility, but the role check below uses the session directly
//   className  — optional extra Tailwind classes for the button wrapper
//   label      — optional override for the button label (default "Buy Now")
// =====================================================
export default function BuyNowButton({ product, userEmail, className = "", label = "Buy Now" }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const role = session?.user?.role;
  const isBuyer = role === "buyer";

  if (!product) return null;

  function handleClick() {
    if (!session) {
      toast.error("Please sign in to place an order.");
      return;
    }
    if (!isBuyer) {
      toast.error("Only buyers can order products.");
      return;
    }
    setOpen(true);
  }

return (
    <>
      {/* Trigger — native form, posts directly to /api/payment */}
     

        <motion.button
          type="submit"
          whileHover={{ scale: isBuyer ? 1.02 : 1 }}
          whileTap={{ scale: isBuyer ? 0.96 : 1 }}
          onClick={handleClick}
          aria-disabled={!isBuyer}
          className={`inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
            isBuyer
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          } ${className}`}
        >
          <Zap className="w-4 h-4" />
          {label}
        </motion.button>


      {/* Modal */}
      <AnimatePresence>
        {open && isBuyer && (
          <BuyNowModal
            product={product}
            userEmail={userEmail || session?.user?.email}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// =====================================================
// Modal
// =====================================================
function BuyNowModal({ product, userEmail, onClose }) {
  const [step, setStep] = useState("confirm"); // "confirm" | "loading" | "success"
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "/placeholder-product.png";

  async function handleConfirm() {



    setStep("loading");
    setError("");


    

    const payload = {
      buyerInfo: {
        email: userEmail,
      },
      sellerInfo: product.sellerInfo || {},
      productId: product._id,
      paymentStatus: "paid",
      orderStatus: "processing",
    };

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Read the body FIRST — the old code threw a generic error before
      // ever reading the response, which hid the real reason (e.g. "Not
      // enough stock available" or "Only buyers can order products") behind
      // "Order failed" every time.
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Order failed");
      }

      // Build a readable order object for the success screen.
      // If the API returns the inserted doc, use it; otherwise
      // shape it from what we sent + the insertedId MongoDB gives back.
      setOrder({
        _id: data.insertedId || data._id || "—",
        buyerInfo: {
          email: userEmail,
          name: data.buyerInfo?.name || userEmail,
        },
        sellerInfo: product.sellerInfo || {},
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        paymentStatus: "paid",
        orderStatus: "processing",
      });
      setStep("success");
    } catch (err) {
      console.error(err);
      setError(err.message || "Couldn't place your order. Please try again.");
      setStep("confirm");
    }
  }

  return (
    /* Backdrop */
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Sheet / Dialog */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <AnimatePresence mode="wait">
          {step === "confirm" && (
            <ConfirmStep
              key="confirm"
              product={product}
              image={image}
              userEmail={userEmail}
              error={error}
              onConfirm={handleConfirm}
              onClose={onClose}
            />
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-16 px-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="w-10 h-10 text-green-600" />
              </motion.div>
              <p className="text-sm font-medium text-gray-600">Placing your order…</p>
            </motion.div>
          )}

          {step === "success" && order && (
            <SuccessStep key="success" order={order} onClose={onClose} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// =====================================================
// Step 1 — Confirm
// =====================================================
function ConfirmStep({ product, image, userEmail, error, onConfirm, onClose }) {
  const hasDiscount =
    product.originalPrice && Number(product.originalPrice) > Number(product.price);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="px-5 pb-6 pt-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-bold text-gray-900">Confirm Order</h2>
      </div>

      {/* Product preview */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-green-600 mb-0.5">{product.category}</p>
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-3 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Order Details
        </p>

        <OrderDetailRow
          icon={User}
          label="Buyer"
          value={userEmail || "—"}
        />

        {product.sellerInfo?.name && (
          <OrderDetailRow
            icon={Store}
            label="Seller"
            value={product.sellerInfo.name}
          />
        )}

        {product.locationLabel && (
          <OrderDetailRow
            icon={MapPin}
            label="Location"
            value={product.locationLabel}
          />
        )}

        <OrderDetailRow
          icon={CreditCard}
          label="Payment"
          value="Paid online"
          valueClass="text-green-600 font-semibold"
        />
      </div>

      {/* Summary line */}
      <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-5">
        <span className="text-sm text-gray-600">Total to pay</span>
        <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3 text-center">{error}</p>
      )}

      {/* Actions */}
      <div className="flex  gap-2.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="flex-1 py-3 px-7 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </motion.button>
         <form action="/api/purchias" method="POST">
        <input type="hidden" name="price" value={product.price} />
        <input type="hidden" name="name" value={product.name} />
        <input type="hidden" name="productId" value={product._id} /> 



<motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Place Order
        </motion.button>

        </form>
      </div>
    </motion.div>
  );
}

// =====================================================
// Step 2 — Success
// =====================================================
function SuccessStep({ order, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="px-5 pb-7 pt-5 flex flex-col items-center text-center"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
      >
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </motion.div>

      <h2 className="text-lg font-bold text-gray-900">Order Placed!</h2>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        Your order has been confirmed and is now being processed.
      </p>

      {/* Order card */}
      <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-4 text-left space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Order Summary
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            <BadgeCheck className="w-3 h-3" />
            {order.orderStatus}
          </span>
        </div>

        <OrderDetailRow icon={ShoppingBag} label="Product" value={order.productName} />
        <OrderDetailRow
          icon={CreditCard}
          label="Amount"
          value={formatPrice(order.productPrice)}
          valueClass="font-bold text-gray-900"
        />
        <OrderDetailRow icon={User} label="Buyer" value={order.buyerInfo?.email || "—"} />
        {order.sellerInfo?.name && (
          <OrderDetailRow icon={Store} label="Seller" value={order.sellerInfo.name} />
        )}
        {order.sellerInfo?.email && (
          <OrderDetailRow icon={Mail} label="Seller email" value={order.sellerInfo.email} />
        )}

        <div className="pt-2 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Order ID:{" "}
            <span className="font-mono text-gray-600 text-[11px]">
              {String(order._id).slice(-12).toUpperCase()}
            </span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Payment:{" "}
            <span className="text-green-600 font-semibold capitalize">
              {order.paymentStatus}
            </span>
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
      >
        Done
      </motion.button>
    </motion.div>
  );
}

// =====================================================
// Micro: one detail row
// =====================================================
function OrderDetailRow({ icon: Icon, label, value, valueClass = "text-gray-700" }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-md bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className={`text-xs leading-snug truncate ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}