"use client";
import { useState, useEffect } from "react"; 
import { motion } from "framer-motion";
import { Pencil, Eye, TrashBin } from "@gravity-ui/icons";
import { getProducts } from "@/lib/api/products"; 

const statusStyles = {
  Active: "bg-[#dcf2e3] text-[#1f8a4c]",
  Inactive: "bg-[#f1f2ee] text-[#6b7a6d]",
  "Out of Stock": "bg-[#fbeaea] text-[#c0392b]",
};

// Fallback image asset when no real product image exists
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=80&auto=format&fit=crop&q=60";

/**
 * My Products table.
 */
export function ProductsTable({
  onEdit,
  onView,
  onDelete,
  viewAllHref = "#",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts("", ""); 
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1f4d3c]">My Products</h2>
        <a href={viewAllHref} className="text-sm font-semibold text-[#2c6b4f] hover:text-[#1f4d3c]">
          View All
        </a>
      </div>

      {/* Loading State Feedback */}
      {loading && (
        <p className="mt-4 text-center text-sm text-[#7a8a78]">Loading items...</p>
      )}

      {/* Empty State Feedback */}
      {!loading && products.length === 0 && (
        <p className="mt-4 text-center text-sm text-[#7a8a78]">No products found.</p>
      )}

      {/* Desktop table */}
      {!loading && products.length > 0 && (
        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e4e9dc] text-xs font-semibold uppercase tracking-wide text-[#9aa896]">
                <th className="py-2.5 pr-4">Product</th>
                <th className="py-2.5 pr-4">Category</th>
                <th className="py-2.5 pr-4">Price</th>
                <th className="py-2.5 pr-4">Stock</th>
                <th className="py-2.5 pr-4">Status</th>
                <th className="py-2.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <motion.tr
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="border-b border-[#f0f3ec] last:border-0"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Design Change: Always uses an image tag structure now */}
                      <img 
                        src={product.image || PLACEHOLDER_IMAGE} 
                        alt={product.name || product.title} 
                        className="size-8 rounded-lg object-cover bg-[#eef3e2]" 
                      />
                      <span className="font-medium text-[#1f2d22]">{product.name || product.title}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-[#5b6b58]">{product.category}</td>
                  <td className="py-3 pr-4 font-medium text-[#1f2d22]">${product.price}</td>
                  <td className="py-3 pr-4 text-[#5b6b58]">{product.stock}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[product.status] || statusStyles.Active}`}>
                      {product.status || "Active"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <RowAction icon={Pencil} label="Edit" onClick={() => onEdit?.(product._id || product.id)} />
                      <RowAction icon={Eye} label="View" onClick={() => onView?.(product._id || product.id)} />
                      <RowAction icon={TrashBin} label="Delete" tone="danger" onClick={() => onDelete?.(product._id || product.id)} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && products.length > 0 && (
        <div className="mt-4 grid gap-3 sm:hidden">
          {products.map((product, i) => (
            <motion.div
              key={product._id || product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-xl border border-[#e4e9dc] p-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Design Change: Use image tag structure for mobile views */}
                  <img 
                    src={product.image || PLACEHOLDER_IMAGE} 
                    alt={product.name || product.title} 
                    className="size-8 rounded-lg object-cover bg-[#eef3e2]" 
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1f2d22]">{product.name || product.title}</p>
                    <p className="text-xs text-[#7a8a78]">{product.category}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[product.status] || statusStyles.Active}`}>
                  {product.status || "Active"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <p className="text-[#5b6b58]">
                  <span className="font-medium text-[#1f2d22]">${product.price}</span> · {product.stock} in stock
                </p>
                <div className="flex items-center gap-1.5">
                  <RowAction icon={Pencil} label="Edit" onClick={() => onEdit?.(product._id || product.id)} />
                  <RowAction icon={Eye} label="View" onClick={() => onView?.(product._id || product.id)} />
                  <RowAction icon={TrashBin} label="Delete" tone="danger" onClick={() => onDelete?.(product._id || product.id)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function RowAction({ icon: Icon, label, onClick, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "text-[#9aa896] hover:bg-[#fbeaea] hover:text-[#c0392b]"
      : "text-[#9aa896] hover:bg-[#eef3e2] hover:text-[#2c6b4f]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex size-7 items-center justify-center rounded-lg transition-colors ${toneClass}`}
    >
      <Icon className="size-3.5" />
    </button>
  );
}