"use client";
import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Heart, ShoppingCart, Search, LayoutGrid, List, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useSession } from "@/lib/auth-client";

// =====================================================
// CONFIG
// =====================================================
const API_BASE = `${process.env.NEXT_PUBLIC_BASE_URL}`; // change to your live API URL

const CATEGORIES = [
  "Phones",
  "Laptops",
  "Tablets",
  "Desktop Computers",
  "TV & Monitors",
  "Cameras",
  "Audio & Headphones",
  "Gaming Consoles",
  "Smart Watches",
  "Printers & Scanners",
  "Networking Devices",
  "Computer Parts",
  // Fashion
  "Men's Clothing",
  "Women's Clothing",
  "Kids' Clothing",
  "Footwear",
  "Bags & Luggage",
  "Watches",
  "Jewelry",
  "Accessories",
  // Home & Living
  "Furniture",
  "Home Appliances",
  "Kitchen & Cookware",
  "Bedding & Curtains",
  "Home Décor",
  "Tools & Hardware",
  "Air Conditioners & Fans",
  // Vehicles
  "Cars",
  "Motorcycles",
  "Bicycles",
  "Auto Parts & Accessories",
  "CNG & Auto Rickshaws",
  // Sports & Outdoors
  "Sports Equipment",
  "Fitness & Gym",
  "Outdoor & Camping",
  // Books, Hobbies & Kids
  "Books & Magazines",
  "Toys & Games",
  "Baby & Kids Items",
  "Musical Instruments",
  "Art & Craft Supplies",
  // Other
  "Health & Beauty",
  "Pet Supplies",
  "Agriculture & Farm",
  "Office Supplies",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Used"];

const PRODUCTS_PER_PAGE = 12;
const SLIDE_INTERVAL_MS = 2500; // auto-advance timing for the image slider

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
// Page wrapper — useSearchParams needs a Suspense boundary
// =====================================================
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================
function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [cartIds, setCartIds] = useState(new Set());

  // filters
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category");

  const [search, setSearch] = useState(() => searchParam);
  const [selectedCategories, setSelectedCategories] = useState(() =>
    categoryParam ? new Set([categoryParam]) : new Set()
  );
  const [selectedConditions, setSelectedConditions] = useState(new Set());
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100000);
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);

  // -----------------------------------------------------
  // Keep the filters in sync with the URL parameters.
  // -----------------------------------------------------
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategories(categoryParam ? new Set([categoryParam]) : new Set());
    setPage(1);
  }

  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setSearch(searchParam);
    setPage(1);
  }

  // -----------------------------------------------------
  // Fetch products
  // -----------------------------------------------------
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Couldn't load products. Check that your API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // -----------------------------------------------------
  // Fetch user's existing wishlist
  // -----------------------------------------------------
  useEffect(() => {
    if (!userEmail) {
      setWishlistIds(new Set());
      return;
    }

    async function fetchWishlist() {
      try {
        const res = await fetch(
          `${API_BASE}/api/wishlist?email=${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setWishlistIds(new Set(data.map((p) => p._id)));
      } catch (err) {
        console.error("Couldn't load wishlist", err);
      }
    }
    fetchWishlist();
  }, [userEmail]);

  // -----------------------------------------------------
  // Fetch user's existing cart
  // -----------------------------------------------------
  useEffect(() => {
    if (!userEmail) {
      setCartIds(new Set());
      return;
    }

    async function fetchCart() {
      try {
        const res = await fetch(
          `${API_BASE}/api/cart?email=${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setCartIds(new Set(data.map((p) => p._id)));
      } catch (err) {
        console.error("Couldn't load cart", err);
      }
    }
    fetchCart();
  }, [userEmail]);

  // -----------------------------------------------------
  // Wishlist toggle
  // -----------------------------------------------------
  async function toggleWishlist(product) {
    if (!userEmail) {
      toast.error("Please login to use wishlist");
      router.push("/sign-in");
      return;
    }

    const productId = product._id;
    const isWishlisted = wishlistIds.has(productId);

    setWishlistIds((prev) => {
      const next = new Set(prev);
      isWishlisted ? next.delete(productId) : next.add(productId);
      return next;
    });

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
      setWishlistIds((prev) => {
        const next = new Set(prev);
        isWishlisted ? next.add(productId) : next.delete(productId);
        return next;
      });
    }
  }

  // -----------------------------------------------------
  // Cart toggle
  // -----------------------------------------------------
  async function toggleCart(product) {
    if (!userEmail) {
      toast.error("Please login to add items to your cart");
      router.push("/sign-in");
      return;
    }

    const productId = product._id;
    const isInCart = cartIds.has(productId);

    setCartIds((prev) => {
      const next = new Set(prev);
      isInCart ? next.delete(productId) : next.add(productId);
      return next;
    });

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
        toast.success("Added to cart");
      }
    } catch (err) {
      console.error("Cart update failed", err);
      toast.error("Couldn't update cart, please try again");
      setCartIds((prev) => {
        const next = new Set(prev);
        isInCart ? next.add(productId) : next.delete(productId);
        return next;
      });
    }
  }

  function toggleCategory(cat) {
    setPage(1);
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function toggleCondition(cond) {
    setPage(1);
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      next.has(cond) ? next.delete(cond) : next.add(cond);
      return next;
    });
  }

  function resetFilters() {
    setSearch("");
    setSelectedCategories(new Set());
    setSelectedConditions(new Set());
    setPriceMin(0);
    setPriceMax(100000);
    setSortBy("newest");
    setPage(1);
  }

  // -----------------------------------------------------
  // Filter + sort (client-side)
  // -----------------------------------------------------
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      // Searches both product title name and product category
      list = list.filter((p) => 
        p.name?.toLowerCase().includes(q) || 
        p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.size > 0) {
      list = list.filter((p) => selectedCategories.has(p.category));
    }

    if (selectedConditions.size > 0) {
      list = list.filter((p) => selectedConditions.has(p.condition));
    }

    list = list.filter((p) => {
      const price = Number(p.price) || 0;
      return price >= priceMin && price <= priceMax;
    });

    switch (sortBy) {
      case "price_low_high":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_high_low":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
      default:
        list.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
    }

    return list;
  }, [products, search, selectedCategories, selectedConditions, priceMin, priceMax, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const pageProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb + heading */}
        <p className="text-sm text-gray-500 mb-2">Home &gt; Products</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse a wide range of second-hand products from our trusted sellers.
        </p>

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          {/* ============ SIDEBAR FILTERS ============ */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  ⟲ Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 block mb-2">Categories</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <FilterCheckbox
                    label="All Categories"
                    checked={selectedCategories.size === 0}
                    onChange={() => setSelectedCategories(new Set())}
                  />
                  {CATEGORIES.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    return (
                      <FilterCheckbox
                        key={cat}
                        label={`${cat} (${count})`}
                        checked={selectedCategories.has(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 block mb-2">Price Range</label>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={500}
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>৳ {priceMin.toLocaleString()}</span>
                  <span>৳ {priceMax.toLocaleString()}{priceMax >= 100000 ? "+" : ""}</span>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Condition</label>
                <div className="space-y-2">
                  <FilterCheckbox
                    label="All"
                    checked={selectedConditions.size === 0}
                    onChange={() => setSelectedConditions(new Set())}
                  />
                  {CONDITIONS.map((cond) => (
                    <FilterCheckbox
                      key={cond}
                      label={cond}
                      checked={selectedConditions.has(cond)}
                      onChange={() => toggleCondition(cond)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ============ MAIN CONTENT ============ */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-sm text-gray-500">
                Showing {filteredProducts.length === 0 ? 0 : (page - 1) * PRODUCTS_PER_PAGE + 1}–
                {Math.min(page * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                </select>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 ${view === "grid" ? "bg-green-50 text-green-600" : "text-gray-400"}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 ${view === "list" ? "bg-green-50 text-green-600" : "text-gray-400"}`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* States */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && errorMsg && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                {errorMsg}
              </div>
            )}

            {/* Display "Not Found" styled clean notice */}
            {!loading && !errorMsg && filteredProducts.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Searched item not found</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  We couldnt find any products matching your current search term or filters. Try adjusting your inputs.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {!loading && !errorMsg && pageProducts.length > 0 && (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "flex flex-col gap-3"
                }
              >
                {pageProducts.map((product) =>
                  view === "grid" ? (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wishlisted={wishlistIds.has(product._id)}
                      inCart={cartIds.has(product._id)}
                      onToggleWishlist={() => toggleWishlist(product)}
                      onToggleCart={() => toggleCart(product)}
                    />
                  ) : (
                    <ProductRow
                      key={product._id}
                      product={product}
                      wishlisted={wishlistIds.has(product._id)}
                      inCart={cartIds.has(product._id)}
                      onToggleWishlist={() => toggleWishlist(product)}
                      onToggleCart={() => toggleCart(product)}
                    />
                  )
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium ${
                        page === pageNum
                          ? "bg-green-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Subcomponents
// =====================================================
function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
      {label}
    </label>
  );
}

/**
 * Auto-advancing image slider for product cards.
 */
function ImageSlider({ images = [], alt }) {
  const safeImages = images.length > 0 ? images : ["/placeholder-product.png"];
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (safeImages.length <= 1) return;

    function tick() {
      if (!pausedRef.current) {
        setIndex((prev) => (prev + 1) % safeImages.length);
      }
      timeoutRef.current = setTimeout(tick, SLIDE_INTERVAL_MS);
    }

    timeoutRef.current = setTimeout(tick, SLIDE_INTERVAL_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [safeImages.length]);

  function goTo(i) {
    setIndex(i);
    pausedRef.current = true;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, SLIDE_INTERVAL_MS);
  }

  return (
    <div className="relative w-full h-full overflow-hidden group">
      <img
        src={safeImages[index]}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {safeImages.length > 1 && (
        <>
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(i);
                }}
                aria-label={`Show image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo((index - 1 + safeImages.length) % safeImages.length);
            }}
            aria-label="Previous image"
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo((index + 1) % safeImages.length);
            }}
            aria-label="Next image"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

function ProductCard({ product, wishlisted, inCart, onToggleWishlist, onToggleCart }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col group">
      <div className="relative aspect-square bg-gray-50">
        <Link href={`/products/${product._id}`}>
          <ImageSlider images={product.images} alt={product.name} />
        </Link>
        <button
          onClick={onToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
          />
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <span className="text-xs font-medium text-green-600">{product.category}</span>
        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1 hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span className="truncate"> {product.locationLabel || "Location not set"}</span>
          <span className="flex-shrink-0 ml-2">{timeAgo(product.createdAt)}</span>
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            href={`/products/${product._id}`}
            className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Details
          </Link>
          <button
            onClick={onToggleCart}
            aria-label={inCart ? "Added to Cart" : "Add to Cart"}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              inCart
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {inCart ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product, wishlisted, inCart, onToggleWishlist, onToggleCart }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-4">
      <Link href={`/products/${product._id}`} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <ImageSlider images={product.images} alt={product.name} />
      </Link>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-green-600">{product.category}</span>
        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm font-semibold text-gray-900 truncate hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 truncate">
           {product.locationLabel || "Location not set"} · {timeAgo(product.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/products/${product._id}`}
          aria-label="View product details"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 text-gray-500" />
        </Link>
        <button
          onClick={onToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
        <button
          onClick={onToggleCart}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
            inCart ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">{inCart ? "Added" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
}