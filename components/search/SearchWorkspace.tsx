"use client";

import SearchHeader from "./SearchHeader";
import TrustBar from "./TrustBar";
import FilterSidebar from "./FilterSidebar";
import SearchResults from "./SearchResults";
import PouchSidebar from "./PouchSidebar";

type SearchWorkspaceProps = {
 query: string;
};

export default function SearchWorkspace({
 query,
}: SearchWorkspaceProps) {
 return (
   <section className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">

     <div className="mt-6">
       <TrustBar />
     </div>

     <div className="mt-6 grid grid-cols-12 gap-6 items-start">
       <aside className="col-span-3">
         <FilterSidebar />
       </aside>

       <section className="col-span-6">
         <SearchResults query={query} />
       </section>

       <aside className="col-span-3">
         <PouchSidebar />
       </aside>
     </div>
   </section>
 );
}
