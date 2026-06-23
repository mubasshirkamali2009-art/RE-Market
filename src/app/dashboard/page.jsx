import AdaptiveDashboardGrid from '@/components/dashboard/stateCard';
import ProtectedRoute from '@/components/ProtectRout';
import React, { Suspense } from 'react';

const page = () => {
    return ( 
        <ProtectedRoute>
        <div>
            <AdaptiveDashboardGrid></AdaptiveDashboardGrid> 
        </div></ProtectedRoute>
        

    );
};

export default page;