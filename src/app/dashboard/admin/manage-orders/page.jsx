"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { ShoppingBag, User, Store, AlertCircle, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function AdminManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Safely extract active admin user account session context
  const { data: hookSession, isPending } = useSession();
  const clientSession = authClient?.useSession?.()?.data || null;
  const adminEmail = hookSession?.user?.email || clientSession?.user?.email || "admin@system.com";

  // Stable global fetch handler
  const fetchAllOrders = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`);
      if (!response.ok) throw new Error("Failed to load global system orders from server.");
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Unable to aggregate platform orders. Verify database availability.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending) {
      fetchAllOrders();
    }
  }, [isPending, fetchAllOrders]);

  // Invoke administrative cancel operation
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you certain you want to cancel this order as an Administrator? This will automatically restore item stock levels.")) return;
    
    try {
      setActionLoadingId(orderId);
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Failed to cancel order.");

      alert("Order successfully terminated by Admin authority.");
      setLoading(true);
      fetchAllOrders(); // Refresh dataset
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while canceling the order.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "processing":
        return { bg: "bg-blue-50 border-blue-200 text-blue-700", icon: Clock };
      case "cancelled":
        return { bg: "bg-red-50 border-red-200 text-red-700", icon: XCircle };
      default:
        return { bg: "bg-green-50 border-green-200 text-green-700", icon: CheckCircle2 };
    }
  };

  if (isPending || loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-gray-100 rounded-2xl border" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center max-w-xl mx-auto mt-12 bg-red-50 rounded-2xl border border-red-100 text-red-600">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p className="font-semibold">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            fetchAllOrders();
          }} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Retry Sync Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-indigo-600" /> Administrative Order Registry
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor marketplace sales activities, review transactional snapshot summaries, and invoke platform order overrides.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No order records exist on the network backend database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const statusInfo = getStatusStyle(order.orderStatus);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={order._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
                
                {/* Upper Metadata Block */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      ORDER ID: {order._id}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Date Unavailable"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusInfo.bg}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {order.orderStatus?.toUpperCase()}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${order.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                      Payment: {order.paymentStatus || 'paid'}
                    </span>
                  </div>
                </div>

                {/* Main Information Split Layout Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Column 1: Snapshot Product Items */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Product Blueprint
                    </h3>
                    <div className="flex gap-3">
                      {order.productSnapshot?.image ? (
                        <img 
                          src={order.productSnapshot.image} 
                          alt={order.productSnapshot.name} 
                          className="w-16 h-16 object-cover rounded-xl border bg-gray-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400 flex-shrink-0">
                          No Img
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{order.productSnapshot?.name || "Deleted Product Reference"}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Category: {order.productSnapshot?.category || "Unassigned"}</p>
                        <p className="text-sm font-bold text-indigo-600 mt-1">
                          ৳{order.productSnapshot?.price || 0} <span className="text-xs text-gray-400 font-normal">x {order.quantity || 1} Pcs</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Buyer Context Info */}
                  <div className="space-y-2 border-t md:border-t-0 md:border-x border-gray-100 pt-4 md:pt-0 md:px-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Buyer Information
                    </h3>
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-gray-800">{order.buyerInfo?.name || "Anonymous Consumer"}</p>
                      <p className="text-xs text-gray-500 break-all">{order.buyerInfo?.email}</p>
                      <p className="text-xs text-gray-600 mt-1 bg-slate-50 border p-1.5 rounded line-clamp-2">
                        Location: {order.buyerInfo?.address || "No Shipping Address Registered"}
                      </p>
                    </div>
                  </div>

                  {/* Column 3: Seller Context Info */}
                  <div className="space-y-2 pt-4 md:pt-0">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" /> Merchant Info
                    </h3>
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-gray-800">{order.sellerInfo?.name || "Unverified Merchant Profile"}</p>
                      <p className="text-xs text-gray-500 break-all">{order.sellerInfo?.email || "No email routing found"}</p>
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Gross Settlement:</span>
                        <span className="text-base font-extrabold text-gray-900">
                          ৳{((order.productSnapshot?.price || 0) * (order.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Lower Action Buttons Panel */}
                {order.orderStatus !== "cancelled" && (
                  <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={actionLoadingId === order._id}
                      className="px-4 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {actionLoadingId === order._id ? "Processing Override..." : "Cancel Order Entry"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}