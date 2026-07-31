import Link from "next/link";

type Props = {
 currentPage:
   | "orders"
   | "fulfillment"
   | "waitlist"
   | "inventory"
   | "settings";
};

function getLinkClasses(
 isActive:
   boolean
) {
 return isActive
   ? "rounded-full bg-[#26211D] px-5 py-2.5 text-sm font-semibold text-white"
   : "rounded-full border border-[#CFC3B7] bg-white px-5 py-2.5 text-sm font-semibold text-[#302A25] transition hover:bg-[#F2ECE6]";
}

export default function AdminNavigation({
 currentPage,
}: Props) {
 return (
   <nav
     aria-label="VidaPouch administration"
     className="flex flex-wrap gap-3">

     <Link
       href="/admin/orders"
       className={getLinkClasses(
         currentPage ===
           "orders"
       )}>

       Printable orders
     </Link>




     <Link
       href="/admin/fulfillment"
       className={getLinkClasses(
         currentPage ===
           "fulfillment"
       )}>

       Fulfillment board
     </Link>


     <Link
 href="/admin/waitlist"
 className={getLinkClasses(
   currentPage ===
     "waitlist"
 )}>

 Waitlist
</Link>



<Link
 href="/admin/inventory"
 className={getLinkClasses(
   currentPage ===
     "inventory"
 )}
>
 Inventory
</Link>






     <Link
 href="/admin/settings"
 className={getLinkClasses(
   currentPage ===
     "settings"
 )}>

 Settings
</Link>





     <form
       action="/api/admin/logout"
       method="post">

       <button
         type="submit"
         className="rounded-full border border-[#CFC3B7] bg-white px-5 py-2.5 text-sm font-semibold text-[#302A25] transition hover:bg-[#F2ECE6]">

         Sign out
       </button>
     </form>
   </nav>
 );
}
