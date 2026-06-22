"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const SUCCESS_STORIES = [
  {
    company: "EcoConnect",
    story: "Built a community mapping app for local environmental projects.",
    impact: "600% user growth",
  },
  {
    company: "BioFlex Labs",
    story: "Developed a dynamic feedback loop for research data analysis.",
    impact: "40M+ data points processed",
  },
  {
    company: "Spectrum Dynamics",
    story: "Provided a standardized component framework to streamline design.",
    impact: "94% efficiency boost",
  },
  {
    company: "Alpha Trade",
    story: "Optimized peer-to-peer asset exchange architectures securely.",
    impact: "Over $2M processed",
  },
];

export default function StartupStoriesComponent() {
  const sliderRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Monitor screen width changes to dynamically swap between desktop grid layouts and mobile carousels
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobile(false);
      } else {
        setIsMobile(true);
        if (sliderRef.current) {
          const scrollWidth = sliderRef.current.scrollWidth;
          const offsetWidth = sliderRef.current.offsetWidth;
          setDragConstraints({ right: 0, left: -(scrollWidth - offsetWidth + 32) });
        }
      }
    };

    handleResize(); // Initialize size values
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 bg-white rounded-3xl shadow-sm overflow-hidden my-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Our Startup{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Success Stories
          </span>
        </h2>
        
        {isMobile && (
          <span className="text-xs font-semibold text-gray-400 select-none animate-pulse">
            Swipe to view more →
          </span>
        )}
      </div>

      {/* Viewport wrapper handles sliding on mobile and drops directly into grid on desktop profiles */}
      <div 
        ref={sliderRef} 
        className={`${isMobile ? "cursor-grab active:cursor-grabbing overflow-visible" : ""}`}
      >
        <motion.div
          drag={isMobile ? "x" : false}
          dragConstraints={isMobile ? dragConstraints : undefined}
          dragElastic={0.15}
          className={`flex gap-4 sm:gap-6 ${
            isMobile 
              ? "w-max pb-4 px-2" 
              : "grid grid-cols-2 lg:grid-cols-4 w-full"
          }`}
        >
          {SUCCESS_STORIES.map((story) => (
            <motion.div
              key={story.company}
              whileHover={{ y: -4 }}
              className={`${
                isMobile ? "w-[260px] sm:w-[310px]" : "w-full"
              } p-6 sm:p-7 rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/10 to-green-50/5 flex flex-col justify-between hover:border-emerald-100 hover:bg-white hover:shadow-md transition-all duration-300 select-none`}
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight mb-3 leading-snug">
                  {story.company}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mb-5 leading-relaxed font-medium">
                  {story.story}
                </p>
              </div>
              
              <div className="pt-3 border-t border-gray-50/60 mt-auto">
                <p className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Impact Metrics
                </p>
                <p className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
                  {story.impact}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}