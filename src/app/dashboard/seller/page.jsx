"use client"
import { useSession } from '@/lib/auth-client';
import React from 'react';
import { motion } from "framer-motion";
import { StatsGrid } from '@/components/dashboard/stateCard';
import { Box, CircleDollar, ChartColumn, Clock } from "@gravity-ui/icons";
import { AddProductForm } from '@/components/dashboard/sellerAddProducts';


const sellerStats = [
  { icon: Box, label: "Total Products", value: 42, actionLabel: "View all", href: "/dashboard/seller/products" },
  { icon: ChartColumn, label: "Total Sales", value: 156, actionLabel: "View sales", href: "/dashboard/seller/sales" },
  { icon: CircleDollar, label: "Total Revenue", value: "$4,450", actionLabel: "View earnings", href: "/dashboard/seller/earnings", tone: "success" },
  { icon: Clock, label: "Pending Orders", value: 18, actionLabel: "View orders", href: "/dashboard/seller/orders", tone: "warning" },
];





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






const SellerDashboardPage = () => {
    const {data: session , isPending} = useSession();

if(isPending){
    return  (
    <div className="flex h-screen items-center justify-center">
      <Spinner size={32} className="text-green-700" />
    </div>
  );
}
const user = session?.user;
console.log("Session data in sellerdata :" , session , "is pending" , isPending)





    return (
        <div>
            <h1 className='text-4xl font-bold px-8 py-5'>Welcome back {user.name}</h1>


<StatsGrid stats={sellerStats}></StatsGrid>
<AddProductForm></AddProductForm>

        </div>
    );
};

export default SellerDashboardPage;