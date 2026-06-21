"use client";

import { Magnifier, Xmark } from "@gravity-ui/icons";

/**
 * Reusable search input. Controlled — parent owns the value and filtering logic.
 * Drop this anywhere you need a search box matching the dashboard's visual style.
 */
export function ProductSearch({
  value,
  onChange,
  placeholder = "Search products...",
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <Magnifier className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa896]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-[#d8e0cf] bg-white py-2.5 pl-9 pr-9 text-sm text-[#1f2d22] outline-none transition-colors placeholder:text-[#9aa896] focus:border-[#2c6b4f]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-[#9aa896] transition-colors hover:bg-[#eef3e2] hover:text-[#2c6b4f]"
        >
          <Xmark className="size-3.5" />
        </button>
      )}
    </div>
  );
}