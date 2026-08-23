"use client";

import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import FoundingMember from "@/components/home/FoundingMember";

import ProductOverview from "@/components/home/ProductOverview";
import WhyVidaPouch from "@/components/home/WhyVidaPouch";
import Footer from "@/components/home/Footer";


export default function Home() {
 return (
   <main className="min-h-screen bg-[#F3E9DD] text-[#0E171B]">
     <Navbar />
     <Hero />
     <FoundingMember />
     <ProductOverview />
     <WhyVidaPouch />
     <Footer />
   </main>
 );
}