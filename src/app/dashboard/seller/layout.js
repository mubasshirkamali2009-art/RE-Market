"use client";
import React, { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client"; 

const SellerLayout = ({children}) => {
    const router = useRouter();
  
    const { data: hookSession, isPending } = useSession();
    const clientSession = authClient?.useSession?.()?.data || null;

    const activeUser = hookSession?.user || clientSession?.user;
    const userRole = activeUser?.role;

    useEffect(() => {
        if (isPending) return;

        // Protection rule: If no user is logged in, or their role is NOT 'seller', kick them home
        if (!activeUser || userRole !== "seller") {
            router.push("/");
        }
    }, [activeUser, userRole, isPending, router]);

    if (isPending) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <p className="text-sm font-medium text-gray-500 animate-pulse">
                    Verifying security credentials...
                </p>
            </div>
        );
    }

    if (!activeUser || userRole !== "seller") {
        return null;
    }

    return (
        <div>
            {children}
        </div>
    );
};

export default SellerLayout;