"use client"
import { useSession } from '@/lib/auth-client';
import React from 'react';
import { motion } from "framer-motion";
import ProtectedRoute from '@/components/ProtectRout';
import AdaptiveDashboardGrid from '@/components/dashboard/stateCard';

export function Spinner({ size = 24, className = "" }) {
  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "3px solid transparent",
        borderTopColor: "currentColor",
        borderRightColor: "currentColor",
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

const BuyerDashboardPage = () => {

const {data: session , isPending} = useSession();

if(isPending){
    return  (
    <div className="flex h-screen items-center justify-center">
      <Spinner size={32} className="text-green-700" />
    </div>
  );
}
const user = session?.user;
console.log("Session data in buyerdata :" , session , "is pending" , isPending)


    return ( <ProtectedRoute>
        <div>
             <AdaptiveDashboardGrid></AdaptiveDashboardGrid>
        </div> </ProtectedRoute>
    );
};

export default BuyerDashboardPage;