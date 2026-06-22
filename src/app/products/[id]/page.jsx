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
  Star,
  MessageSquare,
  Send
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const API_BASE = "http://localhost:5000";

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

function buildLocationText(product) {
  if (product?.locationLabel) return product.locationLabel;
  const loc = product?.location;
  if (!loc) return "Location not set";
  return [loc.upazila, loc.district, loc.division].filter(Boolean).join(", ");
}

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

function subscribeNoop() { return () => {}; }
function getClientSnapshot() { return true; }
function getServerSnapshot() { return false; }
function useMounted() {
  return useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userEmail = session?.user?.email || null;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Review System States
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const mounted = useMounted();

  useEffect(() => {
    if (mounted && !isPending && !session) {
      router.push("/sign-in");
    }
  }, [mounted, isPending, session, router]);

  // Fetch product data
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

  // Fetch product reviews
  useEffect(() => {
    if (!mounted || !id || !session) return;

    async function fetchReviews() {
      try {
        const res = await fetch(`${API_BASE}/api/reviews?productId=${id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    }
    fetchReviews();
  }, [mounted, id, session]);

  // Check wishlist status
  useEffect(() => {
    if (!mounted || !id || !userEmail) return;

    async function checkWishlist() {
      try {
        const res = await fetch(
          `${API_BASE}/api/wishlist/check?email=${encodeURIComponent(userEmail)}&productId=${id}`
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

  async function toggleWishlist() {
    if (!product || !userEmail) return;
    const productId = product._id;
    const isWishlisted = wishlisted;

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
      setWishlisted(isWishlisted);
    }
  }

  // Check cart status
  useEffect(() => {
    if (!mounted || !id || !userEmail) return;

    async function checkCart() {
      try {
        const res = await fetch(
          `${API_BASE}/api/cart/check?email=${encodeURIComponent(userEmail)}&productId=${id}`
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

  async function toggleCart() {
    if (!product || !userEmail) return;
    const productId = product._id;
    const isInCart = inCart;

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
      setInCart(isInCart);
    }
  }

  // Handle Review Form Submission
  async function handleAddReview(e) {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;

    setSubmittingReview(true);
    const reviewData = {
      productId: id,
      reviewerInfo: {
        userId: session.user.id || "unknown",
        name: session.user.name || "Anonymous User",
      },
      rating: newRating,
      comment: newComment.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews([savedReview, ...reviews]);
        setNewComment("");
        setNewRating(5);
      }
    } catch (err) {
      console.error("Error creating review", err);
    } finally {
      setSubmittingReview(false);
    }
  }

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
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && product && (
          <>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
            >
              {/* Image Slider */}
              <motion.div variants={fadeUp} custom={0}>
                <DetailImageSlider
                  images={product.images}
                  alt={product.name}
                  activeImage={activeImage}
                  setActiveImage={setActiveImage}
                />
              </motion.div>

              {/* Specs & Ordering Details */}
              <motion.div variants={fadeUp} custom={0.1} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                      <Tag className="w-3 h-3" />
                      {product.category}
                    </span>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2 break-words">
                      {product.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      onClick={toggleWishlist}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.stock != null && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${isOutOfStock ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
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
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 mt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {buildLocationText(product)}
                  </span>
                  {product.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {timeAgo(product.createdAt)}
                    </span>
                  )}
                  {product.condition && (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      {product.condition}
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                  <motion.button
                    onClick={toggleCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-2.5 sm:py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : inCart ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {inCart ? "Added to Cart" : "Add to Cart"}
                  </motion.button>
                  <BuyNowButton product={product} userEmail={userEmail} className="flex-1" />
                </div>

                {product.description && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-1.5">Description</h2>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line break-words">
                      {product.description}
                    </p>
                  </div>
                )}

                <ProductSpecs product={product} />
                <SellerCard sellerInfo={product.sellerInfo} />
              </motion.div>
            </motion.div>

            {/* ============ RATINGS & COMMENTS SECTION ============ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm"
            >
              <div className="border-b border-gray-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Buyer Reviews & Ratings
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    See verified ratings from community marketplace members.
                  </p>
                </div>
                
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                    <div className="flex text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              {/* New Review Input Form */}
              <form onSubmit={handleAddReview} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Leave a Review</h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs text-gray-600 mr-1">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="text-amber-400 transition-transform active:scale-90"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? "fill-amber-400" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this item or seller..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview || !newComment.trim()}
                    className="bg-green-600 text-white rounded-xl px-4 flex items-center justify-center hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shrink-0"
                  >
                    {submittingReview ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>

              {/* Review List Streams */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No reviews yet. Be the first to share your feedback!
                  </div>
                ) : (
                  reviews.map((rev, index) => (
                    <motion.div
                      key={rev._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white border border-gray-100 rounded-xl shadow-2xs flex flex-col sm:flex-row gap-3 justify-between items-start"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{rev.reviewerInfo?.name}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{rev.comment}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap self-end sm:self-start">
                        {rev.createdAt ? timeAgo(rev.createdAt) : "Verified Purchase"}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailImageSlider({ images = [], alt, activeImage, setActiveImage }) {
  const safeImages = images?.length > 0 ? images : ["/placeholder-product.png"];
  function goTo(i) { setActiveImage((i + safeImages.length) % safeImages.length); }

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
            transition={{ duration: 0.35 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {safeImages.length > 1 && (
          <>
            <motion.button onClick={() => goTo(activeImage - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white"><ChevronLeft className="w-4 h-4 text-gray-700" /></motion.button>
            <motion.button onClick={() => goTo(activeImage + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white"><ChevronRight className="w-4 h-4 text-gray-700" /></motion.button>
          </>
        )}
      </div>
    </div>
  );
}

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
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-2">Specifications</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white rounded-xl border border-gray-200 p-4">
        {specs.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-sm font-medium text-gray-800 ${s.capitalize ? "capitalize" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SellerCard({ sellerInfo }) {
  if (!sellerInfo) return null;
  const { name, email, image, userId } = sellerInfo;

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Seller Information</h2>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden ring-2 ring-green-50">
          {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <span className="text-green-700 font-semibold text-lg">{name?.charAt(0).toUpperCase()}</span>}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 truncate">{name || "Unknown Seller"}</p>
          {userId && <p className="text-xs text-gray-400">ID: {userId}</p>}
        </div>
      </div>
      {email && (
        <a href={`mailto:${email}`} className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
          <Mail className="w-4 h-4" />
          <span className="truncate">{email}</span>
        </a>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      <div className="aspect-square bg-white rounded-2xl border border-gray-200" />
      <div className="space-y-4">
        <div className="h-6 w-24 bg-gray-100 rounded-full" />
        <div className="h-7 w-3/4 bg-gray-100 rounded-lg" />
        <div className="h-9 w-1/3 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}