"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyPicture, TrashBin } from "@gravity-ui/icons";
import { createProduct } from "@/lib/actions/addproducts";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

// Category options
const CATEGORY_OPTIONS = [
  "Phones",
  "Laptops",
  "Electronics",
  "Footwear",
  "Accessories",
  "Furniture",
  "Books",
];

// Condition options
const CONDITION_OPTIONS = ["New", "Like New", "Good", "Fair", "Used"];

const initialFormState = {
  title: "",
  description: "",
  category: "",
  condition: "",
  price: "",
  stock: "",
};

const MAX_IMAGES = 5;

export function AddProductForm() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const user = session?.user;

  const [formData, setFormData] = useState(initialFormState);
  const [imageFiles, setImageFiles] = useState([]); // multiple images now
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  async function handleAddProduct(productData) {
    const result = await createProduct(productData);
    console.log("Created in MongoDB:", result);
    toast.success("Product added successfully!");
    router.push("/dashboard/seller");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleFiles(files) {
    if (!files || files.length === 0) return;

    const incoming = Array.from(files);
    const room = MAX_IMAGES - imageFiles.length;

    if (room <= 0) {
      setErrors((prev) => ({
        ...prev,
        image: `You can upload up to ${MAX_IMAGES} images.`,
      }));
      return;
    }

    const accepted = [];
    let errorMsg = "";

    for (const file of incoming.slice(0, room)) {
      if (!file.type.startsWith("image/")) {
        errorMsg = "Please upload image files only.";
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errorMsg = "Each image must be under 5MB.";
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) {
      setImageFiles((prev) => [...prev, ...accepted]);
      setImagePreviews((prev) => [
        ...prev,
        ...accepted.map((f) => URL.createObjectURL(f)),
      ]);
    }

    setErrors((prev) => ({ ...prev, image: errorMsg || undefined }));
  }

  function handleFileInputChange(e) {
    handleFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file later
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function removeImageAt(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
    if (imageFiles.length === 0) next.image = "At least one product image is required.";
    if (!user) next.form = "You must be logged in to add a product.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function uploadImageToImgBB(file, apiKey) {
    const imgFormData = new FormData();
    imgFormData.append("image", file);
    const imgBBUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

    const uploadResponse = await fetch(imgBBUrl, {
      method: "POST",
      body: imgFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload one or more images to ImgBB.");
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult.data.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMSGE_UPLODE_API_URL;
      if (!apiKey) {
        throw new Error("ImgBB API key is missing from environmental variables.");
      }

      // 1. Upload all images to ImgBB in parallel
      const uploadedImageUrls = await Promise.all(
        imageFiles.map((file) => uploadImageToImgBB(file, apiKey))
      );

      // 2. Build sellerInfo straight from the user object — same plain
      //    style your Navbar already uses (user?.name, user?.email, user?.image).
      const sellerInfo = {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      };

      // 3. Map final clean database attributes to match the target schema
      const productData = {
        name: formData.title,
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: uploadedImageUrls,
        description: formData.description,
        sellerInfo,
        status: "available",
      };

      if (handleAddProduct) {
        await handleAddProduct(productData);
        console.log(productData);
      } else {
        await new Promise((res) => setTimeout(res, 900));
        console.log(productData);
      }

      setFormData(initialFormState);
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
              {imagePreviews.length > 0 ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="grid h-full w-full grid-cols-3 gap-2 overflow-y-auto p-1"
                >
                  {imagePreviews.map((src, i) => (
                    <div key={src} className="relative aspect-square">
                      <img
                        src={src}
                        alt={`Product preview ${i + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeImageAt(i);
                        }}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                      >
                        <TrashBin className="size-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < MAX_IMAGES && (
                    <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[#c9d6bd] text-xs text-[#7a8a78]">
                      + Add more
                    </div>
                  )}
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
                    Upload Product Images
                  </p>
                  <p className="text-xs text-[#7a8a78]">
                    Click or drag images here
                  </p>
                  <p className="text-xs text-[#9aa896]">
                    PNG, JPG up to 5MB each, max {MAX_IMAGES}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </label>
          <input
            ref={fileInputRef}
            id="product-image"
            type="file"
            accept="image/png, image/jpeg"
            multiple
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
            disabled={isSubmitting || isSessionLoading}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="mt-1 w-full rounded-xl bg-[#2c6b4f] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f4d3c] disabled:cursor-not-allowed disabled:opacity-70 sm:hidden lg:block"
          >
            {isSubmitting ? "Adding product..." : "Add Product"}
          </motion.button>
        </div>

        {/* Full-width submit on mobile/tablet */}
        <motion.button
          type="submit"
          disabled={isSubmitting || isSessionLoading}
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