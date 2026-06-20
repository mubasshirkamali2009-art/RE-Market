"use client";
import { motion } from "framer-motion";
import { Pencil, Xmark } from "@gravity-ui/icons";

// TODO: replace with real fetch, e.g. const { data } = useQuery(['orders', 'seller'], fetchSellerOrders)
const FAKE_ORDERS = [
  { id: "ORD5678", product: "iPhone 12", buyer: "John Doe", status: "Pending", date: "May 18, 2025" },
  { id: "ORD5677", product: "MacBook Air", buyer: "Sarah Smith", status: "Accepted", date: "May 17, 2025" },
  { id: "ORD5676", product: "Sony Headphones", buyer: "Mike Johnson", status: "Processing", date: "May 16, 2025" },
  { id: "ORD5675", product: "Nike Air Max", buyer: "Emily Davis", status: "Shipped", date: "May 15, 2025" },
  { id: "ORD5674", product: "Fossil Watch", buyer: "David Brown", status: "Delivered", date: "May 14, 2025" },
];

const statusStyles = {
  Pending: "bg-[#fdf0d8] text-[#b8790a]",
  Accepted: "bg-[#dcf2e3] text-[#1f8a4c]",
  Processing: "bg-[#e3eefb] text-[#2d6fb8]",
  Shipped: "bg-[#e9e4fa] text-[#6b46c1]",
  Delivered: "bg-[#dcf2e3] text-[#1f8a4c]",
  Cancelled: "bg-[#fbeaea] text-[#c0392b]",
};

/**
 * Manage Orders table.
 *
 * @param {object} props
 * @param {Array<{id: string, product: string, buyer: string, status: string, date: string}>} props.orders
 * @param {(id: string) => void} props.onEdit
 * @param {(id: string) => void} props.onCancel
 * @param {string} props.viewAllHref
 */
export function OrdersTable({
  orders = FAKE_ORDERS,
  onEdit,
  onCancel,
  viewAllHref = "#",
}) {
  return (
    <div className="rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1f4d3c]">Manage Orders</h2>
        <a href={viewAllHref} className="text-sm font-semibold text-[#2c6b4f] hover:text-[#1f4d3c]">
          View All
        </a>
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e4e9dc] text-xs font-semibold uppercase tracking-wide text-[#9aa896]">
              <th className="py-2.5 pr-4">Order ID</th>
              <th className="py-2.5 pr-4">Product</th>
              <th className="py-2.5 pr-4">Buyer</th>
              <th className="py-2.5 pr-4">Status</th>
              <th className="py-2.5 pr-4">Date</th>
              <th className="py-2.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="border-b border-[#f0f3ec] last:border-0"
              >
                <td className="py-3 pr-4 font-medium text-[#2c6b4f]">#{order.id}</td>
                <td className="py-3 pr-4 text-[#1f2d22]">{order.product}</td>
                <td className="py-3 pr-4 text-[#5b6b58]">{order.buyer}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status] || statusStyles.Pending}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-[#5b6b58]">{order.date}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <RowAction icon={Pencil} label="Update status" onClick={() => onEdit?.(order.id)} />
                    <RowAction icon={Xmark} label="Cancel order" tone="danger" onClick={() => onCancel?.(order.id)} />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 grid gap-3 sm:hidden">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-xl border border-[#e4e9dc] p-3.5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2c6b4f]">#{order.id}</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status] || statusStyles.Pending}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-[#1f2d22]">{order.product}</p>
            <p className="text-xs text-[#7a8a78]">
              {order.buyer} · {order.date}
            </p>
            <div className="mt-3 flex items-center justify-end gap-1.5">
              <RowAction icon={Pencil} label="Update status" onClick={() => onEdit?.(order.id)} />
              <RowAction icon={Xmark} label="Cancel order" tone="danger" onClick={() => onCancel?.(order.id)} />
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