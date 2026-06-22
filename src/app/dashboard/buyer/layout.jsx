"use client";
import React, { useEffect } from 'react';
// FIX: Corrected typo from useRouter to useRouter
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client"; 

// FIX: Capitalized the component variable name to satisfy React Hook rules
const BuyerLayout = ({children}) => {
    const router = useRouter();
  
    const { data: hookSession, isPending } = useSession();
    const clientSession = authClient?.useSession?.()?.data || null;

    const activeUser = hookSession?.user || clientSession?.user;
    const userRole = activeUser?.role;

    useEffect(() => {
        if (isPending) return;

        if (!activeUser || userRole !== "buyer") {
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

    if (!activeUser || userRole !== "buyer") {
        return null;
    }

    return (
        <div>
            {children}
        </div>
    );
};

// Keep your export exactly as it was requested
export default BuyerLayout;