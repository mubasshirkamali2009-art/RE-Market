"use client";
import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth-client";

// =====================================================
// CONFIG
// =====================================================
const API_BASE = `${process.env.NEXT_PUBLIC_BASE_URL}`;
// FIXED: no more hardcoded CURRENT_USER_EMAIL. This page now reads the
// real logged-in user's email from the session — same as ProductsPage,
// ProductDetailPage, and CartPage. The hardcoded constant was why every
// wishlist add/remove/fetch was always scoped to "rakib@example.com"
// regardless of who was actually signed in.

// =====================================================
// Helpers
// =====================================================
function formatPrice(n) {
  return `৳ ${Number(n).toLocaleString("en-US")}`;
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// =====================================================
// Animation variants
// =====================================================
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: {
    opacity: 0,
    scale: 0.9,
    x: -30,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

// =====================================================
// Hydration-safe "are we on the client yet" hook — same approach used
// in ProductDetailPage. useSyncExternalStore avoids the
// react-hooks/set-state-in-effect lint warning and guarantees the
// server render and the first client paint match.
// =====================================================
function subscribeNoop() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}
function useMounted() {
  return useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
}

// =====================================================
// Main Page — PRIVATE: redirects to /sign-in if no session
// =====================================================
export default function WishlistClient() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userEmail = session?.user?.email || null; // FIXED: real user, not a hardcoded constant
  const mounted = useMounted();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [removingIds, setRemovingIds] = useState(new Set());

  // -----------------------------------------------------
  // Auth guard — push to /sign-in once we know there's no session
  // -----------------------------------------------------
  useEffect(() => {
    if (mounted && !isPending && !session) {
      router.push("/sign-in");
    }
  }, [mounted, isPending, session, router]);

  // -----------------------------------------------------
  // Fetch wishlist for the REAL current user, only once the session
  // has actually resolved on the client.
  // -----------------------------------------------------
  useEffect(() => {
    if (!mounted || isPending || !userEmail) return;

    async function fetchWishlist() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(
          `${API_BASE}/api/wishlist?email=${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Couldn't load your wishlist. Check that your API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [mounted, isPending, userEmail]);

  // -----------------------------------------------------
  // Remove item — optimistic, with a short fade/slide-out first
  // -----------------------------------------------------
  async function handleRemove(product) {
    if (!userEmail) return;
    const productId = product._id;

    setRemovingIds((prev) => new Set(prev).add(productId));

    // let exit animation play before actually removing from list
    setTimeout(() => {
      setItems((prev) => prev.filter((p) => p._id !== productId));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 250);

    try {
      await fetch(`${API_BASE}/api/wishlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, productId }),
      });
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
      // re-fetch on failure so UI stays consistent with server
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/wishlist?email=${encodeURIComponent(userEmail)}`
        );
        if (res.ok) setItems(await res.json());
      } finally {
        setLoading(false);
      }
    }
  }

  // While we don't yet know who's logged in (server render, or session
  // still resolving on the client), always show the loading skeleton so
  // the server HTML and the first client paint match exactly.
  const showLoading = !mounted || isPending || loading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb + heading */}
        <Link
          href="/dashboard/buyer"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-7 h-7 fill-red-500 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Products you&apos;ve saved for later. {items.length > 0 && `(${items.length} item${items.length > 1 ? "s" : ""})`}
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        {showLoading && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 h-72 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!showLoading && errorMsg && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
            {errorMsg}
          </div>
        )}

        {/* Empty state */}
        {!showLoading && !errorMsg && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-2xl border border-gray-200 p-10 sm:p-16 text-center"
          >
            <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              Tap the heart icon on any product to save it here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Browse Products
            </Link>
          </motion.div>
        )}

        {/* Grid */}
        {!showLoading && !errorMsg && items.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {items.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  isRemoving={removingIds.has(product._id)}
                  onRemove={() => handleRemove(product)}
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
// Card
// =====================================================
function WishlistCard({ product, isRemoving, onRemove }) {
  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "/placeholder-product.png";

  return (
    <motion.div
      layout
      variants={cardVariants}
      exit="exit"
      animate={isRemoving ? "exit" : "show"}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      <Link href={`/products/${product._id}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        <motion.img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Remove button */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Remove from wishlist"
          className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
        </motion.button>

        {/* condition badge */}
        {product.condition && (
          <span className="absolute bottom-2 left-2 text-[11px] font-medium bg-black/55 text-white px-2 py-0.5 rounded-full backdrop-blur">
            {product.condition}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-green-600">{product.category}</span>
        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mt-0.5 line-clamp-1 hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm sm:text-base font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span className="truncate">📍 {product.locationLabel || "Location not set"}</span>
          <span className="flex-shrink-0 ml-2">{timeAgo(product.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Link
            href={`/products/${product._id}`}
            className="flex-1"
          >
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Now
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}