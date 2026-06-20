"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyPicture, TrashBin } from "@gravity-ui/icons";
import { createProduct } from "@/lib/actions/addproducts";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Changed from redirect to useRouter

// TODO: replace with real category fetch from backend
const CATEGORY_OPTIONS = [
  "Phones",
  "Laptops",
  "Electronics",
  "Footwear",
  "Accessories",
  "Furniture",
  "Books",
];

// TODO: replace with real condition options if backend defines its own enum
const CONDITION_OPTIONS = ["New", "Like New", "Good", "Fair", "Used"];

const initialFormState = {
  title: "",
  description: "",
  category: "",
  condition: "",
  price: "",
  stock: "",
};

export function AddProductForm() {
  const router = useRouter(); // Initialize router hook
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  async function handleAddProduct(productData) {
    const result = await createProduct(productData);
    console.log("Created in MongoDB:", result);
    toast.success("Product added successfully!");
    router.push("/dashboard/seller"); // Redirecting to seller dashboard
  }
  
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please upload an image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be under 5MB." }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleFileInputChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate() {
    const next = {};
    if (!formData.title.trim()) next.title = "Product title is required.";
    if (!formData.description.trim()) next.description = "Description is required.";
    if (!formData.category) next.category = "Select a category.";
    if (!formData.condition) next.condition = "Select a condition.";
    if (!formData.price || Number(formData.price) <= 0)
      next.price = "Enter a valid price.";
    if (formData.stock === "" || Number(formData.stock) < 0)
      next.stock = "Enter a valid stock quantity.";
    if (!imageFile) next.image = "Product image is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        stock: Number(formData.stock),
        // TODO: once real image upload/storage (S3, Cloudinary, etc.) is wired up,
        // replace this with the uploaded image's real URL instead of the local preview.
        // image: imagePreview,
      };

      if (handleAddProduct) {
        await handleAddProduct(productData);
        
      } else {
        // Fallback fake submit if no onSubmit is passed
        await new Promise((res) => setTimeout(res, 900));
        console.log(productData);
      }

      setFormData(initialFormState);
      removeImage();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || "Something went wrong. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl border border-[#e4e9dc] bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-bold text-[#1f4d3c] sm:text-xl">Add Product</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Image upload */}
        <div>
          <label
            htmlFor="product-image"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors lg:h-full ${
              isDragging
                ? "border-[#2c6b4f] bg-[#eef3e2]"
                : "border-[#c9d6bd] bg-[#f6f9f1] hover:bg-[#eef3e2]"
            }`}
          >
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative h-full w-full"
                >
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeImage();
                    }}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  >
                    <TrashBin className="size-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#dce8c8] text-[#1f4d3c]">
                    <CopyPicture className="size-5" />
                  </span>
                  <p className="text-sm font-semibold text-[#2c6b4f]">
                    Upload Product Image
                  </p>
                  <p className="text-xs text-[#7a8a78]">
                    Click or drag an image here
                  </p>
                  <p className="text-xs text-[#9aa896]">PNG, JPG up to 5MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </label>
          <input
            ref={fileInputRef}
            id="product-image"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileInputChange}
            className="hidden"
          />
          {errors.image && (
            <p className="mt-1.5 text-xs text-[#c0392b]">{errors.image}</p>
          )}
        </div>

        {/* Fields */}
        <div className="grid gap-4">
          <Field label="Product Title" error={errors.title}>
            <input
              name="title"
              type="text"
              placeholder="Enter product title"
              value={formData.title}
              onChange={handleChange}
              className={inputClass(errors.title)}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              name="description"
              rows={3}
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              className={`${inputClass(errors.description)} resize-none`}
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
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Condition" error={errors.condition}>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={selectClass(errors.condition)}
              >
                <option value="">Select condition</option>
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
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
                placeholder="Enter price"
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
                placeholder="Enter stock quantity"
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

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="mt-1 w-full rounded-xl bg-[#2c6b4f] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f4d3c] disabled:cursor-not-allowed disabled:opacity-70 sm:hidden lg:block"
          >
            {isSubmitting ? "Adding product..." : "Add Product"}
          </motion.button>
        </div>

        {/* Full-width submit on mobile/tablet, sits below the grid */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="hidden w-full rounded-xl bg-[#2c6b4f] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f4d3c] disabled:cursor-not-allowed disabled:opacity-70 sm:block lg:hidden"
        >
          {isSubmitting ? "Adding product..." : "Add Product"}
        </motion.button>
      </form>
    </motion.div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[#33402f]">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#c0392b]">{error}</p>}
    </div>
  );
}

// Helpers for Tailwind Classnames
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