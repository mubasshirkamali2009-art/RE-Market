"use client";

import { useState, useEffect } from "react";
import {
  allDivision,
  districtsOf,
  upazilaNamesOf,
} from "@bangladeshi/bangladesh-address/build/src/index.js";
// NOTE: this package's package.json "main" field points to a path that
// doesn't actually exist (./build/index.js instead of ./build/src/index.js),
// so the plain `from '@bangladeshi/bangladesh-address'` import will throw
// a module-not-found error. The deep import path above is the workaround
// until the package author fixes their package.json. Verified working
// with both CommonJS require() and ESM import in Node 22 / Next.js.

const DIVISIONS = allDivision(); // ['Barisal', 'Chattogram', 'Dhaka', ...]

/**
 * Cascading Division -> District -> Upazila selector.
 * Calls onChange({ division, district, upazila }) any time a piece changes,
 * and onChange(null-ish pieces reset) when an upstream selection changes
 * (e.g. picking a new division clears district + upazila, since the old
 * ones may not even belong to the new division).
 */
export function LocationSelect({ value, onChange, errors = {} }) {
  const [division, setDivision] = useState(value?.division || "");
  const [district, setDistrict] = useState(value?.district || "");
  const [upazila, setUpazila] = useState(value?.upazila || "");

  const districtOptions = division ? districtsOf(division) : [];
  const upazilaOptions = district ? upazilaNamesOf(district) : [];

  // push combined value up to the parent form any time a piece changes
  useEffect(() => {
    onChange({ division, district, upazila });
  }, [division, district, upazila]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDivisionChange(e) {
    setDivision(e.target.value);
    setDistrict("");
    setUpazila("");
  }

  function handleDistrictChange(e) {
    setDistrict(e.target.value);
    setUpazila("");
  }

  function handleUpazilaChange(e) {
    setUpazila(e.target.value);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#33402f]">
          Division
        </label>
        <select
          value={division}
          onChange={handleDivisionChange}
          className={selectClass(errors.division)}
        >
          <option value="">Select division</option>
          {DIVISIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {errors.division && (
          <p className="mt-1 text-xs text-[#c0392b]">{errors.division}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#33402f]">
          District
        </label>
        <select
          value={district}
          onChange={handleDistrictChange}
          disabled={!division}
          className={selectClass(errors.district)}
        >
          <option value="">
            {division ? "Select district" : "Select division first"}
          </option>
          {districtOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {errors.district && (
          <p className="mt-1 text-xs text-[#c0392b]">{errors.district}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#33402f]">
          Upazila / Area
        </label>
        <select
          value={upazila}
          onChange={handleUpazilaChange}
          disabled={!district}
          className={selectClass(errors.upazila)}
        >
          <option value="">
            {district ? "Select upazila" : "Select district first"}
          </option>
          {upazilaOptions.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        {errors.upazila && (
          <p className="mt-1 text-xs text-[#c0392b]">{errors.upazila}</p>
        )}
      </div>
    </div>
  );
}

function selectClass(hasError) {
  return `w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-[#1f2d22] outline-none transition-colors focus:border-[#2c6b4f] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
    hasError ? "border-[#e0a3a3]" : "border-[#d8e0cf]"
  }`;
}

/** Formats {division, district, upazila} into one display string,
 *  e.g. "Savar, Dhaka, Dhaka" — useful for showing on product cards. */
export function formatLocation(loc) {
  if (!loc) return "";
  const parts = [loc.upazila, loc.district, loc.division].filter(Boolean);
  return parts.join(", ");
}