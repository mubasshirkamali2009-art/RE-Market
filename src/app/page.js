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
    <div>

       <HeroSection></HeroSection>

       <LatestProducts></LatestProducts>
        <CategoriesComponent></CategoriesComponent>
        <StartupStoriesComponent></StartupStoriesComponent>
        <MarketplaceStats></MarketplaceStats>
        <SustainabilityImpact></SustainabilityImpact>
        <WhyShopWithUs></WhyShopWithUs>
    </div>
  );
}
