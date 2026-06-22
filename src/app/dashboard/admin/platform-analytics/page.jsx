"use client";
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Persons, ShoppingCart, CircleDollar,
  Box, Bell, ArrowUpRight, ArrowDownRight, Clock,
} from "@gravity-ui/icons";

// =====================================================
// Hardcoded data — wire to real endpoints later
// =====================================================
const KPI_CARDS = [
  { label: "Total Revenue", value: 284750, prefix: "৳", change: 12.4, trend: "up", icon: CircleDollar },
  { label: "Active Users", value: 8421, change: 6.1, trend: "up", icon: Persons },
  { label: "Orders Today", value: 312, change: -3.2, trend: "down", icon: ShoppingCart },
  { label: "Listed Products", value: 5907, change: 8.7, trend: "up", icon: Box },
];

const REVENUE_TREND = [
  { month: "Jan", value: 32 }, { month: "Feb", value: 38 },
  { month: "Mar", value: 35 }, { month: "Apr", value: 44 },
  { month: "May", value: 51 }, { month: "Jun", value: 49 },
  { month: "Jul", value: 58 }, { month: "Aug", value: 64 },
  { month: "Sep", value: 61 }, { month: "Oct", value: 71 },
  { month: "Nov", value: 78 }, { month: "Dec", value: 85 },
];

const CATEGORY_SPLIT = [
  { label: "Electronics", pct: 34, color: "#2c6b4f" },
  { label: "Fashion", pct: 24, color: "#3d8a68" },
  { label: "Home & Living", pct: 18, color: "#6fae8e" },
  { label: "Vehicles", pct: 14, color: "#9fcab6" },
  { label: "Other", pct: 10, color: "#cfe3d8" },
];

const TOP_SELLERS = [
  { rank: 1, name: "Nusrat Jahan", sales: "৳ 48,200", orders: 142, growth: 18 },
  { rank: 2, name: "Rakib Hasan", sales: "৳ 39,650", orders: 118, growth: 11 },
  { rank: 3, name: "Tania Ferdous", sales: "৳ 31,920", orders: 97, growth: -4 },
  { rank: 4, name: "Imran Khalid", sales: "৳ 27,440", orders: 85, growth: 7 },
  { rank: 5, name: "Sadia Islam", sales: "৳ 22,310", orders: 71, growth: 2 },
];

const LIVE_EVENTS = [
  "New order #ORD9241 placed — ৳1,250",
  "Seller Rakib Hasan listed 'MacBook Air M2'",
  "Payment confirmed for #ORD9238",
  "New buyer account created — riya.akter@gmail.com",
  "Order #ORD9219 marked delivered",
  "Seller Tania Ferdous updated stock for 'Nike Air Max'",
];

// =====================================================
// Animated count-up number — ledger-style digits
// =====================================================
function CountUp({ value, prefix = "", duration = 1.4 }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{prefix}{display.toLocaleString("en-US")}</span>;
}

