"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Package, Store, Calendar, Trash2, AlertCircle, Layers, Tag, Info } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function AdminManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Stable global products fetch handler
  const fetchAllProducts = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/admin/products`);
      if (!response.ok) throw new Error("Failed to load platform products from server.");
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Unable to aggregate platform product catalog. Verify database availability.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Handle Administrative product permanent deletion
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("WARNING: Are you absolutely certain you want to permanently delete this product listing from the platform? This action cannot be undone.")) return;
    
    try {
      setActionLoadingId(productId);
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Failed to drop product entry.");

      alert("Product listing successfully removed from the platform registry.");
      setLoading(true);
      fetchAllProducts(); // Re-sync dataset layout view
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while deleting the product entry.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 bg-gray-100 rounded-2xl border" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center max-w-xl mx-auto mt-12 bg-red-50 rounded-2xl border border-red-100 p-8 text-red-600">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p className="font-semibold">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            fetchAllProducts();
          }} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Retry Database Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Upper Meta Info Bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" /> Administrative Inventory Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review all active listings, monitor marketplace item assignments, and execute global item removals.
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl h-fit">
          <p className="text-xs font-semibold text-indigo-700">
            Total Listed Index: <span className="text-sm font-extrabold">{products.length} Items</span>
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No product records exist on the database network registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
              
              {/* Product Layout Content Body */}
              <div className="p-5 flex gap-4 flex-1">
                {/* Media Presentation Thumbnail */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 relative">
                  {product.images?.[0] || product.image ? (
                    <img 
                      src={product.images?.[0] || product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs text-center p-2 bg-gray-100">
                      <Package className="w-6 h-6 mb-1 text-gray-300" /> No Image
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 text-[10px] font-mono px-1.5 py-0.5 bg-gray-900/80 text-white rounded backdrop-blur-sm">
                    Qty: {product.stock ?? 0}
                  </span>
                </div>

                {/* Primary Specifications Panel */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <span className="text-[10px] font-mono bg-slate-100 border text-slate-600 px-2 py-0.5 rounded">
                    ID: {product._id}
                  </span>
                  <h2 className="font-bold text-gray-900 text-base line-clamp-1 mt-1" title={product.name}>
                    {product.name}
                  </h2>
                  
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" /> {product.category || "Unassigned"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-500" /> Status: {product.status || "active"}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 pt-0.5" title={product.description}>
                      {product.description}
                    </p>
                  )}

                  <p className="text-lg font-black text-indigo-600 pt-1">
                    ৳{(product.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Lower Section: Connected Seller Context Profile */}
              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-slate-400" /> Merchant Source Profile
                  </h4>
                  <div className="text-xs">
                    <p className="font-semibold text-gray-800 truncate">{product.sellerInfo?.name || "Unverified Seller"}</p>
                    <p className="text-gray-500 truncate text-[11px] font-mono mt-0.5">{product.sellerInfo?.email || "No contact routing data"}</p>
                  </div>
                </div>

                {/* Timestamp & Operational Controls */}
                <div className="flex flex-col sm:items-end justify-between h-full gap-2">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "Date Missing"}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    disabled={actionLoadingId === product._id}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-600 hover:text-white disabled:bg-red-200 disabled:text-red-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {actionLoadingId === product._id ? "Purging..." : "Delete Listing"}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}