"use client";

import { motion } from "framer-motion";

const IMPACT_STATS = [
  {
    id: 1,
    label: "Waste reduced",
    value: "1,250 KG",
    icon: "🌱",
    gradient: "from-emerald-400/20 via-emerald-400/5 to-white",
  },
  {
    id: 2,
    label: "Products reused",
    value: "3,500+",
    icon: "♻️",
    gradient: "from-green-400/20 via-green-400/5 to-white",
  },
  {
    id: 3,
    label: "CO₂ emissions saved",
    value: "820 KG",
    icon: "🌍",
    gradient: "from-teal-400/20 via-teal-400/5 to-white",
  },
  {
    id: 4,
    label: "Sustainable purchases",
    value: "2,100+",
    icon: "🛍️",
    gradient: "from-emerald-500/20 via-emerald-400/5 to-white",
  },
];

const TIMELINE_STEPS = [
  { label: "Product reused", icon: "♻️" },
  { label: "Waste reduced", icon: "🗑️" },
  { label: "Carbon saved", icon: "☁️" },
  { label: "A better future", icon: "🌱" },
];

const COMPARISON_CARDS = [
  {
    title: "Buying one used laptop saves enough energy to power a home for days.",
    highlight: "enough energy to power a home for days.",
    icon: "💻",
  },
  {
    title: "Reusing furniture prevents landfill waste.",
    highlight: "prevents landfill waste.",
    icon: "🛋️",
  },
  {
    title: "Every reused product extends product life cycle.",
    highlight: "extends product life cycle.",
    icon: "🔄",
  },
];