// =====================================================
// Main Page
// =====================================================
export default function AdminAnalyticsPage() {
  const maxRevenue = Math.max(...REVENUE_TREND.map((d) => d.value));

  return (
    <div className="min-h-screen bg-[#0c1410] text-[#f4f7f2] font-sans overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">

        {/* ══════════════ Header ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8"
        >
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#6fae8e] font-mono mb-1.5">
              Re-Market · Control Room
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Platform Analytics
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8fa89c] font-mono self-start sm:self-auto bg-[#10190f] sm:bg-transparent px-3 sm:px-0 py-1.5 sm:py-0 rounded-full border border-[#1d2b22] sm:border-0">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#3d8a68] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full size-2 bg-[#3d8a68]" />
            </span>
            Live · Updated just now
          </div>
        </motion.div>

        {/* ══════════════ Live ticker ══════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative overflow-hidden rounded-xl border border-[#1d2b22] bg-[#10190f] mb-6 md:mb-8 h-10 flex items-center"
        >
          <div className="px-3 sm:px-4 h-full flex items-center bg-[#16241a] border-r border-[#1d2b22] flex-shrink-0 z-10">
            <Bell className="size-3.5 text-[#e8b34a]" />
          </div>
          <motion.div
            className="flex items-center gap-10 whitespace-nowrap font-mono text-[11px] sm:text-xs text-[#a8c4b6] px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {[...LIVE_EVENTS, ...LIVE_EVENTS].map((event, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-[#3d8a68]" />
                {event}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ══════════════ KPI cards ══════════════ */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8"
        >
          {KPI_CARDS.map((kpi) => {
            const Icon = kpi.icon;
            const TrendIcon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
            return (
              <motion.div
                key={kpi.label}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }}
                whileHover={{ y: -4, borderColor: "#2c6b4f" }}
                className="rounded-2xl border border-[#1d2b22] bg-[#10190f] p-4 sm:p-5 md:p-6 transition-colors cursor-default"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#16241a] text-[#3d8a68]">
                    <Icon className="size-4.5" />
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      kpi.trend === "up" ? "text-[#3d8a68] bg-[#3d8a68]/10" : "text-[#c97b6f] bg-[#c97b6f]/10"
                    }`}
                  >
                    <TrendIcon className="size-3" />
                    {Math.abs(kpi.change)}%
                  </span>
                </div>
                <p className="text-2xl sm:text-2xl md:text-3xl font-bold font-mono tracking-tight text-[#f4f7f2]">
                  <CountUp value={kpi.value} prefix={kpi.prefix || ""} />
                </p>
                <p className="text-xs text-[#8fa89c] mt-1.5 font-medium">{kpi.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ══════════════ Charts row ══════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 md:gap-6 mb-6 md:mb-8">

          {/* Revenue trend — animated bars */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ borderColor: "#2c6b4f" }}
            className="rounded-2xl border border-[#1d2b22] bg-[#10190f] p-4 sm:p-6 md:p-6 lg:p-8 transition-colors"
          >
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Revenue Trend</h3>
                <p className="text-[11px] sm:text-xs text-[#8fa89c] mt-0.5">Monthly, in thousands (৳)</p>
              </div>
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-none snap-x">
              <div className="flex items-end gap-2 md:gap-3 lg:gap-3.5 h-36 sm:h-44 min-w-[520px] md:min-w-0">
                {REVENUE_TREND.map((d, i) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group snap-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.value / maxRevenue) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ scaleY: 1.03 }}
                      className="w-full rounded-md bg-gradient-to-t from-[#2c6b4f] to-[#5fa483] relative cursor-default"
                      style={{ transformOrigin: "bottom", minHeight: 4 }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#a8c4b6] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#0c1410] px-1.5 py-0.5 rounded border border-[#1d2b22]">
                        ৳{d.value}K
                      </span>
                    </motion.div>
                    <span className="text-[10px] font-mono text-[#6f8a7c]">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Category split — indicators */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.5 }}
            whileHover={{ borderColor: "#2c6b4f" }}
            className="rounded-2xl border border-[#1d2b22] bg-[#10190f] p-4 sm:p-6 md:p-6 lg:p-8 transition-colors"
          >
            <h3 className="text-sm sm:text-base font-semibold mb-1">Category Split</h3>
            <p className="text-[11px] sm:text-xs text-[#8fa89c] mb-5 sm:mb-6">Share of total listings</p>

            <div className="space-y-4">
              {CATEGORY_SPLIT.map((cat, i) => (
                <div key={cat.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#dce8e0] font-medium">{cat.label}</span>
                    <span className="font-mono text-[#8fa89c]">{cat.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#16241a] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ delay: 0.55 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ══════════════ Top sellers table ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-2xl border border-[#1d2b22] bg-[#10190f] p-4 sm:p-6 md:p-6 lg:p-8"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-base font-semibold">Top Sellers</h3>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#6f8a7c] flex items-center gap-1 bg-[#16241a] px-2 py-1 rounded-md border border-[#1d2b22]">
              <Clock className="size-3" /> Last 30 days
            </span>
          </div>

          {/* Desktop & Tablet Table (Visible on md & larger viewports) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1d2b22] text-[11px] uppercase tracking-wider text-[#6f8a7c] font-mono">
                  <th className="py-3 pr-4 font-medium w-12">#</th>
                  <th className="py-3 pr-4 font-medium">Seller</th>
                  <th className="py-3 pr-4 font-medium">Revenue</th>
                  <th className="py-3 pr-4 font-medium">Orders</th>
                  <th className="py-3 pr-4 font-medium text-right">Growth</th>
                </tr>
              </thead>
              <tbody>
                {TOP_SELLERS.map((s, i) => (
                  <motion.tr
                    key={s.rank}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.06, duration: 0.4 }}
                    whileHover={{ backgroundColor: "#16241a" }}
                    className="border-b border-[#16241a] last:border-0 cursor-default"
                  >
                    <td className="py-3.5 pr-4 font-mono text-[#6f8a7c]">{String(s.rank).padStart(2, "0")}</td>
                    <td className="py-3.5 pr-4 font-medium text-[#dce8e0]">{s.name}</td>
                    <td className="py-3.5 pr-4 font-mono text-[#a8c4b6]">{s.sales}</td>
                    <td className="py-3.5 pr-4 font-mono text-[#8fa89c]">{s.orders}</td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                        s.growth >= 0 ? "text-[#3d8a68] bg-[#3d8a68]/10" : "text-[#c97b6f] bg-[#c97b6f]/10"
                      }`}>
                        {s.growth >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {Math.abs(s.growth)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Screen layout (Visible below md breakpoint) */}
          <div className="md:hidden flex flex-col gap-3">
            {TOP_SELLERS.map((s, i) => (
              <motion.div
                key={s.rank}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.06, duration: 0.4 }}
                whileHover={{ backgroundColor: "#16241a" }}
                className="rounded-xl border border-[#1d2b22] bg-[#121d16]/40 p-4 flex items-center gap-3.5"
              >
                <span className="font-mono text-[#6f8a7c] text-xs bg-[#16241a] size-6 rounded-md flex items-center justify-center border border-[#1d2b22] flex-shrink-0">
                  {String(s.rank).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#dce8e0] truncate">{s.name}</p>
                  <p className="text-[11px] font-mono text-[#8fa89c] mt-0.5">{s.orders} orders</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold font-mono text-[#a8c4b6]">{s.sales}</p>
                  <span className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                    s.growth >= 0 ? "text-[#3d8a68] bg-[#3d8a68]/10" : "text-[#c97b6f] bg-[#c97b6f]/10"
                  }`}>
                    {s.growth >= 0 ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                    {Math.abs(s.growth)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}