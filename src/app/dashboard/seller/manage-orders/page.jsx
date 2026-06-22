import SellerOrdersPage from "@/components/ManageOrders";
import ProtectedRoute from "@/components/ProtectRout";
import React from 'react';

const MyProductsPage= () => {
    return ( <ProtectedRoute>
        <div>
           
            <SellerOrdersPage></SellerOrdersPage>
        </div></ProtectedRoute>
    );
};

export default MyProductsPage;