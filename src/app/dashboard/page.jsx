// import AdaptiveDashboardGrid from '@/components/dashboard/stateCard';
// import ProtectedRoute from '@/components/ProtectRout';
import React, { Suspense } from 'react';

const page = () => {
    return ( <Suspense 
    fallback={<p>loading...</p>}>
        {/* <ProtectedRoute>
        <div>
            <AdaptiveDashboardGrid></AdaptiveDashboardGrid> 
        </div></ProtectedRoute> */}
        <h1>hi thewre</h1>
    </Suspense>
    );
};

export default page;