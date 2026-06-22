"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const TOP_CATEGORIES = [
  { name: "Phones", icon: "📱" },
  { name: "Furniture", icon: "🛋️" },
  { name: "TV & Monitors", icon: "📺" },
  { name: "Smart Watches", icon: "⌚" },
  { name: "Gaming Consoles", icon: "🎮" },
  { name: "Cars", icon: "🚗" },
];

export default function PopularCatgory() {
  const router = useRouter();

  // This will send users to /products?category=Phones (or whatever they click)
  function handleCategoryClick(categoryName) {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  }

  const handleViewAllClick = () => {
    router.push("/categories");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header section with title and "View All" */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Top Categories</h2>
        <button
          onClick={handleViewAllClick}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          View All <span className="text-xs">&gt;</span>
        </button>
      </div>

      {/* Horizontal row layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {TOP_CATEGORIES.map((category, index) => (
          <motion.button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all aspect-square group"
          >
            {/* Soft inner icon wrapper */}
            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg mb-3 border border-gray-100 group-hover:scale-105 transition-transform text-3xl">
              {category.icon}
            </div>
            
            <span className="text-xs font-semibold text-gray-700 tracking-wide text-center group-hover:text-emerald-700 transition-colors">
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}