export default function SustainabilityImpact() {
  return (
    <div className="w-full bg-gradient-to-br from-[#EBF5EE] via-[#F3FAF6] to-[#E5F2E9] py-12 px-4 sm:px-6 md:px-12 relative overflow-hidden font-sans min-h-screen flex items-center justify-center">
      
      {/* Background Graphic Blobs & Abstract UI Presentation Accents */}
      <div className="absolute top-10 left-1/4 w-4 h-4 bg-emerald-400/40 rounded-full" />
      <div className="absolute top-40 left-12 w-8 h-8 bg-emerald-500/10 rounded-full blur-sm" />
      <div className="absolute top-1/4 right-[28%] w-32 h-10 bg-emerald-400/10 rounded-full -rotate-45" />
      <div className="absolute top-6 right-[12%] w-16 h-16 bg-[#2C6B4F]/5 rounded-full" />
      
      {/* Floating Canvas UI Element Badges */}
      <div className="absolute top-12 right-1/4 bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm border border-white text-xl hidden lg:block">🌱</div>
      <div className="absolute top-44 right-[10%] bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm border border-white text-xl hidden lg:block">♻️</div>
      <div className="absolute top-[28%] right-[8%] bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm border border-white text-base hidden lg:block">⚙️</div>

      {/* Main Presentation White Inner Panel Shell */}
      <section className="w-full max-w-7xl bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[40px] shadow-xl p-6 sm:p-10 md:p-12 relative z-10">
        
        {/* Brand & Main Centered Hero Heading */}
        <div className="relative mb-12">
          <div className="absolute top-0 left-0 font-extrabold text-xl text-[#2C6B4F] tracking-tight select-none">
            ReSell Hub
          </div>
          <div className="text-center pt-8 md:pt-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#13231B] tracking-tight mb-3">
              Sustainability Impact
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
              See how every second-hand purchase helps reduce waste and protect our planet.
            </p>
          </div>
        </div>

        {/* Core Layout Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Left Column Content Zone: 2x2 Clean Minimal Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-4 w-full">
            {IMPACT_STATS.map((stat) => (
              <div
                key={stat.id}
                className={`p-5 rounded-2xl border border-white bg-gradient-to-br ${stat.gradient} bg-white shadow-sm flex flex-col justify-between h-[135px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg border border-emerald-50/50">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 capitalize tracking-tight">
                    {stat.label}
                  </p>
                  <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                    {stat.value}
                  </h3>
                  <span className="text-[8px] text-gray-300 block font-medium mt-0.5"></span>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column Content Zone: Interactive Earth Vector Graphic Scene */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-4 w-full select-none relative">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              
              {/* Spinning Circular Arrow Ring Track Backdrops */}
              <div className="absolute inset-0 border-2 border-dashed border-emerald-400/20 rounded-full animate-spin" style={{ animationDuration: '40s' }} />
              <div className="absolute inset-6 border border-dotted border-green-500/10 rounded-full animate-spin" style={{ animationDuration: '25s' }} />

              {/* Central Eco Globe Centerpiece Illustration */}
              <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-300 to-sky-300 shadow-inner flex items-center justify-center text-6xl relative z-10 border border-white/60">
                🌍
                {/* Embedded Loop Overlay Layer */}
                <div className="absolute inset-0 bg-emerald-600/5 rounded-full mix-blend-overlay" />
              </div>

              {/* Absolute Vector Item Placements Surrounding Central Earth Graphic */}
              <div className="absolute top-2 left-1/3 text-3xl drop-shadow-sm z-20 hover:scale-110 transition-transform">💻</div>
              <div className="absolute top-16 left-2 text-3xl drop-shadow-sm z-20 hover:scale-110 transition-transform">📱</div>
              <div className="absolute bottom-16 right-2 text-4xl drop-shadow-sm z-20 hover:scale-110 transition-transform">🛋️</div>
              <div className="absolute top-12 right-4 text-3xl drop-shadow-sm z-20 hover:scale-110 transition-transform">🚲</div>
              <div className="absolute bottom-2 left-1/3 text-3xl drop-shadow-sm z-20 hover:scale-110 transition-transform">📚</div>
              <div className="absolute bottom-16 left-0 text-3xl drop-shadow-sm z-20 hover:scale-110 transition-transform">👕</div>

              {/* Surrounding Leaf Cluster Vector Accents */}
              <div className="absolute top-6 left-14 text-lg opacity-40">🍃</div>
              <div className="absolute bottom-8 right-16 text-lg opacity-40">🌿</div>
              <div className="absolute top-1/2 -right-2 text-lg opacity-40">🌱</div>
              <div className="absolute -top-2 right-1/4 text-lg opacity-40">🍀</div>
            </div>
          </div>

          {/* Right Column Content Zone: Flow Chart Visual Connection Module */}
          <div className="lg:col-span-4 bg-transparent border border-white/40 rounded-3xl p-6 flex flex-col justify-between h-auto lg:h-[288px] w-full relative">
            <div className="mb-8 lg:mb-0">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Impact</h3>
              <p className="text-xs font-semibold text-gray-400 mt-1 leading-normal">
                Beautiful infographic timeline connected with modern arrows.
              </p>
            </div>

            {/* Linear Workflow Pathway Track Rendering Block */}
            <div className="flex items-center justify-between relative w-full pt-4 pb-2 px-1">
              {TIMELINE_STEPS.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative flex-1">
                  
                  {/* Step Graphical Vector Bullet Node */}
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-emerald-50 flex items-center justify-center text-sm relative z-10 transition-transform hover:scale-105">
                    {step.icon}
                  </div>
                  
                  {/* Step Segment Header Label */}
                  <p className="text-[9px] sm:text-[11px] font-bold text-gray-700 tracking-tight mt-2.5 leading-tight max-w-[56px] mx-auto">
                    {step.label}
                  </p>

                  {/* Connected Arrow Graphic Separator Segment links */}
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className="absolute left-[calc(50%+16px)] top-4.5 w-[calc(100%-32px)] h-0.5 flex items-center justify-center z-0 select-none pointer-events-none opacity-40 text-emerald-600 text-xs font-bold">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Panel Block Row Layer: Impact Comparisons Blocks */}
        <div className="pt-6 border-t border-gray-100/50">
          <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">
            Impact comparison
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COMPARISON_CARDS.map((card, index) => {
              // Parse out the sentence structures to match design styling variations cleanly
              const baseText = card.title.replace(card.highlight, "");
              
              return (
                <div
                  key={index}
                  className="p-5 sm:p-6 rounded-2xl border border-white bg-white/40 shadow-sm flex flex-col justify-between hover:bg-white/80 hover:shadow-md transition-all duration-300 min-h-[125px]"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50/50 border border-emerald-100/40 flex items-center justify-center text-base mb-4 shrink-0 select-none">
                    {card.icon}
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm font-semibold leading-relaxed tracking-tight">
                    {baseText}
                    <span className="text-gray-900 font-black block md:inline">{card.highlight}</span>
                  </p>
                  <span className="text-[8px] text-gray-300 block font-medium mt-2"></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Horizontal Highlight Accent Status Badge List Row */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center lg:justify-start items-center mt-10 pt-4 border-t border-gray-100/30 text-gray-400 font-bold text-[11px] uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✓</span> Impact comparison</div>
          <div className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✓</span> Eco-friendly infographic</div>
          <div className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✓</span> Premium dashboard aesthetics</div>
        </div>

      </section>
    </div>
  );
}