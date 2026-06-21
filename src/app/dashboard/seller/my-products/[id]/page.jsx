"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { 
  ChevronLeft, 
  Pencil, 
  TrashBin, 
  Heart, 
  Eye, 
  ShoppingBag, 
  CircleDollar, 
  TrendUp, 
  Box, 
  Star 
} from "@gravity-ui/icons";
import { useRouter } from "next/navigation"; // FIXED: Corrected import module name path
import { DeleteProductDialog } from "@/components/Delete";

export default function ProductDetailsPage({ params: paramsPromise }) {
  // Safe param unwrapping for modern Next.js setups
  const params = use(paramsPromise);
  const productId = params?.id;
  
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (!productId) return;

    async function loadData() {
      try {
        setLoading(true);

        // Fetch products list array
        const productRes = await fetch(`${baseUrl}/api/products`);
        if (!productRes.ok) throw new Error("Failed to fetch products data");
        const productData = await productRes.json();
        
        // Find matching item by ID key
        const productsArray = Array.isArray(productData) ? productData : productData.products || [];
        const targetedProduct = productsArray.find(
          (p) => (p._id || p.id) === productId
        );

        if (!targetedProduct) {
          throw new Error("Product matching this route sequence not found");
        }

        setProduct(targetedProduct);
        setIsFavorited(Boolean(targetedProduct?.isFavorited));

        // Background lookup for mock order streams safely
        try {
          const ordersRes = await fetch(`${baseUrl}/api/products/${productId}/orders?limit=3`);
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders || []);
          }
        } catch (e) {
          setOrders([]);
        }

      } catch (error) {
        console.error("Error matching dynamic product item:", error);
        toast.error("Could not find product details.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId, baseUrl]);

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

  // Basic verification helper for invalid/broken base64 or placeholder URLs
  const hasValidImage = product.image && product.image.trim() !== "" && !product.image.includes("asdff");

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push("/dashboard/seller/my-products")} 
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Products
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsFavorited(!isFavorited)} 
            className={`p-2 rounded-lg border transition-colors ${isFavorited ? "bg-red-50 text-red-500 border-red-200" : "text-gray-400 border-gray-200 hover:bg-gray-50"}`}
          >
            <Heart className="size-4" />
          </button>
          <button 
            type="button"
            onClick={() => setProductToDelete(product)} 
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors"
          >
            <TrashBin className="size-4" /> Delete
          </button>
        </div>
      </div>

      {/* Main Grid Splitting */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-[#e4e9dc] rounded-2xl p-6 flex flex-col sm:flex-row gap-5 shadow-sm">
            {hasValidImage ? (
              <img 
                src={product.image} 
                alt={product.name || product.title} 
                className="w-full sm:w-36 h-36 object-cover rounded-xl bg-gray-50 border border-gray-100"
              />
            ) : (
              <div className="w-full sm:w-36 h-36 flex items-center justify-center rounded-xl bg-[#eef3e2] text-[#2c6b4f] shrink-0">
                <Box className="size-8" />
              </div>
            )}
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#eef3e2] text-[#2c6b4f]">
                {product.category || "General Listing"}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{product.name || product.title}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">{product.description || "No description provided for this item."}</p>
            </div>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e4e9dc] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-xl bg-[#dcf2e3] text-[#1f8a4c]">
              <CircleDollar className="size-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Price</p>
              <p className="text-xl font-bold text-gray-900">${product.price}</p>
            </div>
          </div>

          <div className="bg-white border border-[#e4e9dc] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Available Stock</p>
              <p className="text-xl font-bold text-gray-900">{product.stock} units</p>
            </div>
          </div>
        </div>
      </div>

      <DeleteProductDialog
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onDeleted={() => router.push("/dashboard/seller/my-products")}
      />
    </div>
  );
}