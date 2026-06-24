"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Store, 
  Calendar, 
  Hash, 
  Mail, 
  Tag, 
  RefreshCw,
  ShoppingBag,
  ArrowUpRight
} from "lucide-react";

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function BuyerPaymentHistory() {
  const { data: session, isPending } = authClient.useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userEmail = session?.user?.email;

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      setError("Please login to view your secure payment transactions inventory.");
      setLoading(false);
      return;
    }

    if (!userEmail) return;

    async function fetchTransactionHistory() {
      const apiBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      try {
        setLoading(true);
        
        const paymentRes = await fetch(`${apiBase}/api/payments?email=${userEmail}`);
        if (!paymentRes.ok) throw new Error("Failed to capture financial transactions records.");
        const paymentData = await paymentRes.json();

        const orderRes = await fetch(`${apiBase}/api/orders?email=${userEmail}`);
        const orderData = orderRes.ok ? await orderRes.json() : [];

        const enrichedPayments = paymentData.map((payment) => {
          const relatedOrder = orderData.find(
            (ord) => ord.productId === payment.productId || ord.productSnapshot?.name === payment.productName
          );

          return {
            ...payment,
            sellerInfo: {
              name: relatedOrder?.sellerInfo?.name || payment.sellerName || "Unknown Merchant",
              email: relatedOrder?.sellerInfo?.email || payment.sellerEmail || "No email available"
            },
            productCategory: relatedOrder?.productSnapshot?.category || payment.category || "Uncategorized Item"
          };
        });

        setPayments(enrichedPayments);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "An error occurred while building the telemetry grid.");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactionHistory();
  }, [userEmail, session, isPending]);

  const formatPrice = (amount) => {
    return `৳ ${(amount || 0).toLocaleString("en-US")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative flex items-center justify-center">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-600" />
          <div className="absolute w-14 h-14 rounded-full border-2 border-dashed border-emerald-200 animate-[spin_4s_linear_infinite]" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase animate-pulse">
          Compiling dynamic ledger files...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto my-12 p-6 bg-rose-50 rounded-2xl border border-rose-100 text-center shadow-sm"
      >
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-slate-50/30 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl bg-gradient-to-r from-slate-900 to-emerald-800 bg-clip-text text-transparent">
            Billing History
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Review your transactional security logs, platform invoices, and tracking metadata tokens.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl text-xs font-mono font-medium text-slate-600 shadow-sm border border-slate-100 self-start sm:self-center flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Account: {userEmail}
        </div>
      </div>

      {payments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm max-w-xl mx-auto p-8"
        >
          <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No transactions recorded</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
            Purchase order payloads will initialize automatically upon stripe resolution loops.
          </p>
        </motion.div>
      ) : (
        /* Transaction Cards Grid Container */
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6"
        >
          <AnimatePresence>
            {payments.map((item) => (
              <motion.div 
                key={item._id} 
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden lg:flex lg:flex-row"
              >
                {/* Decorative hover gradient border line */}
                <div className="absolute top-0 left-0 w-full lg:w-1 h-1 lg:h-full bg-slate-200 group-hover:bg-emerald-500 transition-colors duration-300" />

                {/* Section 1: Product Core Specs */}
                <div className="p-6 lg:w-1/3 bg-slate-50/40 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between transition-colors duration-300 group-hover:bg-slate-50/80">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.paymentStatus || "Successful"}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-slate-900 transition-colors duration-200">
                      {item.productName || "E-Marketplace Asset"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" /> {item.productCategory}
                    </p>
                  </div>
                  <div className="mt-6 lg:mt-0 pt-4 border-t border-slate-200/60 lg:border-none">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Price Incurred</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5 group-hover:text-emerald-600 transition-colors duration-200">
                      {formatPrice(item.amount)}
                    </p>
                  </div>
                </div>

                {/* Section 2: Authorization Metadata Tokens */}
                <div className="p-6 lg:w-1/3 space-y-4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Architecture Tokens</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Hash className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div className="min-w-0 w-full">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Session Token ID</p>
                        <p className="text-xs font-mono text-slate-600 break-all mt-1.5 select-all bg-slate-50 group-hover:bg-white group-hover:border-slate-200 border border-transparent p-2 rounded-xl transition-all duration-300">
                          {item.stripeSessionId || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CreditCard className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div className="min-w-0 w-full">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Payment Intent ID</p>
                        <p className="text-xs font-mono text-slate-600 break-all mt-1.5 select-all bg-slate-50 group-hover:bg-white group-hover:border-slate-200 border border-transparent p-2 rounded-xl transition-all duration-300">
                          {item.paymentIntentId || "Direct Platform Clearance Mapping"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Dynamic Merchant Details & Timeline */}
                <div className="p-6 lg:w-1/3 bg-white flex flex-col justify-between gap-6">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        }) : "Processing Timestamps..."}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-slate-400" /> Merchant Details
                      </p>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors duration-200">
                          {item.sellerInfo?.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3 flex-shrink-0" /> {item.sellerInfo?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Currency Vault Ledger</span>
                    <span className="font-mono font-bold uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md tracking-wider">
                      {item.currency || "BDT"}
                    </span>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}