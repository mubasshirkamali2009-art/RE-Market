"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Home,
  ShoppingBag,
  Boxes,
  Users,
  BarChart3,
  Settings,
  Heart,
  Package,
  Menu,
  LayoutDashboard,
  BaggageClaim
  ,
  MonitorCog ,
   History
} from "lucide-react";
import { Button, Drawer } from "@heroui/react";

// Role-based sidebar configurations mapping exactly to your system sub-paths
const ROLE_NAV_ITEMS = {
  admin: [
    { label: "Admin Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Orders", href: "/dashboard/admin/manage-orders", icon: ShoppingBag },
    { label: "Manage Products", href: "/dashboard/admin/manage-products", icon: Boxes },
    { label: "Manage Users", href: "/dashboard/admin/manage-users", icon: Users },
    { label: "Monitor Payments", href: "/dashboard/admin/monitorallpayments", icon: MonitorCog },
    { label: "System Analytics", href: "/dashboard/admin/platform-analytics", icon: BarChart3 },
    
  ],
  buyer: [
    { label: "Buyer Overview", href: "/dashboard/buyer", icon: LayoutDashboard },
    { label: "My Orders", href: "/dashboard/buyer/my-orders", icon: Package },
    { label: "Saved Items", href: "/dashboard/buyer/wishlist", icon: Heart },
    { label: "Cart", href: "/dashboard/buyer/card", icon: BaggageClaim },
    { label: "payment history", href: "/dashboard/buyer/payment-history", icon:  History },
    { label: "Account Profile", href: "/dashboard/buyer/profile-management", icon: Settings },
  ],
  seller: [
    { label: "Seller Showcase", href: "/dashboard/seller", icon: LayoutDashboard },
    { label: "Inventory Listings", href: "/dashboard/seller/my-products", icon: Boxes },
    { label: "Add New Product", href: "/dashboard/seller/add-products", icon: Package },
    { label: "Sales & Orders", href: "/dashboard/seller/manage-orders", icon: ShoppingBag },
    { label: "Revenue Analytics", href: "/dashboard/seller/sale-anaytics", icon: BarChart3 },
  ],
};

// Standard safe fallback options
const SAFE_FALLBACK_LINKS = [
  { label: "Home Base", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  
  const user = session?.user;
  const currentRole = user?.role?.toLowerCase();

  // Pick dynamic list based on database user role
  const sidebarLinks = ROLE_NAV_ITEMS[currentRole] || SAFE_FALLBACK_LINKS;

  // Exact match handling for index dashboards, sub-route matching for nested pages
  function isLinkActive(href) {
    if (href === "/dashboard/admin" || href === "/dashboard/buyer" || href === "/dashboard/seller") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Pure clean markup structure rendered for both Desktop and Mobile views
  const sidebarNavigationMarkup = (
    <nav className="flex flex-col gap-1.5 w-full">
      {isPending ? (
        // Clean skeleton indicators while authentication verifies mounting positions
        <div className="space-y-3 p-2">
          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse w-[90%]" />
          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse w-[85%]" />
        </div>
      ) : (
        sidebarLinks.map((link) => {
          const isActive = isLinkActive(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-colors ${
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                }`} 
              />
              {link.label}
            </Link>
          );
        })
      )}
    </nav>
  );

return (
    <>
      {/* ================= DESKTOP SIDEBAR PANEL ================= */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-68px)] sticky top-[68px] border-r border-slate-100 dark:border-white/10 bg-[#FAF8F0]/50 dark:bg-slate-900/50 p-4 overflow-y-auto">
        <div className="mb-4 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Access Tier</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
            {isPending ? "Verifying..." : currentRole || "Guest User"}
          </p>
        </div>
        {sidebarNavigationMarkup}
      </aside>

      {/* ================= MOBILE & TABLET DRAWER BUTTON (sm & md) ================= */}
      {/* Positioned at the top-left (below the top navbar) to avoid conflicts with bottom overlays */}
      <div className="block lg:hidden fixed top-20 left-4 z-50">
        <Drawer>
          <Button 
            isIconOnly
            radius="full"
            variant="shadow"
            className="bg-gradient-to-tr from-emerald-600 to-green-600 text-white h-12 w-12 shadow-lg shadow-emerald-600/30"
            aria-label="Open Dashboard Menu"
          >
            <Menu size={22} />
          </Button>
          <Drawer.Backdrop>
            <Drawer.Content placement="left" className="bg-white dark:bg-slate-900 max-w-[280px]">
              <Drawer.Dialog>
                <Drawer.CloseTrigger />
                <Drawer.Header className="border-b border-slate-100 dark:border-white/10">
                  <Drawer.Heading className="text-slate-900 dark:text-white capitalize text-lg flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentRole || "Navigation"} Portal
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="pt-4">
                  {sidebarNavigationMarkup}
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>
    </>
  );
}