"use client";
import React from 'react';
import { AddProductForm } from '@/components/dashboard/sellerAddProducts';
import ProtectedRoute from '@/components/ProtectRout';

const AddProductsPage = () => {
 

  return ( <ProtectedRoute>
    <div>
      <AddProductForm  />
    </div> </ProtectedRoute>
  );
};

export default AddProductsPage;