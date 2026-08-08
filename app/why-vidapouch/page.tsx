import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import WhyVidaPouch from "./components/WhyVidaPouch";

export default function WhyVidaPouchPage() {
 return (
   <main className="min-h-screen bg-[#F3E9DD] text-[#0E171B]">
     <Navbar />
     <WhyVidaPouch />
     <Footer />
   </main>
 );
}