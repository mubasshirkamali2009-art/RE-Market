"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[80vh] flex items-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/hero.png')", // Updated to use your local public image
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#f6f2e8]/10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold text-black leading-tight"
          >
            Buy Smart.
            <br />
            Sell Easy.
            <br />
            Make An Impact.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-lg text-gray-700"
          >
            Join ReSell Hub and give your unused items a new home.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/products">
              <motion.button
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0 10px 25px rgba(22,163,74,.35)",
                }}
                whileTap={{ scale: 0.95 }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                  },
                }}
                className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Explore Products
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{
                  scale: 1.08,
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-white px-6 py-3 rounded-lg font-semibold border border-gray-300"
              >
                My Analytics
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}