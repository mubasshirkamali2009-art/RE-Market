"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Smartphone, Laptop, Headphones, Footprints, TrendingUp, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client"; // adjust path to wherever authClient is exported from

// =====================================================
// FAKE / PLACEHOLDER DATA
// TODO: replace each of these with real fetches once the
// backend endpoints exist:
//   - salesChartData      <- GET /api/seller/orders?sellerId=...  (grouped by month, summed revenue)
//   - monthlySalesTrend   <- GET /api/seller/orders?sellerId=...  (grouped by month, summed quantity)
//   - topSellingProducts  <- GET /api/seller/products/top-selling?sellerId=...
// =====================================================
const salesChartData = [
  { month: "Jan", sales: 2000 },
  { month: "Feb", sales: 3200 },
  { month: "Mar", sales: 2400 },
  { month: "Apr", sales: 4200 },
  { month: "May", sales: 4400 },
  { month: "Jun", sales: 5800 },
  { month: "Jul", sales: 7000 },
];

const monthlySalesTrend = [
  { month: "Jan", units: 2 },
  { month: "Feb", units: 4.3 },
  { month: "Mar", units: 4.8 },
  { month: "Apr", units: 3.1 },
  { month: "May", units: 4 },
  { month: "Jun", units: 5 },
];

const topSellingProducts = [
  { id: 1, name: "iPhone 12", sales: 120, icon: Smartphone },
  { id: 2, name: "MacBook Air", sales: 85, icon: Laptop },
  { id: 3, name: "Sony Headphones", sales: 60, icon: Headphones },
  { id: 4, name: "Nike Air Max", sales: 45, icon: Footprints },
];

// =====================================================
// Main Page
// =====================================================
export default function SellerAnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Wait until better-auth finishes loading the session before deciding.
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  // While the session is loading, show a spinner instead of flashing the page.
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );
  }

  // Not logged in: render nothing while the redirect above kicks in.
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h1 className="text-lg sm:text-xl font-bold text-green-700">Sales Analytics</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* ============ Sales Chart (Area) ============ */}
            <ChartCard title="Sales Chart">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={salesChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
                  />
                  <Tooltip
                    formatter={(value) => [`৳ ${value.toLocaleString()}`, "Sales"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#salesFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#16a34a" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* ============ Monthly Sales Trend (Bar) ============ */}
            <ChartCard title="Monthly Sales Trend">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlySalesTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} units`, "Sold"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="units" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* ============ Top Selling Products (List) ============ */}
            <ChartCard title="Top Selling Products">
              <div className="flex flex-col divide-y divide-gray-100">
                {topSellingProducts.map((product) => {
                  const Icon = product.icon;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-3 first:pt-1"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4.5 h-4.5 text-gray-600" />
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {product.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                        {product.sales} Sales
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Card wrapper shared by all three panels
// =====================================================
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  );
}