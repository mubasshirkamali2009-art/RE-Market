"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Users, Store, CheckCircle } from "lucide-react";

const API_BASE = "http://localhost:5000";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.4, ease: "easeOut" } 
  },
};

export default function MarketplaceStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSellers: 0,
    totalBuyers: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch completely dynamic aggregated calculations directly from the backend database
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) throw new Error("Failed to fetch platform metrics");
        const data = await res.json();

        setStats({
          totalProducts: data.totalProducts || 0,
          totalSellers: data.totalSellers || 0,
          totalBuyers: data.totalBuyers || 0,
          totalSales: data.totalSales || 0,
        });
      } catch (err) {
        console.error("Failed to load statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
      gradient: "from-emerald-500/10 to-green-500/5",
    },
    {
      label: "Total Sellers",
      value: stats.totalSellers,
      icon: <Store className="w-5 h-5 text-teal-600" />,
      gradient: "from-teal-500/10 to-emerald-500/5",
    },
    {
      label: "Total Buyers",
      value: stats.totalBuyers,
      icon: <Users className="w-5 h-5 text-green-600" />,
      gradient: "from-green-500/10 to-emerald-500/5",
    },
    {
      label: "Total Sales",
      value: stats.totalSales,
      icon: <CheckCircle className="w-5 h-5 text-amber-600" />,
      gradient: "from-amber-500/10 to-orange-500/5",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto p-6 md:p-10 bg-white rounded-3xl shadow-sm my-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Marketplace{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Statistics
          </span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">Live overview of platform growth and engagement.</p>
      </div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={loading ? "hidden" : "visible"}
      >
        {statItems.map((item) => (
          <motion.div
            key={item.label}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className={`p-5 rounded-2xl border border-gray-100 bg-gradient-to-br ${item.gradient} flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-shadow hover:shadow-md`}
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-800 mt-0.5">
                {item.value.toLocaleString("en-US")}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-50 border border-gray-100 rounded-2xl" />
          ))}
        </div>
      )}
    </section>
  );
}