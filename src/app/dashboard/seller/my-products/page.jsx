"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductsTable } from "@/components/MyProducts";
import { ProductSearch } from "@/components/search";
import { EditProductModal } from "@/components/Edit";
import { DeleteProductDialog } from "@/components/Delete";
import ProtectedRoute from "@/components/ProtectRout";

export default function MyProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Bumping this forces ProductsTable to refetch after an edit/delete,
  // since the table still fetches its own data internally.
  const [refreshKey, setRefreshKey] = useState(0);

  // Navigates directly to the dynamic details view path
  const handleViewDetails = (id) => {
    router.push(`/dashboard/seller/my-products/${id}`);
  };

  return (
    <ProtectedRoute>
      <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-[#1f4d3c]">My Products</h1>
        <ProductSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name or category..."
          className="sm:w-72"
        />
      </div>

      <ProductsTable
        key={refreshKey}
        onEdit={(id) => setProductToEdit({ _id: id })}
        onDelete={(id) => setProductToDelete({ _id: id })}
        onViewDetails={handleViewDetails} 
      />

      <EditProductModal
        key={productToEdit?._id || productToEdit?.id || "closed"}
        product={productToEdit}
        onClose={() => setProductToEdit(null)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      <DeleteProductDialog
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onDeleted={() => setRefreshKey((k) => k + 1)}
      />
    </div>
    </ProtectedRoute>
  );
}