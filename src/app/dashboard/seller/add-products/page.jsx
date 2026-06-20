"use client";
import React from 'react';
import toast from 'react-hot-toast';
import { AddProductForm } from '@/components/dashboard/sellerAddProducts';
import { createProduct } from '@/lib/actions/products'; // ← adjust to wherever your server action file actually lives

const AddProductsPage = () => {
 

  return (
    <div>
      <AddProductForm  />
    </div>
  );
};

export default AddProductsPage;