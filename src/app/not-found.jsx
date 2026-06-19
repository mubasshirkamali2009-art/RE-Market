"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiHome, FiArrowLeft, FiShoppingBag, FiPackage, FiDollarSign } from "react-icons/fi";
import { PiTagSimpleBold } from "react-icons/pi";
import { BsRecycle } from "react-icons/bs";

// ReSell Hub — 404 page
// Treats the missing page like a secondhand listing that's already been
// sold: a swinging price tag, stamped "Sold Out", hanging on a string,
// with marketplace icons drifting quietly in the background.
//
// Requires: framer-motion, react-icons, tailwindcss
//   npm install framer-motion react-icons

function FloatingIcon({ children, className = "", duration = 5, delay = 0, distance = 10, reduceMotion }) {
  return (
    <motion.div
      className={`absolute hidden sm:flex items-center justify-center text-[#2B2B26]/10 ${className}`}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: 1,
              y: [0, -distance, 0],
              rotate: [0, 6, -6, 0],
            }
      }
      transition={
        reduceMotion
          ? { duration: 0.3 }
          : {
              opacity: { duration: 0.6, delay },
              y: { duration, repeat: Infinity, ease: "easeInOut", delay },
              rotate: { duration: duration * 1.4, repeat: Infinity, ease: "easeInOut", delay },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export default function NotFoundPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#EFE9DC] flex items-center justify-center px-6">
      {/* Google Fonts — move this into your global stylesheet/index.html in production */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Oswald:wght@500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {/* kraft-paper grain, fades in on load */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #2B2B26 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 1 }}
      />

      {/* soft glow behind the tag */}
      <motion.div
        className="absolute w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(62,92,58,0.10), transparent 70%)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.05, 0.95] }}
        transition={reduceMotion ? { duration: 0.6 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* decorative marketplace icons, hidden on small screens to keep mobile clean */}
      <FloatingIcon className="top-[14%] left-[8%] text-4xl" duration={6} delay={0.2} distance={12} reduceMotion={reduceMotion}>
        <FiShoppingBag />
      </FloatingIcon>
      <FloatingIcon className="top-[18%] right-[10%] text-3xl" duration={5} delay={0.6} distance={10} reduceMotion={reduceMotion}>
        <FiPackage />
      </FloatingIcon>
      <FloatingIcon className="bottom-[18%] left-[12%] text-3xl" duration={7} delay={0.4} distance={14} reduceMotion={reduceMotion}>
        <BsRecycle />
      </FloatingIcon>
      <FloatingIcon className="bottom-[22%] right-[14%] text-2xl" duration={5.5} delay={0.8} distance={9} reduceMotion={reduceMotion}>
        <FiDollarSign />
      </FloatingIcon>
      <FloatingIcon className="top-[42%] left-[4%] text-2xl" duration={6.5} delay={1} distance={8} reduceMotion={reduceMotion}>
        <PiTagSimpleBold />
      </FloatingIcon>

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm sm:max-w-md">
        {/* string holding the tag */}
        <svg width="2" height="48" className="mb-0">
          <line x1="1" y1="0" x2="1" y2="48" stroke="#A89E80" strokeWidth="2" strokeDasharray="1 3" />
        </svg>

        {/* the price tag */}
        <motion.div
          initial={reduceMotion ? false : { y: -100, rotate: -8, opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : {
                  y: 0,
                  opacity: 1,
                  rotate: [0, -4, 4, -3, 3, 0],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.3 }
              : {
                  y: { type: "spring", stiffness: 120, damping: 12, delay: 0.1 },
                  opacity: { duration: 0.4 },
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
                }
          }
          className="relative bg-[#F4EFE3] border border-[#C9BFA3] rounded-lg shadow-[0_8px_24px_rgba(43,43,38,0.15)] px-6 sm:px-7 py-7 sm:py-8 w-[85vw] max-w-[18rem] sm:w-72"
        >
          {/* punch hole */}
          <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#EFE9DC] border border-[#C9BFA3]" />

          <div
            className="flex items-center justify-center gap-2 text-[#8A8169] mb-3 text-[11px] tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <motion.span
              animate={reduceMotion ? {} : { rotate: [0, -10, 10, 0] }}
              transition={reduceMotion ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="inline-flex"
            >
              <PiTagSimpleBold className="text-base" aria-hidden="true" />
            </motion.span>
            <span>SKU 00000-404</span>
          </div>

          <div
            className="text-5xl sm:text-6xl leading-none mb-3 text-[#2B2B26]"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            404
          </div>

          <motion.div
            initial={reduceMotion ? false : { scale: 2.2, opacity: 0, rotate: -8 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: -6,
              boxShadow: reduceMotion
                ? "0 0 0 rgba(178,58,46,0)"
                : ["0 0 0 rgba(178,58,46,0)", "0 0 14px rgba(178,58,46,0.25)", "0 0 0 rgba(178,58,46,0)"],
            }}
            transition={{
              scale: { delay: reduceMotion ? 0 : 0.65, duration: 0.25, ease: "easeOut" },
              opacity: { delay: reduceMotion ? 0 : 0.65, duration: 0.25 },
              rotate: { delay: reduceMotion ? 0 : 0.65, duration: 0.25 },
              boxShadow: { duration: 2.5, repeat: Infinity, repeatDelay: 1.5, delay: 1.2 },
            }}
            className="inline-block border-2 border-[#B23A2E] text-[#B23A2E] px-3 py-1 text-xs font-semibold tracking-[0.15em] uppercase rounded-sm"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Sold Out
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.85, duration: 0.4 }}
            className="mt-4 text-sm text-[#5B5648]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            This listing isnt available anymore — someone may have already snagged it, or the links gone stale.
          </motion.p>
        </motion.div>

        {/* actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 1, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8 w-full sm:w-auto"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.history.back()}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-[#C9BFA3] text-[#2B2B26] text-sm font-medium bg-transparent hover:bg-[#E3DCC8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3E5C3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFE9DC] w-full sm:w-auto"
          >
            <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true" />
            Go back
          </motion.button>

          <motion.a
            href="/"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#3E5C3A] text-[#F4EFE3] text-sm font-medium hover:bg-[#34492F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3E5C3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFE9DC] w-full sm:w-auto"
          >
            <FiHome className="transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden="true" />
            HOME
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}