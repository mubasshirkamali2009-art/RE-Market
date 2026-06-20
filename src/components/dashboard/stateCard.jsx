"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "@gravity-ui/icons";

const toneStyles = {
  default: "bg-[#eef3e2] text-[#1f4d3c]",
  success: "bg-[#dcf2e3] text-[#1f8a4c]",
  warning: "bg-[#fdf0d8] text-[#b8790a]",
  danger: "bg-[#fbeaea] text-[#c0392b]",
};

const actionToneStyles = {
  default: "text-[#2c6b4f] hover:text-[#1f4d3c]",
  success: "text-[#1f8a4c] hover:text-[#176638]",
  warning: "text-[#b8790a] hover:text-[#8f5e08]",
  danger: "text-[#c0392b] hover:text-[#9c2e23]",
};

const glowStyles = {
  default: "rgba(44, 107, 79, 0.35)",
  success: "rgba(31, 138, 76, 0.35)",
  warning: "rgba(184, 121, 10, 0.3)",
  danger: "rgba(192, 57, 43, 0.3)",
};

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.9, rotateX: -8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.65,
      type: "spring",
      stiffness: 170,
      damping: 15,
    },
  }),
};

/**
 * Single stat card.
 *
 * @param {object} props
 * @param {React.ComponentType} props.icon - Gravity UI icon component
 * @param {string} props.label - e.g. "Total Products"
 * @param {string|number} props.value - e.g. 42 or "$4,450"
 * @param {string} props.actionLabel - e.g. "View all"
 * @param {string} props.href - link target for the action
 * @param {"default"|"success"|"warning"|"danger"} props.tone - accent tone for icon + action
 * @param {number} props.index - position in grid, drives stagger delay
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  actionLabel,
  href = "#",
  tone = "default",
  index = 0,
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      style={{ perspective: 800 }}
      whileHover={{
        y: -10,
        scale: 1.035,
        rotateX: 3,
        rotateY: -2,
        boxShadow: `0 28px 48px -16px ${glowStyles[tone]}, 0 8px 16px -8px rgba(31, 77, 60, 0.18)`,
        transition: { duration: 0.35, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.96 }}
      className="group relative overflow-hidden rounded-[20px] border border-[#e4e9dc] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(44,107,79,0.18)]"
    >
      {/* layered ambient glow, sits behind content */}
      <motion.div
        className={`absolute -right-8 -top-8 size-32 rounded-full ${toneStyles[tone]} opacity-50 blur-xl`}
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`absolute -bottom-10 -left-6 size-24 rounded-full ${toneStyles[tone]} opacity-30 blur-lg`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* sheen sweep on hover */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        initial={false}
        whileHover={{ translateX: "200%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      <div className="relative flex items-center justify-between">
        <p className="text-sm font-medium text-[#6b7a6d]">{label}</p>
        {Icon && (
          <motion.span
            initial={{ rotate: -120, opacity: 0, scale: 0.4 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.12 + 0.25, duration: 0.55, type: "spring", stiffness: 200 }}
            whileHover={{ rotate: 14, scale: 1.15 }}
            className={`flex size-9 items-center justify-center rounded-xl ${toneStyles[tone]} shadow-[0_4px_12px_-4px_rgba(44,107,79,0.4)]`}
          >
            <Icon className="size-4.5" />
          </motion.span>
        )}
      </div>

      <motion.p
        key={value}
        initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ delay: index * 0.12 + 0.35, duration: 0.5 }}
        className="relative mt-3 text-3xl font-bold tracking-tight text-[#1f2d22]"
      >
        {value}
      </motion.p>

      {actionLabel && (
        <Link
          href={href}
          className={`relative mt-3 inline-flex items-center gap-1 text-sm font-semibold transition-colors ${actionToneStyles[tone]}`}
        >
          <motion.span className="inline-flex items-center gap-1" whileHover="hover">
            {actionLabel}
            <motion.span
              variants={{ hover: { x: 5 } }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronRight className="size-3.5" />
            </motion.span>
          </motion.span>
        </Link>
      )}

      {/* bottom accent bar grows in on load */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.12 + 0.5, duration: 0.5, ease: "easeOut" }}
        style={{ originX: 0 }}
        className={`absolute bottom-0 left-0 h-1 w-full ${toneStyles[tone]}`}
      />
    </motion.div>
  );
}

/**
 * Grid of stat cards, fed by a data array.
 *
 * @param {object} props
 * @param {Array<{icon: React.ComponentType, label: string, value: string|number, actionLabel?: string, href?: string, tone?: string}>} props.stats
 */
export function StatsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} index={i} />
      ))}
    </div>
  );
}