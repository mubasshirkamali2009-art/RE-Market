"use client";

import { useState, useEffect, use } from "react";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Box,
  Pencil,
  TrashBin,
  Envelope,
  Person,
} from "@gravity-ui/icons";
import { useRouter } from "next/navigation";

// Importing your standalone component overlays
import { DeleteProductDialog } from "@/components/Delete";
import { EditProductModal } from "@/components/Edit";

export default function ProductDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const productId = params?.id;

  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imgFallback, setImgFallback] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Modal states
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  async function loadData() {
    if (!productId) return;
    try {
      setLoading(true);
      const productRes = await fetch(`${baseUrl}/api/products`);
      if (!productRes.ok) throw new Error("Failed to fetch products");
      const productData = await productRes.json();

      const productsArray = Array.isArray(productData) ? productData : productData.products || [];
      const targetedProduct = productsArray.find(
        (p) => (p._id || p.id) === productId
      );

      if (!targetedProduct) {
        throw new Error("Product not found");
      }

      setProduct(targetedProduct);
      setIsFavorited(Boolean(targetedProduct?.isFavorited));
      setImgFallback(false);
      setActiveImage(0);
    } catch (error) {
      console.error("Fetch profile details error:", error);
      toast.error("Could not fetch product profiles.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    
  }, [productId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-[#e4e1d6] border-t-[#1f7a4d]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8a8578] font-medium">Product details unavailable.</p>
        <button
          onClick={() => router.push("/dashboard/seller/my-products")}
          className="mt-4 text-sm font-semibold text-[#1f7a4d] underline"
        >
          Return to My Products
        </button>
      </div>
    );
  }

  // Support both legacy single `image` and schema-correct `images[]`
  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const currentImage = galleryImages[activeImage];
  const isImageValid = currentImage && currentImage.trim() !== "" && !imgFallback;

  const seller = product.sellerInfo || {};
  // Temporary debug line — open your browser console and check this product's
  // actual sellerInfo shape. Remove this once you've confirmed the data.
  console.log("sellerInfo for this product:", product.sellerInfo);
  const statusLabel = product.status === "available" ? "Active" : (product.status || "Active");

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-sans">
      {/* Breadcrumb + back button row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/dashboard/seller/my-products")}
            className="font-semibold text-[#1f7a4d] hover:underline"
          >
            My Products
          </button>
          <ChevronRight className="size-3.5 text-[#a8a394]" />
          <span className="font-semibold text-[#1f2d22]">Product Details</span>
        </div>
        <button
          onClick={() => router.push("/dashboard/seller/my-products")}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#33402f] bg-white border border-[#e4e1d6] rounded-lg px-3.5 py-2 hover:bg-[#f6f5ef] transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to My Products
        </button>
      </div>

      {/* Main 3-column card */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr_0.85fr] bg-white rounded-2xl border border-[#e4e1d6] p-5 md:p-6">

        {/* Column 1: gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full rounded-xl bg-[#f6f5ef] border border-[#e4e1d6] flex items-center justify-center overflow-hidden">
            {isImageValid ? (
              <img
                src={currentImage}
                alt={product.name || product.title}
                onError={() => setImgFallback(true)}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              <div className="text-[#cfcbbd] flex flex-col items-center gap-2">
                <Box className="size-16 stroke-[1.25]" />
                <span className="text-xs font-medium text-[#a8a394]">No image available</span>
              </div>
            )}

            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eaf6ef] text-[#1f7a4d] border border-[#bfe3cd]">
              {statusLabel}
            </span>

            <button
              type="button"
              onClick={() => setIsFavorited(!isFavorited)}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className={`absolute top-3 right-3 flex items-center justify-center size-9 rounded-full bg-white border border-[#e4e1d6] shadow-sm transition-colors ${
                isFavorited ? "text-[#c7401f]" : "text-[#8a8578] hover:text-[#33402f]"
              }`}
            >
              <Heart className="size-4" />
            </button>
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2">
              {galleryImages.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => {
                    setActiveImage(i);
                    setImgFallback(false);
                  }}
                  className={`relative size-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    i === activeImage ? "border-[#1f7a4d]" : "border-[#e4e1d6] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: specs */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-[#1f2d22] tracking-tight">
              {product.name || product.title}
            </h1>
            <p className="text-xl font-bold text-[#1f7a4d] mt-1">
              ${product.price != null ? Number(product.price).toLocaleString() : "0"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pb-5 border-b border-[#e4e1d6]">
            <div>
              <p className="text-xs text-[#a8a394] font-medium">Category</p>
              <p className="text-sm font-bold text-[#1f2d22] mt-0.5">{product.category || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#a8a394] font-medium">Condition</p>
              <p className="text-sm font-bold text-[#1f2d22] mt-0.5">{product.condition || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#a8a394] font-medium">Stock</p>
              <p className="text-sm font-bold text-[#1f2d22] mt-0.5">{product.stock ?? "0"}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-[#1f2d22]">Description</h2>
            <p className="text-sm text-[#5b5949] leading-relaxed">
              {product.description || "No description provided for this listing."}
            </p>
          </div>
        </div>

        {/* Column 3: summary + seller + actions */}
        <div className="space-y-5">
          {/* Product Summary */}
          <div className="rounded-xl border border-[#e4e1d6] p-4">
            <h2 className="text-sm font-bold text-[#1f2d22] mb-3">Product Summary</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#8a8578]">Price</dt>
                <dd className="font-semibold text-[#1f2d22]">
                  ${product.price != null ? Number(product.price).toLocaleString() : "0"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#8a8578]">Stock Quantity</dt>
                <dd className="font-semibold text-[#1f2d22]">{product.stock ?? "0"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#8a8578]">Status</dt>
                <dd>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#eaf6ef] text-[#1f7a4d] border border-[#bfe3cd] capitalize">
                    {statusLabel}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Seller Information — always shown, even if data is missing,
              so it's obvious when sellerInfo wasn't saved on this product */}
          <div className="rounded-xl border border-[#e4e1d6] p-4">
            <h2 className="text-sm font-bold text-[#1f2d22] mb-3">Seller Information</h2>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1f7a4d] to-[#16573a] text-white shrink-0 overflow-hidden">
                {seller.image ? (
                  <img src={seller.image} alt={seller.name || "Seller"} className="w-full h-full object-cover" />
                ) : (
                  <Person className="size-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1f2d22] truncate">
                  {seller.name || "No seller name on file"}
                </p>
                <p className="flex items-center gap-1 text-xs text-[#8a8578] truncate">
                  <Envelope className="size-3" /> {seller.email || "No seller email on file"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#1f2d22] mb-1">Quick Actions</h2>
            <button
              type="button"
              onClick={() => setProductToEdit(product)}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1f7a4d] hover:bg-[#16573a] rounded-lg transition-colors"
            >
              <Pencil className="size-4" /> Edit Product
            </button>
            <button
              type="button"
              onClick={() => setProductToDelete(product)}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#c7401f] bg-white border border-[#f0c4b3] hover:bg-[#fdf2ee] rounded-lg transition-colors"
            >
              <TrashBin className="size-4" /> Delete Product
            </button>
          </div>
        </div>
      </div>

      {/* Linked Modals */}
      <EditProductModal
        key={productToEdit?._id || productToEdit?.id || "closed"}
        product={productToEdit}
        onClose={() => setProductToEdit(null)}
        onSaved={() => {
          setProductToEdit(null);
          loadData();
        }}
      />

      <DeleteProductDialog
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onDeleted={() => {
          setProductToDelete(null);
          router.push("/dashboard/seller/my-products");
        }}
      />
    </div>
  );
}