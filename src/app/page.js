import HeroSection from "@/components/HeroSection";
import LatestProducts from "@/components/LatestProducts";
import MarketplaceStats from "@/components/MarketplaceStatistics";
import CategoriesComponent from "@/components/PopularCatgory";
import StartupStoriesComponent from "@/components/SuccesStoriesSectionHome";
import SustainabilityImpact from "@/components/SustainabilityImpact";
import WhyShopWithUs from "@/components/WhyShopWithUs";

import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF8F0] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="bg-[#FAF8F0] dark:bg-slate-900">
        <HeroSection />
      </div>

      {/* Latest Products Section */}
      <div className="bg-white dark:bg-slate-950 py-12 transition-colors duration-300">
        <LatestProducts />
      </div>

      {/* Popular Categories */}
      <div className="bg-[#FAF8F0] dark:bg-slate-900 py-12 transition-colors duration-300">
        <CategoriesComponent />
      </div>

      {/* Startup Success Stories */}
      <div className="bg-white dark:bg-slate-950 py-12 transition-colors duration-300">
        <StartupStoriesComponent />
      </div>

      {/* Marketplace Statistics */}
      <div className="bg-[#FAF8F0] dark:bg-slate-900 py-12 transition-colors duration-300">
        <MarketplaceStats />
      </div>

      {/* Sustainability Impact Infographics */}
      <div className="bg-white dark:bg-slate-950 py-12 transition-colors duration-300">
        <SustainabilityImpact />
      </div>

      {/* Why Shop With Us */}
      <div className="bg-[#FAF8F0] dark:bg-slate-900 py-12 pb-20 transition-colors duration-300">
        <WhyShopWithUs />
      </div>

    </div>
  );
}