"use client";

import { useState, useEffect, use } from "react";
import toast from "react-hot-toast";
import { 
  ChevronLeft, 
  Heart, 
  Box,
  Pencil,
  TrashBin,
  ShoppingBag,
  CircleDollar,
  TrendUp,
  Star
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
  
  // Modal states
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  async function loadData() {
    if (!productId) return;
    try {
      setLoading(true); 
      // Fixed the endpoint to fetch the correct collection route safely
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
        <div className="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#2c6b4f]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">Product details unavailable.</p>
        <button 
          onClick={() => router.push("/dashboard/seller/my-products")} 
          className="mt-4 text-sm font-semibold text-[#2c6b4f] underline"
        >
          Return to My Products
        </button>
      </div>
    );
  }

  const isImageValid = product.image && 
                       product.image.trim() !== "" && 
                       !product.image.includes("asdff") && 
                       !imgFallback;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl space-y-6">
      
      {/* Top Navbar Action Track */}
      <div className="flex items-center justify-between pb-2">
        <button 
          onClick={() => router.push("/dashboard/seller/my-products")} 
          className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Products
        </button>
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-200">
          {product.status || "Active"}
        </span>
      </div>

      {/* Main UI Presentation Splitting Container */}
      <div className="grid gap-8 md:grid-cols-2">
        
        {/* Left Side: Dynamic Showcase Workspace Box */}
        <div className="relative aspect-square w-full rounded-2xl bg-gray-50/60 border border-gray-100 flex items-center justify-center overflow-hidden group">
          {isImageValid ? (
            <img 
              src={product.image} 
              alt={product.name || product.title} 
              onError={() => setImgFallback(true)}
              className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-300 group-hover:scale-102"
            />
          ) : (
            <div className="text-gray-300 flex flex-col items-center gap-2">
              <Box className="size-16 stroke-[1.25]" />
              <span className="text-xs font-medium text-gray-400">Placeholder Asset Preview</span>
            </div>
          )}

          <button 
            type="button"
            onClick={() => setIsFavorited(!isFavorited)}
            className={`absolute top-4 right-4 p-2.5 rounded-full shadow-sm bg-white border border-gray-100 transition-transform active:scale-95 ${
              isFavorited ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Heart className="size-4" />
          </button>
        </div>

        {/* Right Side: Structured Specifications View */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight md:text-3xl">
                {product.name || product.title}
              </h1>
              <p className="text-xl font-bold text-green-700 mt-1">
                ${product.price || "0.00"}
              </p>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-4 gap-4 border-y border-gray-100 py-4 text-left">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide">Category</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{product.category || "General"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide">Condition</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{product.condition || "Like New"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide">Stock</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{product.stock || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide">SKU</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{product.sku || "PHN-0012"}</p>
              </div>
            </div>

            {/* Description Block */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-bold text-gray-900 tracking-wide">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || "No description configured for this product list container."}
              </p>
            </div>

            {/* Product Information Fields */}
         
          </div>

          {/* Action Footer Operation Panel */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setProductToEdit(product)}
              className="flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all shadow-sm active:scale-[0.99]"
            >
              <Pencil className="size-4" /> Edit Product
            </button>
            <button
              type="button"
              onClick={() => setProductToDelete(product)}
              className="flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm active:scale-[0.99]"
            >
              <TrashBin className="size-4" /> Delete Listing
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