"use client";

import { useState } from "react";

import SearchNavbar from "@/components/search/SearchNavbar";
import SearchLanding from "@/components/search/SearchLanding";
import SearchWorkspace from "@/components/search/SearchWorkspace";
import BottomBenefits from "@/components/search/BottomBenefits";
import FooterBar from "@/components/search/FooterBar";

export default function VitaPouchV2Page() {
 const [query, setQuery] = useState("");

 return (
   <main className="min-h-screen bg-white text-[#081620]">
     <SearchNavbar />

     <SearchLanding
       query={query}
       setQuery={setQuery}
     />

     <SearchWorkspace
       query={query}
     />

     <BottomBenefits />

     <FooterBar />
   </main>
 );
}
