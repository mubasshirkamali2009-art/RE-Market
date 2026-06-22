"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const CATEGORY_GROUPS = [
  {
    group: "Electronics & Tech",
    emoji: "🖥️",
    items: [
      { name: "Phones", icon: "📱" },
      { name: "Laptops", icon: "💻" },
      { name: "Tablets", icon: "📟" },
      { name: "Desktop Computers", icon: "🖥️" },
      { name: "TV & Monitors", icon: "📺" },
      { name: "Cameras", icon: "📷" },
      { name: "Audio & Headphones", icon: "🎧" },
      { name: "Gaming Consoles", icon: "🎮" },
      { name: "Smart Watches", icon: "⌚" },
      { name: "Printers & Scanners", icon: "🖨️" },
      { name: "Networking Devices", icon: "📡" },
      { name: "Computer Parts", icon: "🔌" },
    ],
  },
  {
    group: "Fashion",
    emoji: "👗",
    items: [
      { name: "Men's Clothing", icon: "👔" },
      { name: "Women's Clothing", icon: "👗" },
      { name: "Kids' Clothing", icon: "🧒" },
      { name: "Footwear", icon: "👟" },
      { name: "Bags & Luggage", icon: "👜" },
      { name: "Watches", icon: "🕐" },
      { name: "Jewelry", icon: "💍" },
      { name: "Accessories", icon: "🕶️" },
    ],
  },
  {
    group: "Home & Living",
    emoji: "🏠",
    items: [
      { name: "Furniture", icon: "🛋️" },
      { name: "Home Appliances", icon: "🏠" },
      { name: "Kitchen & Cookware", icon: "🍳" },
      { name: "Bedding & Curtains", icon: "🛏️" },
      { name: "Home Décor", icon: "🪴" },
      { name: "Tools & Hardware", icon: "🔧" },
      { name: "Air Conditioners & Fans", icon: "❄️" },
    ],
  },
  {
    group: "Vehicles",
    emoji: "🚗",
    items: [
      { name: "Cars", icon: "🚗" },
      { name: "Motorcycles", icon: "🏍️" },
      { name: "Bicycles", icon: "🚲" },
      { name: "Auto Parts & Accessories", icon: "⚙️" },
      { name: "CNG & Auto Rickshaws", icon: "🛺" },
    ],
  },
  {
    group: "Sports & Outdoors",
    emoji: "⚽",
    items: [
      { name: "Sports Equipment", icon: "⚽" },
      { name: "Fitness & Gym", icon: "🏋️" },
      { name: "Outdoor & Camping", icon: "⛺" },
    ],
  },
  {
    group: "Books, Hobbies & Kids",
    emoji: "📚",
    items: [
      { name: "Books & Magazines", icon: "📚" },
      { name: "Toys & Games", icon: "🧸" },
      { name: "Baby & Kids Items", icon: "🍼" },
      { name: "Musical Instruments", icon: "🎸" },
      { name: "Art & Craft Supplies", icon: "🎨" },
    ],
  },
  {
    group: "Other",
    emoji: "🛍️",
    items: [
      { name: "Health & Beauty", icon: "💊" },
      { name: "Pet Supplies", icon: "🐾" },
      { name: "Agriculture & Farm", icon: "🌾" },
      { name: "Office Supplies", icon: "📎" },
      { name: "Other", icon: "📦" },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function CategoriesSection() {
  const router = useRouter();

  function handleCategoryClick(categoryName) {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  }

  return (
    <section className="w-full py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-7">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">
          🛒 Browse
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Categories
          </span>
        </h2>
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.group}>
            {/* Group label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{group.emoji}</span>
              <h3 className="text-sm font-bold text-gray-700">{group.group}</h3>
              <div className="flex-1 h-px bg-gray-100 ml-1" />
            </div>

            {/* Items grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3"
            >
              {group.items.map((item) => (
                <motion.button
                  key={item.name}
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(item.name)}
                  className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-green-200 hover:bg-green-50 transition-all cursor-pointer group"
                >
                  <span className="text-2xl sm:text-3xl leading-none group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-600 group-hover:text-green-700 text-center leading-tight line-clamp-2">
                    {item.name}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}