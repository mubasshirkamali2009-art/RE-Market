"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrashBin } from "@gravity-ui/icons";
import toast from "react-hot-toast";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Delete confirmation dialog.
 * Open by passing a `product` object as a prop. Pass `null` to close.
 * On successful delete, calls `onDeleted()` so the parent can refresh its list.
 */
export function DeleteProductDialog({ product, onClose, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!product) return;
    setIsDeleting(true);
    try {
      const id = product._id || product.id;

      // Fetch call lives right here — no separate action file needed.
      const res = await fetch(`${baseUrl}/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Product deleted.");
      onDeleted?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Couldn't delete the product. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-[#fbeaea] text-[#c0392b]">
              <TrashBin className="size-5" />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#1f2d22]">
              Delete &ldquo;{product.name || product.title}&rdquo;?
            </h3>
            <p className="mt-1.5 text-sm text-[#5b6b58]">
              This can&apos;t be undone. The product will be permanently removed from your catalog.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="rounded-[10px] px-4 py-2.5 text-sm font-semibold text-[#5b6b58] transition-colors hover:bg-[#f1f2ee] disabled:opacity-60"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                whileHover={{ scale: isDeleting ? 1 : 1.01 }}
                whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                className="rounded-[10px] bg-[#c0392b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a13a3a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}