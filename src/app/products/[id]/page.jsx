"use client";
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BuyNowButton from "@/components/BuyNowButton";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  Mail,
  Tag,
  Boxes,
  BadgeCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

// =====================================================
// CONFIG
// =====================================================
const API_BASE = "http://localhost:5000";
// FIXED: no more hardcoded CURRENT_USER_EMAIL. Every wishlist/cart call below
// now uses the real logged-in user's email from the session, the same way
// ProductsPage.jsx already does. This is what was causing one user's
// wishlist/cart actions to bleed into another user's data.

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

// Builds a human-readable location string dynamically from whatever
// pieces are present, falling back to locationLabel if that's all we have.
function buildLocationText(product) {
  if (product?.locationLabel) return product.locationLabel;
  const loc = product?.location;
  if (!loc) return "Location not set";
  return [loc.upazila, loc.district, loc.division].filter(Boolean).join(", ");
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
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// =====================================================
// Hydration-safe "are we on the client yet" hook.
// useSyncExternalStore is the React-recommended way to do this —
// no setState call inside an effect, so it doesn't trigger the
// react-hooks/set-state-in-effect lint rule, and it still guarantees
// the server render and the first client paint match (both "false"),
// only flipping to "true" after hydration is done.
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
export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userEmail = session?.user?.email || null; // FIXED: real user, not a hardcoded constant

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // -----------------------------------------------------
  // HYDRATION FIX: useSession() can resolve differently between the
  // server render and the very first client render (it reads client-only
  // state like cookies/localStorage), which made React see two different
  // trees and regenerate the whole page on the client — wiping in-flight
  // effects like the wishlist/cart checks. `mounted` guarantees the server
  // HTML and the first client paint are identical (always the skeleton);
  // real content only swaps in after hydration has safely finished.
  // -----------------------------------------------------
  const mounted = useMounted();

  // -----------------------------------------------------
  // Auth guard — push to /sign-in once we know there's no session
  // -----------------------------------------------------
  useEffect(() => {
    if (mounted && !isPending && !session) {
      router.push("/sign-in");
    }
  }, [mounted, isPending, session, router]);

  // -----------------------------------------------------
  // Fetch product by id
  // -----------------------------------------------------
  useEffect(() => {
    if (!mounted || !id || isPending || !session) return;

    async function fetchProduct() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Couldn't load this product. It may have been removed.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [mounted, id, isPending, session]);

  // -----------------------------------------------------
  // Check wishlist status for this product + the REAL current user
  // -----------------------------------------------------
  useEffect(() => {
    if (!mounted || !id || !userEmail) return;

    async function checkWishlist() {
      try {
        const res = await fetch(
          `${API_BASE}/api/wishlist/check?email=${encodeURIComponent(
            userEmail
          )}&productId=${id}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setWishlisted(!!data.wishlisted);
      } catch (err) {
        console.error("Couldn't check wishlist status", err);
      }
    }
    checkWishlist();
  }, [mounted, id, userEmail]);

  // -----------------------------------------------------
  // Wishlist toggle — click heart ON adds, click again removes
  // -----------------------------------------------------
  async function toggleWishlist() {
    if (!product || !userEmail) return;
    const productId = product._id;
    const isWishlisted = wishlisted;

    // optimistic UI update
    setWishlisted(!isWishlisted);

    try {
      if (isWishlisted) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, productId }),
        });
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, productId }),
        });
      }
    } catch (err) {
      console.error("Wishlist update failed", err);
      // revert optimistic update on failure
      setWishlisted(isWishlisted);
    }
  }

  // -----------------------------------------------------
  // Check cart status for this product + the REAL current user
  // -----------------------------------------------------
  useEffect(() => {
    if (!mounted || !id || !userEmail) return;

    async function checkCart() {
      try {
        const res = await fetch(
          `${API_BASE}/api/cart/check?email=${encodeURIComponent(
            userEmail
          )}&productId=${id}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setInCart(!!data.inCart);
      } catch (err) {
        console.error("Couldn't check cart status", err);
      }
    }
    checkCart();
  }, [mounted, id, userEmail]);

  // -----------------------------------------------------
  // Cart toggle — saved to backend (same pattern as ProductsPage).
  // This page is already private/auth-guarded above, so no
  // login-required toast is needed here.
  // -----------------------------------------------------
  async function toggleCart() {
    if (!product || !userEmail) return;
    const productId = product._id;
    const isInCart = inCart;

    // optimistic UI update
    setInCart(!isInCart);

    try {
      if (isInCart) {
        await fetch(`${API_BASE}/api/cart`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, productId }),
        });
      } else {
        await fetch(`${API_BASE}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, productId }),
        });
      }
    } catch (err) {
      console.error("Cart update failed", err);
      // revert optimistic update on failure
      setInCart(isInCart);
    }
  }

  // -----------------------------------------------------
  // Render states
  // -----------------------------------------------------
  if (!mounted || isPending || (!session && !isPending)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  const isOutOfStock = product && Number(product.stock) <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </motion.div>

        {loading && <DetailSkeleton />}

        {!loading && errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center text-gray-500"
          >
            {errorMsg}
          </motion.div>
        )}

        {!loading && !errorMsg && product && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
          >
            {/* ============ LEFT: Image gallery ============ */}
            <motion.div variants={fadeUp} custom={0}>
              <DetailImageSlider
                images={product.images}
                alt={product.name}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
              />
            </motion.div>

            {/* ============ RIGHT: Info ============ */}
            <motion.div variants={fadeUp} custom={0.1} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {product.category}
                  </motion.span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2 break-words">
                    {product.name}
                  </h1>
                </div>
<div className="flex items-center gap-2 flex-shrink-0">
  <motion.button
    onClick={toggleWishlist}
    whileTap={{ scale: 0.9 }}
    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
  >
    <Heart
      className={`w-5 h-5 ${
        wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
      }`}
    />
  </motion.button>
  </div>
          
              </div>

              <motion.div
                variants={fadeUp}
                custom={0.15}
                className="flex items-center gap-3 mt-3 flex-wrap"
              >
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.stock != null && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      isOutOfStock
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
                  </span>
                )}
                {product.status && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 capitalize">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {product.status}
                  </span>
                )}
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={0.2}
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 mt-3"
              >
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {buildLocationText(product)}
                </span>
                {product.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    {timeAgo(product.createdAt)}
                  </span>
                )}
                {product.condition && (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    {product.condition}
                  </span>
                )}
              </motion.div>

              {/* Action buttons */}
              <motion.div variants={fadeUp} custom={0.25} className="flex gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                <motion.button
                  onClick={toggleCart}
                  disabled={isOutOfStock}
                  whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                  whileTap={{ scale: isOutOfStock ? 1 : 0.96 }}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : inCart
                      ? "bg-green-600 text-white"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {inCart ? "Added to Cart" : "Add to Cart"}
                </motion.button>
                    <BuyNowButton
  product={product}
  userEmail={userEmail}
  className="flex-1"
/>
              </motion.div>

              {/* Description */}
              {product.description && (
                <motion.div variants={fadeUp} custom={0.3} className="mt-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1.5">Description</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line break-words">
                    {product.description}
                  </p>
                </motion.div>
              )}

              {/* Specs grid — fully dynamic from actual product fields */}
              <ProductSpecs product={product} />

              {/* Seller card */}
              <SellerCard sellerInfo={product.sellerInfo} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Image gallery with main slider + thumbnail strip
// =====================================================
function DetailImageSlider({ images = [], alt, activeImage, setActiveImage }) {
  const safeImages = images?.length > 0 ? images : ["/placeholder-product.png"];

  function goTo(i) {
    setActiveImage((i + safeImages.length) % safeImages.length);
  }

  return (
    <div>
      <div className="relative w-full aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={safeImages[activeImage]}
            alt={alt}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {safeImages.length > 1 && (
          <>
            <motion.button
              onClick={() => goTo(activeImage - 1)}
              aria-label="Previous image"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </motion.button>
            <motion.button
              onClick={() => goTo(activeImage + 1)}
              aria-label="Next image"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </motion.button>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {safeImages.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Show image ${i + 1}`}
                  whileHover={{ scale: 1.3 }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
          }}
          className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mt-3"
        >
          {safeImages.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              variants={fadeUp}
              custom={0}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeImage ? "border-green-600" : "border-transparent"
              }`}
            >
              <img src={img} alt={`${alt} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// =====================================================
// Specs grid — only shows fields that actually exist on the product.
// Pulled dynamically; nothing here is hardcoded to a fixed schema.
// =====================================================
function ProductSpecs({ product }) {
  const specs = [
    { label: "Category", value: product.category },
    { label: "Condition", value: product.condition },
    { label: "Stock", value: product.stock != null ? `${product.stock} units` : null },
    { label: "Status", value: product.status, capitalize: true },
    { label: "Division", value: product.location?.division },
    { label: "District", value: product.location?.district },
    { label: "Upazila", value: product.location?.upazila },
  ].filter((s) => s.value);

  if (specs.length === 0) return null;

  return (
    <motion.div variants={fadeUp} custom={0.35} className="mt-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-2">Specifications</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white rounded-xl border border-gray-200 p-4">
        {specs.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.04 }}
          >
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-sm font-medium text-gray-800 ${s.capitalize ? "capitalize" : ""}`}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// =====================================================
// Seller card — built entirely from product.sellerInfo
// =====================================================
function SellerCard({ sellerInfo }) {
  if (!sellerInfo) return null;

  const { name, email, image, userId } = sellerInfo;

  return (
    <motion.div
      variants={fadeUp}
      custom={0.45}
      whileHover={{ y: -3 }}
      className="mt-6 bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Seller Information</h2>
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, delay: 0.5 }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-green-50"
        >
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-green-700 font-semibold text-lg">
              {name ? name.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </motion.div>
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            {name || "Unknown Seller"}
          </p>
          {userId && (
            <p className="text-xs text-gray-400 truncate">ID: {userId}</p>
          )}
        </div>
      </div>

      {email && (
        <motion.a
          href={`mailto:${email}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          whileHover={{ x: 3 }}
          className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
        >
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{email}</span>
        </motion.a>
      )}
    </motion.div>
  );
}

// =====================================================
// Loading skeleton
// =====================================================
function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 animate-pulse">
      <div className="aspect-square bg-white rounded-2xl border border-gray-200" />
      <div className="space-y-4">
        <div className="h-6 w-24 bg-gray-100 rounded-full" />
        <div className="h-7 sm:h-8 w-3/4 bg-gray-100 rounded-lg" />
        <div className="h-9 sm:h-10 w-1/3 bg-gray-100 rounded-lg" />
        <div className="h-20 sm:h-24 w-full bg-gray-100 rounded-xl" />
        <div className="h-28 sm:h-32 w-full bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}