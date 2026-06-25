"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  User, 
  Store, 
  ShoppingBag, 
  Calendar, 
  Search, 
  ArrowUpDown, 
  Hash, 
  DollarSign, 
  CheckCircle,
  AlertCircle 
} from "lucide-react";

export default function MonitorAllPayments() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // Newest first by default

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // আপনার ব্যাকএন্ড পোর্ট ৫০০০ অনুযায়ী পেমেন্ট ও অর্ডার কল করা হচ্ছে
        const [paymentsRes, ordersRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/payments"),
          fetch("http://localhost:5000/api/admin/orders")
        ]);

        const paymentsData = await paymentsRes.json();
        const ordersData = await ordersRes.json();

        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error("Error loading administration parameters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // বায়ার ও সেলার ডিটেইলস খোঁজার জন্য পেমেন্ট মেটাডেটা অথবা অর্ডার স্ন্যাপশটের ক্রস-ম্যাচিং লজিক
  const getTransactionDetails = (payment) => {
    // পেমেন্টের productId দিয়ে সংশ্লিষ্ট অর্ডারটি খুঁজে বের করা
    const linkedOrder = orders.find(
      (order) => order.productId === payment.productId || order._id === payment.metadata?.orderId
    );

    return {
      buyerName: linkedOrder?.buyerInfo?.name || payment.metadata?.buyerName || "Mubasshir",
      buyerEmail: payment.customerEmail || linkedOrder?.buyerInfo?.email || "N/A",
      sellerName: linkedOrder?.sellerInfo?.name || payment.metadata?.sellerName || "Rahat Ahmed",
      sellerEmail: linkedOrder?.sellerInfo?.email || "N/A",
      productImage: linkedOrder?.productSnapshot?.image || payment.metadata?.image || null,
      quantity: linkedOrder?.quantity || payment.metadata?.quantity || 1,
      orderStatus: linkedOrder?.orderStatus || "completed"
    };
  };

  // সার্চ ও সর্টিং ফিল্টার লজিক
  const filteredPayments = payments
    .filter((payment) => {
      const details = getTransactionDetails(payment);
      const searchString = `${payment.productName} ${payment.stripeSessionId} ${payment.customerEmail} ${details.buyerName} ${details.sellerName}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const toggleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono tracking-widest">AGGREGATING GLOBAL PAYMENTS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-8 font-sans">
      
      {/* হেডার সেকশন */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-200">
            Payment Control Ledger
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
            Securely monitoring {payments.length} dynamic transactional node systems
          </p>
        </div>

        {/* সার্চ এবং সর্ট বার */}
        <div className="flex w-full sm:w-auto gap-2 items-center">
          <div className="relative flex-1 sm:w-64 md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search session, buyer, seller, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button
            onClick={toggleSort}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-sm"
            title="Toggle Date Sorting"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden md:inline font-mono text-xs">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </button>
        </div>
      </div>

      {/* মেইন ট্রানজেকশন কন্টেইনার */}
      <div className="max-w-7xl mx-auto">
        {filteredPayments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-xl p-12 text-center text-slate-400 dark:text-slate-500 font-mono">
            No secure payment records matched your lookup parameter tokens.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            
            {/* রেসপন্সিভ কার্ড লিস্ট (sm, md, lg রেসপন্সিভ গ্রিড লেআউট) */}
            <AnimatePresence>
              {filteredPayments.map((payment, idx) => {
                const details = getTransactionDetails(payment);
                
                return (
                  <motion.div
                    key={payment._id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                    onClick={() => setSelectedPayment(payment)}
                    className="bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 rounded-xl p-4 md:p-5 transition-all duration-200 cursor-pointer grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
                  >
                    {/* কলাম ১: পেমেন্ট অ্যামাউন্ট ও স্ট্যাটাস */}
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 flex items-center gap-0.5">
                          <span>৳</span>{payment.amount?.toLocaleString()}
                          <span className="text-xs uppercase text-slate-400 dark:text-slate-500 font-normal ml-1">
                            {payment.currency || "bdt"}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> SUCCESS
                        </span>
                      </div>
                    </div>

                    {/* কলাম ২: প্রোডাক্ট ডিলস */}
                    <div className="flex items-center gap-3 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 sm:pt-0">
                      {details.productImage ? (
                        <img 
                          src={details.productImage} 
                          alt="product" 
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{payment.productName || "Unknown Asset"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Qty: {details.quantity}</p>
                      </div>
                    </div>

                    {/* কলাম ৩: বায়ার বনাম সেলার পাথওয়ে */}
                    <div className="grid grid-cols-2 gap-2 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 lg:pt-0 col-span-1 sm:col-span-2 lg:col-span-1">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-mono mb-0.5">
                          <User className="h-3 w-3 text-teal-600 dark:text-teal-400" /> Buyer
                        </div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{details.buyerName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{details.buyerEmail}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-mono mb-0.5">
                          <Store className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Seller
                        </div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{details.sellerName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{details.sellerEmail}</p>
                      </div>
                    </div>

                    {/* কলাম ৪: টাইমস্ট্যাম্প ও অ্যাকশন */}
                    <div className="flex justify-between items-center border-t sm:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 sm:pt-0 lg:justify-end gap-4">
                      <div className="lg:text-right">
                        <div className="flex items-center lg:justify-end gap-1 text-xs text-slate-400 dark:text-slate-500 font-mono mb-0.5">
                          <Calendar className="h-3 w-3" /> Timestamp
                        </div>
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {new Date(payment.createdAt).toLocaleDateString("en-GB")}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 hidden md:inline-block">
                        Inspect
                      </span>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

          </div>
        )}
      </div>

      {/* ডিটেইলড মোডাল উইন্ডো (পেমেন্টের এ টু জেড তথ্য দেখার জন্য) */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              {/* মোডাল হেডার */}
              <div className="border-b border-slate-200 dark:border-slate-800 p-5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction Node Inspector</span>
                </div>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 font-mono text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* মোডাল বডি */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-mono text-xs">
                
                {/* মূল অ্যামাউন্ট ব্যানার */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Stripe Charge Intended</span>
                    <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">৳{selectedPayment.amount?.toLocaleString()}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Node Status</span>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle className="h-3 w-3" /> LOGGED_PAID
                    </div>
                  </div>
                </div>

                {/* ৩টি প্রধান পার্ট (Buyer, Product, Seller) গ্রিড */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* বায়ার */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 p-3 rounded-xl space-y-1">
                    <h4 className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                      <User className="h-3 w-3" /> Buyer Context
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{getTransactionDetails(selectedPayment).buyerName}</p>
                    <p className="text-slate-400 dark:text-slate-500 break-all">{getTransactionDetails(selectedPayment).buyerEmail}</p>
                  </div>
                  
                  {/* প্রোডাক্ট */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 p-3 rounded-xl space-y-1">
                    <h4 className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                      <ShoppingBag className="h-3 w-3" /> Asset Snapshot
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold truncate">{selectedPayment.productName || "N/A"}</p>
                    <p className="text-slate-400 dark:text-slate-500">ID: {selectedPayment.productId || "Direct Check"}</p>
                    <p className="text-slate-500 dark:text-slate-400">Items: {getTransactionDetails(selectedPayment).quantity}</p>
                  </div>

                  {/* সেলার */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 p-3 rounded-xl space-y-1">
                    <h4 className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                      <Store className="h-3 w-3" /> Target Merchant
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{getTransactionDetails(selectedPayment).sellerName}</p>
                    <p className="text-slate-400 dark:text-slate-500 break-all">{getTransactionDetails(selectedPayment).sellerEmail}</p>
                  </div>
                </div>

                {/* ক্রিপ্টোগ্রাফিক সেশন আইডি ব্লকসমূহ */}
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/30 p-4 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                  <div>
                    <label className="text-slate-400 dark:text-slate-500 text-[10px] block uppercase mb-1">Stripe Session Identity Key</label>
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300 select-all break-all">
                      {selectedPayment.stripeSessionId}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 dark:text-slate-500 text-[10px] block uppercase mb-1">Payment Intent Mapping Hash</label>
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300 select-all break-all">
                      {selectedPayment.paymentIntentId || "pi_null_bypass_mode"}
                    </div>
                  </div>
                </div>

                {/* মেটাডেটা লগ ইন্স্পেকশন */}
                <div>
                  <label className="text-slate-400 dark:text-slate-500 text-[10px] block uppercase mb-1">Raw Payload Metadata Object</label>
                  <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-500/90 overflow-x-auto max-h-32">
                    {JSON.stringify(selectedPayment.metadata, null, 2)}
                  </pre>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}