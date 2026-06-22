"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:5000";

function formatPrice(n) {
  return `৳ ${Number(n).toLocaleString("en-US")}`;
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TWO_DAYS_MS = 172800000;

function isNewProduct(createdAt) {
  if (!createdAt) return false;
  return new Date(createdAt).getTime() > Date.now() - TWO_DAYS_MS;
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
  }),
};

export default function LatestProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        // Sort by newest and take 6
        const sorted = [...data]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 6);

        setProducts(sorted);
      } catch (err) {
        console.error("Failed to fetch latest products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, []);

  return (
    /* FIXED: Swapped w-full for max-w-6xl mx-auto to fit cleanly alongside your other components */
    <section className="max-w-6xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">
            <Clock className="w-3.5 h-3.5" />
            Just Added
          </span>
          {/* Gradient headline */}
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Latest Products
            </span>
          </h2>
        </div>

        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Skeleton loader */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product cards */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => router.push(`/products/${product._id}`)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer group shadow-sm hover:shadow-md hover:border-green-100 transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={product.images?.[0] || "/placeholder-product.png"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* NEW badge — show if added within last 48 hours */}
                {isNewProduct(product.createdAt) && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    NEW
                  </span>
                )}
                {/* Time chip */}
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  {timeAgo(product.createdAt)}
                </span>
              </div>

              {/* Info */}
              <div className="p-2.5 sm:p-3">
                <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide truncate">
                  {product.category}
                </p>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2 leading-snug group-hover:text-green-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-gray-900 mt-1.5">
                  {formatPrice(product.price)}
                </p>
                {product.locationLabel && (
                  <p className="text-[10px] text-gray-400 mt-1 truncate">
                    {product.locationLabel}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No products added yet.
        </div>
      )}

      {/* Mobile View All */}
      <div className="mt-6 sm:hidden text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
        >
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}