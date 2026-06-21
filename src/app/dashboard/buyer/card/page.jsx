"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  Tag,
  ShieldCheck,
  RotateCcw,
  Truck,
  Headphones,
  Zap,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

// =====================================================
// CONFIG — same backend as ProductsPage / ProductDetailPage
// =====================================================
const API_BASE = "http://localhost:5000";
const DELIVERY_FEE = 60;

// =====================================================
// Helpers (shared style with the rest of the app)
// =====================================================
function formatPrice(n) {
  return `৳ ${Number(n || 0).toLocaleString("en-US")}`;
}

function lineDiscount(item) {
  if (!item.originalPrice || item.originalPrice <= item.price) return 0;
  return (item.originalPrice - item.price) * (item.quantity || 1);
}

// =====================================================
// Animation variants
// =====================================================
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.95,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

// =====================================================
// Main Page
// =====================================================
export default function CartPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userEmail = session?.user?.email || null;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [removingIds, setRemovingIds] = useState(new Set());

  // -----------------------------------------------------
  // Auth guard — cart is private, same pattern as ProductDetailPage
  // -----------------------------------------------------
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  // -----------------------------------------------------
  // Fetch cart for the logged-in user
  // -----------------------------------------------------
  useEffect(() => {
    if (!userEmail) return;

    async function fetchCart() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`${API_BASE}/api/cart?email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        // normalize: make sure every item has a quantity to work with locally
        setCartItems(data.map((item) => ({ quantity: 1, ...item })));
      } catch (err) {
        console.error(err);
        setErrorMsg("Couldn't load your cart. Check that your API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [userEmail]);

  // -----------------------------------------------------
  // Remove a single product from the cart collection (DB)
  // -----------------------------------------------------
  async function removeFromCart(productId) {
    if (!userEmail) return;

    const snapshot = cartItems;
    setRemovingIds((prev) => new Set(prev).add(productId));
    // optimistic UI update — drop it from the list right away
    setCartItems((prev) => prev.filter((p) => p._id !== productId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, productId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Removed from cart");
    } catch (err) {
      console.error("Couldn't remove item from cart", err);
      toast.error("Couldn't remove item, please try again");
      // revert on failure — put the cart back the way it was
      setCartItems(snapshot);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  // -----------------------------------------------------
  // Remove every checked item — same DB call, fired in parallel
  // -----------------------------------------------------
  async function removeSelected() {
    if (!userEmail || selectedIds.size === 0) return;

    const idsToRemove = Array.from(selectedIds);
    const snapshot = cartItems;
    setRemovingIds((prev) => new Set([...prev, ...idsToRemove]));
    setCartItems((prev) => prev.filter((p) => !selectedIds.has(p._id)));
    setSelectedIds(new Set());

    try {
      const results = await Promise.allSettled(
        idsToRemove.map((productId) =>
          fetch(`${API_BASE}/api/cart`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, productId }),
          })
        )
      );
      const failed = results.some((r) => r.status === "rejected" || !r.value?.ok);
      if (failed) {
        toast.error("Some items couldn't be removed, please try again");
        setCartItems(snapshot);
      } else {
        toast.success(`Removed ${idsToRemove.length} item${idsToRemove.length > 1 ? "s" : ""}`);
      }
    } catch (err) {
      console.error("Bulk remove failed", err);
      toast.error("Couldn't remove selected items");
      setCartItems(snapshot);
    } finally {
      setRemovingIds(new Set());
    }
  }

  // -----------------------------------------------------
  // Quantity stepper — local first, then best-effort sync to backend
  // -----------------------------------------------------
  function changeQuantity(productId, delta) {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id !== productId) return item;
        const max = item.stock != null ? Number(item.stock) : 20;
        const nextQty = Math.min(max, Math.max(1, (item.quantity || 1) + delta));
        // best-effort sync — cart quantity isn't part of the original API contract,
        // so failures here are silent and don't block the local UI
        fetch(`${API_BASE}/api/cart`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, productId, quantity: nextQty }),
        }).catch(() => {});
        return { ...item, quantity: nextQty };
      })
    );
  }

  function toggleSelect(productId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === cartItems.length ? new Set() : new Set(cartItems.map((p) => p._id))
    );
  }

  // -----------------------------------------------------
  // Totals
  // -----------------------------------------------------
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.price || 0) * (i.quantity || 1), 0);
    const discount = cartItems.reduce((sum, i) => sum + lineDiscount(i), 0);
    const deliveryFee = cartItems.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal - discount + deliveryFee;
    return { subtotal, discount, deliveryFee, total };
  }, [cartItems]);

  const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  if (isPending || (!session && !isPending)) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <CartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Breadcrumb */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 mb-2"
        >
          Home &gt; Cart
        </motion.p>

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3">
            <motion.span
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
            </motion.span>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Cart</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Review your items and proceed to checkout
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.1}>
            <Link href="/dashboard/products">
              <motion.span
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md hover:text-green-600 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {loading && <CartSkeleton />}

        {!loading && errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center text-gray-500"
          >
            {errorMsg}
          </motion.div>
        )}

        {!loading && !errorMsg && cartItems.length === 0 && <EmptyCart />}

        {!loading && !errorMsg && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ============ LEFT: Cart items ============ */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.05}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Cart Items ({cartItems.length})
                  </h2>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Select All
                    </label>
                    <motion.button
                      onClick={removeSelected}
                      disabled={selectedIds.size === 0}
                      whileHover={selectedIds.size > 0 ? { scale: 1.03 } : {}}
                      whileTap={selectedIds.size > 0 ? { scale: 0.96 } : {}}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        selectedIds.size === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-red-500 hover:text-red-600"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Selected
                      {selectedIds.size > 0 && (
                        <span className="text-xs">({selectedIds.size})</span>
                      )}
                    </motion.button>
                  </div>
                </div>

                <motion.div layout className="flex flex-col gap-3" style={{ overflow: "hidden" }}>
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => (
                      <CartItemRow
                        key={item._id}
                        item={item}
                        selected={selectedIds.has(item._id)}
                        removing={removingIds.has(item._id)}
                        onToggleSelect={() => toggleSelect(item._id)}
                        onRemove={() => removeFromCart(item._id)}
                        onChangeQuantity={(delta) => changeQuantity(item._id, delta)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Reserved items banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3.5"
                >
                  <motion.span
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-700" />
                  </motion.span>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Your items are reserved in your cart.</span>{" "}
                    <span className="text-gray-500">
                      Complete your purchase before someone else buys them.
                    </span>
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* ============ RIGHT: Order summary ============ */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.15}
              className="lg:col-span-1"
            >
              <OrderSummary totals={totals} itemCount={cartItems.length} />
            </motion.div>
          </div>
        )}

        {/* Trust strip */}
        {!loading && !errorMsg && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="mt-8 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-5"
          >
            <TrustItem icon={ShieldCheck} title="Safe & Secure" desc="Your transaction is 100% secure" delay={0} />
            <TrustItem icon={RotateCcw} title="Easy Returns" desc="7-day easy return policy" delay={0.05} />
            <TrustItem icon={Truck} title="Fast Delivery" desc="Get your order delivered fast" delay={0.1} />
            <TrustItem icon={Headphones} title="Best Support" desc="24/7 customer support" delay={0.15} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Single cart row
// =====================================================
function CartItemRow({ item, selected, removing, onToggleSelect, onRemove, onChangeQuantity }) {
  const thumb = item.images?.[0] || "/placeholder-product.png";
  const qty = item.quantity || 1;

  return (
    <motion.div
      layout
      variants={rowVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      whileHover={{ y: -2 }}
      className={`relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border p-3 sm:p-3.5 transition-colors ${
        selected ? "border-green-300 bg-green-50/40" : "border-gray-100 bg-white"
      } ${removing ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
        />

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0"
        >
          <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
        </motion.div>

        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600">
            <Tag className="w-3 h-3" />
            {item.category}
          </span>
          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{item.name}</p>
          {item.condition && (
            <p className="text-xs text-gray-500 mt-0.5">Condition: {item.condition}</p>
          )}
          {item.sellerInfo?.name && (
            <p className="text-xs text-gray-400">Seller: {item.sellerInfo.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1.5 sm:w-32 flex-shrink-0">
        <div className="text-right">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={item.price}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="text-sm sm:text-base font-bold text-gray-900"
            >
              {formatPrice(item.price)}
            </motion.p>
          </AnimatePresence>
          {item.originalPrice > item.price && (
            <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-1">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onChangeQuantity(-1)}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              qty <= 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
          </motion.button>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={qty}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-sm font-medium text-gray-800 w-5 text-center"
            >
              {qty}
            </motion.span>
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onChangeQuantity(1)}
            aria-label="Increase quantity"
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-200"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      <motion.button
        onClick={onRemove}
        aria-label="Remove from cart"
        whileHover={{ scale: 1.12, rotate: -8 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-2.5 right-2.5 sm:static sm:ml-2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

// =====================================================
// Order summary panel
// =====================================================
function OrderSummary({ totals, itemCount }) {
  const { subtotal, discount, deliveryFee, total } = totals;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 lg:sticky lg:top-6"
    >
      <h2 className="font-semibold text-gray-900 text-base sm:text-lg mb-4">Order Summary</h2>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>Subtotal ({itemCount} item{itemCount > 1 ? "s" : ""})</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between text-gray-600"
          >
            <span>Discount</span>
            <span className="font-medium text-red-500">- {formatPrice(discount)}</span>
          </motion.div>
        )}
        <div className="flex items-center justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span className="font-medium text-gray-900">{formatPrice(deliveryFee)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 my-4" />

      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">Total</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={total}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="text-xl sm:text-2xl font-bold text-gray-900"
          >
            {formatPrice(total)}
          </motion.span>
        </AnimatePresence>
      </div>

      {discount > 0 && (
        <p className="text-xs text-green-600 font-medium mt-1.5">
          You saved {formatPrice(discount)} on this order
        </p>
      )}

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => toast.success("Heading to checkout...")}
        className="w-full mt-5 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        Buy All ({itemCount} Item{itemCount > 1 ? "s" : ""})
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => toast("Order placed — we'll confirm shortly", { icon: "⚡" })}
        className="w-full mt-2.5 py-3 rounded-xl border border-gray-900 text-gray-900 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-colors"
      >
        <Zap className="w-4 h-4" />
        Place Order
      </motion.button>

      <div className="mt-5 text-center">
        <p className="text-xs text-gray-400 mb-2">We accept</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {["VISA", "Mastercard", "bKash", "Nagad"].map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ y: -2 }}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-1"
            >
              <CreditCard className="w-3 h-3" />
              {label}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// Trust strip item
// =====================================================
function TrustItem({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div variants={fadeUp} custom={delay} className="flex flex-col items-center text-center gap-2">
      <motion.span
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-green-50 flex items-center justify-center"
      >
        <Icon className="w-5 h-5 text-green-700" />
      </motion.span>
      <p className="text-xs sm:text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-[11px] sm:text-xs text-gray-500 leading-snug hidden sm:block">{desc}</p>
    </motion.div>
  );
}

// =====================================================
// Empty cart state
// =====================================================
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-14 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"
      >
        <ShoppingBag className="w-7 h-7 text-green-600" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
      <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
        Looks like you havent added anything yet. Browse products and find something you like.
      </p>
      <Link href="/dashboard/products">
        <motion.span
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Products
        </motion.span>
      </Link>
    </motion.div>
  );
}

// =====================================================
// Loading skeleton
// =====================================================
function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="h-5 w-32 bg-gray-100 rounded-lg mb-2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 sm:h-[78px] w-full bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="h-5 w-28 bg-gray-100 rounded-lg" />
        <div className="h-4 w-full bg-gray-100 rounded-lg" />
        <div className="h-4 w-full bg-gray-100 rounded-lg" />
        <div className="h-10 w-full bg-gray-100 rounded-xl mt-4" />
        <div className="h-10 w-full bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}