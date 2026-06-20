"use client";
import { motion } from "framer-motion";
import { Pencil, Eye, TrashBin } from "@gravity-ui/icons";

// TODO: replace with real fetch, e.g. const { data } = useQuery(['products'], fetchSellerProducts)
const FAKE_PRODUCTS = [
  { id: "p1", name: "iPhone 12", category: "Phones", price: 520, stock: 10, status: "Active" },
  { id: "p2", name: "MacBook Air", category: "Laptops", price: 950, stock: 5, status: "Active" },
  { id: "p3", name: "Sony Headphones", category: "Electronics", price: 120, stock: 15, status: "Active" },
  { id: "p4", name: "Nike Air Max", category: "Footwear", price: 110, stock: 20, status: "Active" },
  { id: "p5", name: "Fossil Watch", category: "Accessories", price: 85, stock: 8, status: "Active" },
];

const statusStyles = {
  Active: "bg-[#dcf2e3] text-[#1f8a4c]",
  Inactive: "bg-[#f1f2ee] text-[#6b7a6d]",
  "Out of Stock": "bg-[#fbeaea] text-[#c0392b]",
};

/**
 * My Products table.
 *
 * @param {object} props
 * @param {Array<{id: string, name: string, category: string, price: number, stock: number, status: string, image?: string}>} props.products
 * @param {(id: string) => void} props.onEdit
 * @param {(id: string) => void} props.onView
 * @param {(id: string) => void} props.onDelete
 * @param {string} props.viewAllHref
 */
export function ProductsTable({
  products = FAKE_PRODUCTS,
  onEdit,
  onView,
  onDelete,
  viewAllHref = "#",
}) {
  return (
    <div className="rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1f4d3c]">My Products</h2>
        <a href={viewAllHref} className="text-sm font-semibold text-[#2c6b4f] hover:text-[#1f4d3c]">
          View All
        </a>
      </div>

      {/* Desktop table */}
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
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="border-b border-[#f0f3ec] last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="size-8 rounded-lg object-cover" />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-lg bg-[#eef3e2] text-xs font-semibold text-[#2c6b4f]">
                        {product.name.charAt(0)}
                      </span>
                    )}
                    <span className="font-medium text-[#1f2d22]">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[#5b6b58]">{product.category}</td>
                <td className="py-3 pr-4 font-medium text-[#1f2d22]">${product.price}</td>
                <td className="py-3 pr-4 text-[#5b6b58]">{product.stock}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[product.status] || statusStyles.Inactive}`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <RowAction icon={Pencil} label="Edit" onClick={() => onEdit?.(product.id)} />
                    <RowAction icon={Eye} label="View" onClick={() => onView?.(product.id)} />
                    <RowAction icon={TrashBin} label="Delete" tone="danger" onClick={() => onDelete?.(product.id)} />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 grid gap-3 sm:hidden">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-xl border border-[#e4e9dc] p-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#eef3e2] text-xs font-semibold text-[#2c6b4f]">
                  {product.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2d22]">{product.name}</p>
                  <p className="text-xs text-[#7a8a78]">{product.category}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[product.status] || statusStyles.Inactive}`}>
                {product.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <p className="text-[#5b6b58]">
                <span className="font-medium text-[#1f2d22]">${product.price}</span> · {product.stock} in stock
              </p>
              <div className="flex items-center gap-1.5">
                <RowAction icon={Pencil} label="Edit" onClick={() => onEdit?.(product.id)} />
                <RowAction icon={Eye} label="View" onClick={() => onView?.(product.id)} />
                <RowAction icon={TrashBin} label="Delete" tone="danger" onClick={() => onDelete?.(product.id)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
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