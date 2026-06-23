"use client";
import React, { Suspense, useEffect, useState } from "react";
// Import both from your auth file to capture the session safely
import { useSession, authClient } from "@/lib/auth-client"; // Adjust this path to your actual auth file
import { 
  ShoppingCart, 
  ShoppingBag, 
  Heart, 
  TrendingUp, 
  Package, 
  XCircle, 
  Users, 
  UserCheck 
} from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export default function AdaptiveDashboardGrid() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Grab session from the destructured useSession hook
  const { data: hookSession, isPending: hookPending } = useSession();
  
  // 2. Fallback: Grab session directly from the configured client instance state
  const clientSession = authClient?.useSession?.()?.data || null;

  // Resolve the active email address from either instance
  const activeEmail = hookSession?.user?.email || clientSession?.user?.email || null;

  useEffect(() => {
    // Wait until the auth status finishes checking before throwing an error
    if (hookPending) return;

    if (!activeEmail) {
      setLoading(false);
      setError("No active session found. Please check your login status.");
      return;
    }

    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/stats?email=${encodeURIComponent(activeEmail)}`
        );
        
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }
        
        const payload = await response.json();
        setData(payload);
      } catch (err) {
        console.error("Dashboard fetching error:", err);
        setError("Failed to fetch dashboard metric updates from server.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [activeEmail, hookPending]);

  // Display loaders while auth is tracking down the session or data is fetching
  if (hookPending || (loading && !data)) return <MarketplaceStatsLoader />;
  if (error && !data) return <p className="text-sm font-medium text-red-500 p-4">{error}</p>;
  if (!data) return <p className="text-sm font-medium text-gray-500 p-4">No dashboard data available.</p>;

  const { role, metrics } = data;

  // Configuration map for card displays
  const resolveCardsByRole = () => {
    switch (role) {
      case "buyer":
        return [
          { label: "Total Orders", value: metrics.totalOrders || 0, icon: ShoppingBag, color: "bg-green-500/10 text-green-600 border-green-200" },
          { label: "Total Wishlist", value: metrics.savedItems || 0, icon: Heart, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
          { label: "Total Cart", value: metrics.totalCarts || 0, icon: ShoppingCart, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
          { label: "Total Spent", value: `৳${(metrics.totalSpent || 0).toLocaleString()}`, icon: TrendingUp, color: "bg-red-500/10 text-red-600 border-red-200" },
        ];
      case "seller":
        return [
          { label: "Total Sales", value: `৳${(metrics.totalSalesRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: "bg-green-500/10 text-green-600 border-green-200" },
          { label: "Total Products", value: metrics.totalProducts || 0, icon: Package, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
          { label: "Pending Processing", value: metrics.totalPending || 0, icon: ShoppingBag, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
          { label: "Total Canceled", value: metrics.totalCanceled || 0, icon: XCircle, color: "bg-red-500/10 text-red-600 border-red-200" },
        ];
      case "admin":
        return [
          { label: "Total Users", value: metrics.totalUsers || 0, icon: Users, color: "bg-slate-500/10 text-slate-600 border-slate-200" },
          { label: "Total Products", value: metrics.totalProducts || 0, icon: Package, color: "bg-red-500/10 text-red-600 border-red-200" },
          { label: "Total Sellers", value: metrics.totalSellers || 0, icon: UserCheck, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
          { label: "Total Buyers", value: metrics.totalBuyers || 0, icon: UserCheck, color: "bg-green-500/10 text-green-600 border-green-200" },
        ];
      default:
        return [];
    }
  };

  const cards = resolveCardsByRole();

  return (
<Suspense fallback={<p>loading</p>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
            <div className={`p-3 rounded-xl border ${card.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
</Suspense>
  );
}

function MarketplaceStatsLoader() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4 animate-pulse">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-[110px] w-full rounded-2xl border border-gray-100 bg-gray-50" />
      ))}
    </div>
  );
}