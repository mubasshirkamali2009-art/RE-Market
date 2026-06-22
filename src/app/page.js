import HeroSection from "@/components/HeroSection";
import LatestProducts from "@/components/LatestProducts";
import PopularCategories from "@/components/PopularCatgory";
import Image from "next/image";

export default function Home() {
  return (
    <div>

       <HeroSection></HeroSection>

       <LatestProducts></LatestProducts>
       {/* <PopularCategories></PopularCategories> */}
    </div>
  );
}
