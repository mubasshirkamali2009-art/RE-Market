"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

export default function ReMarketFooter() {
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Sell an Item", href: "/sell" },
  ];

  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Safety Tips", href: "/safety" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ];
const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "Twitter", href: "https://twitter.com", icon: FaTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
];

  return (
    <footer className="bg-[#0F1F17] dark:bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* Main grid: 1 col on mobile, 2 on sm, 4 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
          {/* Brand Information */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <span className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-900 shadow-md shadow-emerald-900/30 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
                <ShoppingBag size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={2.5} />
              </span>
              <span
                className="text-lg sm:text-xl font-bold tracking-tight text-white"
                style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
              >
                Re
                <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                  Market
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
              The trusted marketplace for buying and selling pre-owned goods.
              List what you dont need, find what you do — safely and easily.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors duration-200"
                  >
                    <Icon size={16} strokeWidth={2} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Support
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>123 Market Street, Dhaka 1207, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <a href="tel:+8801234567890" className="hover:text-emerald-400 transition-colors duration-200">
                  +880 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail size={16} className="text-emerald-500 shrink-0" />
                <a
                  href="mailto:support@remarket.com"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  support@remarket.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 sm:mt-12 lg:mt-14 border-t border-white/10" />

        {/* Copyright section */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-slate-500">
            © {year} ReMarket. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/terms"
              className="text-xs sm:text-sm text-slate-500 hover:text-emerald-400 transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs sm:text-sm text-slate-500 hover:text-emerald-400 transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-xs sm:text-sm text-slate-500 hover:text-emerald-400 transition-colors duration-200"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}