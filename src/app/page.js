import HeroSection from "@/components/HeroSection";
import LatestProducts from "@/components/LatestProducts";
import CategoriesComponent from "@/components/PopularCatgory";

import Image from "next/image";

export default function Home() {
  return (
    <div>

       <HeroSection></HeroSection>

       <LatestProducts></LatestProducts>
        <CategoriesComponent></CategoriesComponent>
    </div>
  );
}
