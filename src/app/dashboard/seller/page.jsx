"use client";
import { useSession } from "@/lib/auth-client";
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:5000";

function formatPrice(n) {
  return `৳ ${Number(n || 0).toLocaleString("en-US")}`;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SaleAnalyticsPage() {
  const { data: session, isPending } = useSession();
  const sellerEmail = session?.user?.email || null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Fetch this seller's real orders ─────────────────────────────────
  useEffect(() => {
    if (isPending || !sellerEmail) return;

    async function fetchOrders() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(
          `${API_BASE}/api/orders/seller?email=${encodeURIComponent(sellerEmail)}`
        );
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Couldn't load sales data. Check that your API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isPending, sellerEmail]);

  // ── Only count orders that actually went through (not cancelled) ───
  const completedOrders = useMemo(
    () => orders.filter((o) => o.orderStatus !== "cancelled"),
    [orders]
  );

  // ── Sales Chart: cumulative revenue by month (line) ─────────────────
  const salesChartData = useMemo(() => {
    const byMonth = {};
    completedOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const revenue = (o.productSnapshot?.price || 0) * (o.quantity || 1);
      byMonth[key] = (byMonth[key] || 0) + revenue;
    });

    const sortedKeys = Object.keys(byMonth).sort();

    // Build cumulative totals with reduce instead of mutating an outer
    // variable inside a loop — avoids the "reassign after render" lint rule.
    const { rows } = sortedKeys.reduce(
      (acc, key) => {
        const [, monthIdx] = key.split("-");
        const nextTotal = acc.runningTotal + byMonth[key];
        acc.rows.push({ month: MONTH_NAMES[Number(monthIdx)], revenue: Math.round(nextTotal) });
        acc.runningTotal = nextTotal;
        return acc;
      },
      { runningTotal: 0, rows: [] }
    );

    return rows;
  }, [completedOrders]);

  // ── Monthly Sales Trend: order COUNT per month (bar) ────────────────
  const monthlyTrendData = useMemo(() => {
    const byMonth = {};
    completedOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(byMonth).sort();
    return sortedKeys.map((key) => {
      const [, monthIdx] = key.split("-");
      return { month: MONTH_NAMES[Number(monthIdx)], sales: byMonth[key] };
    });
  }, [completedOrders]);

  // ── Top Selling Products: group by product name, count quantity ────
  const topProducts = useMemo(() => {
    const byProduct = {};
    completedOrders.forEach((o) => {
      const name = o.productSnapshot?.name || "Unknown";
      byProduct[name] = (byProduct[name] || 0) + (o.quantity || 1);
    });

    return Object.entries(byProduct)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [completedOrders]);

  const showLoading = isPending || loading;

  if (showLoading) {
    return (
      <div className="p-6">
        <div className="h-7 w-44 bg-gray-100 rounded-lg mb-5 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
          {errorMsg}
        </div>
      </div>
    );
  }

  const hasData = completedOrders.length > 0;

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-[#1f4d3c] flex items-center gap-2 mb-5">
  
        Sales Analytics
      </h2>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center text-gray-500">
          No sales yet. Once you receive orders, your analytics will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Sales Chart (cumulative revenue, line) ─────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-[#1f2d22] mb-4">Sales Chart</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3e2" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a8a78" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#7a8a78" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
                />
                <Tooltip formatter={(v) => formatPrice(v)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2c6b4f"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2c6b4f" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Monthly Sales Trend (order count, bar) ─────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-[#1f2d22] mb-4">Monthly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3e2" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a8a78" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#7a8a78" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="#2c6b4f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Top Selling Products ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-[#1f2d22] mb-4">Top Selling Products</h3>
            <div className="space-y-3.5">
              {topProducts.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#eef3e2] text-[#2c6b4f] flex-shrink-0">
                
                  </span>
                  <span className="text-sm font-medium text-[#1f2d22] flex-1 truncate">{p.name}</span>
                  <span className="text-sm text-[#7a8a78] flex-shrink-0">{p.sales} Sales</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}