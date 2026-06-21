"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Xmark } from "@gravity-ui/icons";
import toast from "react-hot-toast";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const CATEGORY_OPTIONS = [
  "Phones",
  "Laptops",
  "Electronics",
  "Footwear",
  "Accessories",
  "Furniture",
  "Books",
];

const STATUS_OPTIONS = ["Active", "Inactive", "Out of Stock"];

/**
 * Edit Product modal.
 * Open by passing a `product` object as a prop. Pass `null` to close.
 * On successful save, calls `onSaved()` so the parent can refresh its list.
 *
 * IMPORTANT: render with key={product?._id || product?.id} from the parent
 * (see usage note in page.jsx) so the form resets per product without
 * syncing state from props inside an effect.
 */
export function EditProductModal({ product, onClose, onSaved }) {
  const [formData, setFormData] = useState(() =>
    product
      ? {
          title: product.name || product.title || "",
          category: product.category || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          status: product.status || "Active",
        }
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!formData.title.trim()) next.title = "Product title is required.";
    if (!formData.category) next.category = "Select a category.";
    if (!formData.price || Number(formData.price) <= 0)
      next.price = "Enter a valid price.";
    if (formData.stock === "" || Number(formData.stock) < 0)
      next.stock = "Enter a valid stock quantity.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const id = product._id || product.id;

      // Fetch call lives right here — no separate action file needed.
      const res = await fetch(`${baseUrl}/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock),
          status: formData.status,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Product updated.");
      onSaved?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to update product:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Something went wrong. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {product && formData && (
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
            className="w-full max-w-md rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1f4d3c]">Edit Product</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-7 items-center justify-center rounded-lg text-[#9aa896] transition-colors hover:bg-[#f1f2ee] hover:text-[#5b6b58]"
              >
                <Xmark className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <Field label="Product Title" error={errors.title}>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass(errors.title)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" error={errors.category}>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={selectClass(errors.category)}
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={selectClass(false)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price ($)" error={errors.price}>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={inputClass(errors.price)}
                  />
                </Field>

                <Field label="Stock Quantity" error={errors.stock}>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className={inputClass(errors.stock)}
                  />
                </Field>
              </div>

              {errors.form && (
                <p className="rounded-lg bg-[#fbeaea] px-3 py-2 text-[13px] text-[#a13a3a]">
                  {errors.form}
                </p>
              )}

              <div className="mt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-[10px] px-4 py-2.5 text-sm font-semibold text-[#5b6b58] transition-colors hover:bg-[#f1f2ee] disabled:opacity-60"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="rounded-[10px] bg-[#2c6b4f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f4d3c] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[#33402f]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-[#c0392b]">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-[#1f2d22] outline-none transition-colors focus:border-[#2c6b4f] ${
    hasError ? "border-[#e0a3a3]" : "border-[#d8e0cf]"
  }`;
}

function selectClass(hasError) {
  return `w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-[#1f2d22] outline-none transition-colors focus:border-[#2c6b4f] ${
    hasError ? "border-[#e0a3a3]" : "border-[#d8e0cf]"
  }`;
}