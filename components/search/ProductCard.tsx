"use client";

import {
 useState,
} from "react";




import type {
 SearchProductOption,
 SearchProductUnitLabel,
} from "@/lib/search/searchProductOption";


import type {
  SearchPouchItem,
 } from "./types/searchPouch";




 type ProductCardProps = {
  product:
    SearchProductOption;
 
  isInPouch:
    boolean;
 
  onAddToPouch: (
    item:
      SearchPouchItem
  ) => void;
 };




type VendorLinkResponse = {
  url?: string;
  
  error?: string;
  
  matchType?: string;
  
  retailer?: string;
  
  productTitle?: string;
  
  merchantProductTitle?: string;
  
  originalBottlePrice?:
    number | null;
  
  liveBottlePrice?:
    number | null;
  
  priceChanged?: boolean;
  
  priceDifferenceAmount?:
    number | null;
  
  priceDifferencePercentage?:
    number | null;
  };






function formatCurrency(
 value: number
) {
 return `$${value.toFixed(2)}`;
}

function clampScore(
 value: number
) {
 return Math.max(
   0,
   Math.min(
     100,
     Math.round(value)
   )
 );
}

function formatReviewCount(
 value: number
) {
 return new Intl.NumberFormat(
   "en-US"
 ).format(value);
}

function getPluralUnitLabel(
 unitLabel:
   SearchProductUnitLabel,

 count: number
) {
 if (count === 1) {
   return unitLabel;
 }

 switch (unitLabel) {
   case "capsule":
     return "capsules";

   case "tablet":
     return "tablets";

   case "caplet":
     return "caplets";

   case "softgel":
     return "softgels";

   case "gummy":
     return "gummies";

   case "serving":
     return "servings";

   case "unit":
   default:
     return "units";
 }
}

function RatingStars({
 rating,
}: {
 rating: number;
}) {
 const normalizedRating =
   Math.max(
     0,
     Math.min(
       5,
       rating
     )
   );

 const filledWidth =
   `${(
     normalizedRating / 5
   ) * 100}%`;

 return (
   <span
     className="
       relative
       inline-block
       whitespace-nowrap
       text-[13px]
       leading-none
     "
     aria-label={`${normalizedRating.toFixed(
       1
     )} out of 5 stars`}>

     <span
       className="
         tracking-[1px]
         text-[#D8D1C8]
       "
       aria-hidden="true">

       ★★★★★
     </span>

     <span
       className="
         absolute
         inset-y-0
         left-0
         overflow-hidden
         whitespace-nowrap
         tracking-[1px]
         text-[#A46E24]
       "
       style={{
         width:
           filledWidth,
       }}
       aria-hidden="true">

       ★★★★★
     </span>
   </span>
 );
}


export default function ProductCard({
  product,
  isInPouch,
  onAddToPouch,
 }: ProductCardProps) {




 const [
   isFindingVendorLink,
   setIsFindingVendorLink,
 ] = useState(false);




 const [
   vendorLinkError,
   setVendorLinkError,
 ] = useState("");


 const [
  resolvedBottlePrice,
  setResolvedBottlePrice,
 ] = useState<
  number | null
 >(null);
 
 {/* const [
  vendorPriceNotice,
  setVendorPriceNotice,
 ] = useState(""); */}
 




 const representative =
   product.representativeProduct;




   const bottleUnitCount =
   representative
     .capsulesPerBottle;
  
  const displayedBottlePrice =
   resolvedBottlePrice ??
   representative.bottlePrice;
  
  const bottlePricePerUnit =
   bottleUnitCount > 0
     ? displayedBottlePrice /
       bottleUnitCount
     : null;





/*
 * The Daily Dose filter places the actual
 * required number of physical units per
 * day on the product.
 */
const pouchUnitsPerDay =
  product.unitsPerDay ??
  1;

const pouchUnitCount =
  pouchUnitsPerDay *
  30;





 const pouchPricePerUnit =
   pouchUnitCount > 0
     ? product
         .displayedMonthlyCost /
       pouchUnitCount
     : null;

 const unitLabel =
   product.unitLabel;

 const pluralUnitLabel =
   getPluralUnitLabel(
     unitLabel,
     bottleUnitCount
   );

 const pouchPluralUnitLabel =
   getPluralUnitLabel(
     unitLabel,
     pouchUnitCount
   );

 const vidaPouchScore =
   product.score.overall !==
   null
     ? clampScore(
         product.score.overall
       )
     : null;

 const retailerRating =
   representative.rating;

 const retailerReviewCount =
   representative.reviewCount;

 const hasRetailerRating =
   typeof retailerRating ===
     "number" &&
   retailerRating > 0;






   const productClaims =
   Array.from(
     new Set([
       ...product.certifications,
 
       ...product.qualityClaims,
 
       product.verifiedClaims
         .nsfCertified
         ? "NSF Certified"
         : null,
 
       product.verifiedClaims
         .uspVerified
         ? "USP Verified"
         : null,
 
       product.verifiedClaims
         .thirdPartyTested
         ? "Third-Party Tested"
         : null,
 
       product.verifiedClaims
         .vegan
         ? "Vegan"
         : null,
 
       product.verifiedClaims
         .nonGmo
         ? "Non-GMO"
         : null,
 
       product.verifiedClaims
         .glutenFree
         ? "Gluten-Free"
         : null,
     ])
   ).filter(
     (
       claim
     ): claim is string =>
       typeof claim ===
         "string" &&
       claim.trim().length >
         0
   );






 const dosageLabel =
   product.dosage ||
   "Not specified";

 const formLabel =
   product.form ||
   "Not specified";

 const dosageBasisLabel =
   product.dosageIsPerServing ===
   true
     ? "Per serving"
     : product
           .dosageIsPerServing ===
         false
       ? `Per ${unitLabel}`
       : null;


 const canAddToVitaPouch =
   product.vitaPouchFormEligible;


const pouchItemId =
  representative
    .shoppingProductId ??
  `${product.brand}-${product.productName}`;

function handleAddToPouch() {
  if (
    !canAddToVitaPouch ||
    isInPouch
  ) {
    return;
  }

  onAddToPouch({
    id:
      pouchItemId,

    shoppingProductId:
      representative
        .shoppingProductId ??
      null,

    productName:
      product.productName,

    brand:
      product.brand,

    dosage:
      product.dosage,

    form:
      product.form,

    unitLabel:
      product.unitLabel,

    unitsPerDay:
      pouchUnitsPerDay,

    monthlyUnitCount:
      pouchUnitCount,

    monthlyPrice:
      product
        .displayedMonthlyCost,

    bottlePrice:
      representative
        .bottlePrice,

    retailer:
      representative
        .retailer,

    imageUrl:
      representative
        .imageUrl ??
      null,

    vitaPouchScore:
      vidaPouchScore,

    certifications:
      product.certifications,

    qualityClaims:
      product.qualityClaims,

    /*
     * Morning is the initial default.
     * Timing can become editable inside
     * My Pouch afterward.
     */
    timing:
      "morning",
  });
}




   async function handleBuyBottle() {
    if (
      isFindingVendorLink
    ) {
      return;
    }
   
    const immersiveProductPageToken =
      representative
        .immersiveProductPageToken;
   
    if (
      !immersiveProductPageToken
    ) {
      setVendorLinkError(
        "The exact Google Shopping product token is missing for this listing."
      );
   
      return;
    }
   
    setVendorLinkError("");
    {/* setVendorPriceNotice(""); */}
    setIsFindingVendorLink(
      true
    );
   
    /*
     * Open the tab during the original click
     * so Safari does not block it after the
     * asynchronous product lookup.
     */
    const vendorWindow =
      window.open(
        "",
        "_blank"
      );
   
    if (vendorWindow) {
      vendorWindow.document.title =
        `Opening ${representative.retailer}…`;
   
      vendorWindow.document.body.innerHTML =
        `
          <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            color: #17252c;
            background: #faf8f6;
            text-align: center;
          ">
            Confirming the exact
            ${representative.retailer}
            product and current price…
          </div>
        `;
    }
   
    try {
      const response =
        await fetch(
          "/api/search/vendor-link",
          {
            method: "POST",
   
            headers: {
              "Content-Type":
                "application/json",
            },
   
            body:
              JSON.stringify({
                retailer:
                  representative
                    .retailer,
   
                productTitle:
                  product
                    .productName,
   
                bottlePrice:
                  representative
                    .bottlePrice,
   
                shoppingProductId:
                  representative
                    .shoppingProductId,
   
                immersiveProductPageToken:
                  representative
                    .immersiveProductPageToken,
   
                serpApiImmersiveProductUrl:
                  representative
                    .serpApiImmersiveProductUrl,
              }),
          }
        );
   
      let data:
        VendorLinkResponse;
   
      try {
        data =
          (await response.json()) as
            VendorLinkResponse;
      } catch {
        throw new Error(
          "The vendor-link service returned an invalid response."
        );
      }
   
      if (
        !response.ok ||
        !data.url
      ) {
        throw new Error(
          data.error ||
            `The exact ${representative.retailer} offer could not be found.`
        );
      }
   
      const liveBottlePrice =
        typeof data.liveBottlePrice ===
          "number" &&
        Number.isFinite(
          data.liveBottlePrice
        ) &&
        data.liveBottlePrice > 0
          ? data.liveBottlePrice
          : null;
   
      if (
        liveBottlePrice !== null
      ) {
        setResolvedBottlePrice(
          liveBottlePrice
        );
      }
   


   {/*}   
      if (
        data.priceChanged &&
        liveBottlePrice !== null
      ) {
        setVendorPriceNotice(
          `Current ${representative.retailer} price: ${formatCurrency(
            liveBottlePrice
          )}. The original Google Shopping price was ${formatCurrency(
            representative
              .bottlePrice
          )}.`
        );
      } else if (
        liveBottlePrice !== null
      ) {
        setVendorPriceNotice(
          `Current price confirmed at ${formatCurrency(
            liveBottlePrice
          )}.`
        );
      }  */}
   
      if (vendorWindow) {
        vendorWindow.opener =
          null;
   
        vendorWindow.location.href =
          data.url;
      } else {
        window.location.href =
          data.url;
      }
    } catch (
      error
    ) {
      if (
        vendorWindow &&
        !vendorWindow.closed
      ) {
        vendorWindow.close();
      }
   
      const message =
        error instanceof Error
          ? error.message
          : "The exact vendor offer could not be found.";
   
      console.error(
        "VitaSearch Buy Bottle failed:",
        {
          retailer:
            representative
              .retailer,
   
          productTitle:
            product
              .productName,
   
          shoppingProductId:
            representative
              .shoppingProductId ??
            null,
   
          hasImmersiveProductPageToken:
            Boolean(
              representative
                .immersiveProductPageToken
            ),
   
          error:
            message,
        }
      );
   
      setVendorLinkError(
        message
      );
    } finally {
      setIsFindingVendorLink(
        false
      );
    }
   }
   






 return (
   <article
     className="
       grid
       w-full
       min-w-0
       grid-cols-1
       overflow-hidden
       border-b
       border-[#EEE7DF]
       bg-white
       last:border-b-0
       lg:grid-cols-[minmax(0,1.65fr)_minmax(155px,0.68fr)_minmax(175px,0.77fr)]
     ">

     {/* Product and score */}

     <div
       className="
         flex
         min-w-0
         gap-4
         border-b
         border-[#EEE7DF]
         px-4
         py-5
         lg:border-b-0
       ">

       {/* Product image */}

       <div
         className="
           flex
           w-[88px]
           flex-none
           items-start
           justify-center
         ">

         {representative.imageUrl ? (
           <div
             className="
               flex
               h-[122px]
               w-[82px]
               items-center
               justify-center
               overflow-hidden
               bg-white
               p-1
             ">

             <img
               src={
                 representative.imageUrl
               }
               alt={`${product.productName} product`}
               className="
                 h-full
                 w-full
                 object-contain
               "
               loading="lazy"
               referrerPolicy="no-referrer"
             />
           </div>
         ) : (
           <div
             className="
               flex
               h-[122px]
               w-[82px]
               items-center
               justify-center
               rounded-[10px]
               border
               border-[#E4DDD5]
               bg-[#F8F5F1]
               px-2
               text-center
               text-[10px]
               font-semibold
               text-[#8C1D40]
             ">

             {product.brand}
           </div>
         )}
       </div>

       {/* Product details */}

       <div className="min-w-0 flex-1">
         <h3
           className="
             text-[15px]
             font-semibold
             leading-[1.3]
             text-[#081620]
           ">

           {product.productName}
         </h3>

         <div
           className="
             mt-1.5
             flex
             min-w-0
             flex-wrap
             items-center
             gap-x-2
             gap-y-1.5
           ">

           <span
             className="
               text-[12px]
               leading-5
               text-[#30383B]
             ">

             {product.brand}
           </span>

           {product.recommended && (
             <span
               className="
                 whitespace-nowrap
                 rounded-md
                 bg-[#EEF0E8]
                 px-2
                 py-1
                 text-[8px]
                 font-bold
                 uppercase
                 tracking-[0.035em]
                 text-[#46514B]
               ">

               Best Overall
             </span>
           )}
         </div>

         {/* Dosage and form */}

         <div
           className="
             mt-3
             grid
             max-w-[300px]
             grid-cols-2
             gap-2
           ">

           <div
             className="
               rounded-[8px]
               border
               border-[#E8E0D8]
               bg-[#FBF9F7]
               px-3
               py-2
             ">

             <p
               className="
                 text-[9px]
                 font-semibold
                 uppercase
                 tracking-[0.06em]
                 text-[#727B7E]
               ">

               Dosage
             </p>

             <p
               className="
                 mt-1
                 text-[14px]
                 font-semibold
                 text-[#17252C]
               ">

               {dosageLabel}
             </p>

             {dosageBasisLabel && (
               <p
                 className="
                   mt-0.5
                   text-[9px]
                   text-[#697276]
                 ">

                 {dosageBasisLabel}
               </p>
             )}
           </div>

           <div
             className="
               rounded-[8px]
               border
               border-[#E8E0D8]
               bg-[#FBF9F7]
               px-3
               py-2
             ">

             <p
               className="
                 text-[9px]
                 font-semibold
                 uppercase
                 tracking-[0.06em]
                 text-[#727B7E]
               ">

               Form
             </p>

             <p
               className="
                 mt-1
                 text-[14px]
                 font-semibold
                 text-[#17252C]
               ">

               {formLabel}
             </p>
           </div>
         </div>

         {/* VitaPouch score */}

         <div
           className="
             mt-3
             flex
             min-w-0
             items-center
             gap-3
           ">

           <div
             className="
               flex
               h-[48px]
               w-[48px]
               flex-none
               items-center
               justify-center
               rounded-full
               border-[3px]
               border-[#8C1D40]
               bg-[#FCF9F7]
             "
             aria-label={
               vidaPouchScore !==
               null
                 ? `VitaPouch score ${vidaPouchScore} out of 100`
                 : "VitaPouch score not available"
             }>

             <span
               className="
                 text-[15px]
                 font-bold
                 leading-none
                 text-[#8C1D40]
               ">

               {vidaPouchScore ??
                 "—"}
             </span>
           </div>

           <p
             className="
               text-[12px]
               font-semibold
               text-[#17252C]
             ">

             VidaPouch Score
           </p>
         </div>

         {/* Certifications */}

         {productClaims.length >
           0 && (
           <div
             className="
               mt-3
               flex
               flex-wrap
               gap-1.5
             ">

             {productClaims.map(
               (claim) => (
                 <span
                   key={claim}
                   className="
                     whitespace-nowrap
                     rounded
                     bg-[#F1F3EC]
                     px-2
                     py-1
                     text-[9px]
                     font-medium
                     text-[#3D4548]
                   ">

                   {claim}
                 </span>
               )
             )}
           </div>
         )}
       </div>
     </div>

     {/* Buy bottle */}

     <div
       className="
         flex
         min-w-0
         flex-col
         border-b
         border-[#EEE7DF]
         px-4
         py-5
         lg:border-b-0
         lg:border-l
       ">

       <div className="min-w-0">
         <p
           className="
             whitespace-nowrap
             text-[11px]
             leading-5
             text-[#485256]
           ">

           {bottleUnitCount}{" "}
           {pluralUnitLabel}
         </p>

         <p
           className="
             mt-1
             whitespace-nowrap
             text-[23px]
             font-semibold
             leading-none
             tracking-[-0.025em]
             text-[#081620]
           ">




{formatCurrency(
 displayedBottlePrice
)}





         </p>

         {bottlePricePerUnit !==
           null && (
           <p
             className="
               mt-2
               whitespace-nowrap
               text-[11px]
               leading-5
               text-[#596367]
             ">

             {formatCurrency(
               bottlePricePerUnit
             )}{" "}
             / {unitLabel}
           </p>
         )}

         <div
           className="
             mt-4
             text-[11px]
             leading-[1.55]
             text-[#4F5A5E]
           ">

           <div
             className="
               flex
               min-w-0
               items-center
               justify-between
               gap-2
             ">

             <span
               className="
                 truncate
                 font-semibold
                 text-[#4F5A5E]
               ">

               {
                 representative
                   .retailer
               }
             </span>

             <span
               className="
                 flex-none
                 text-[14px]
                 leading-none
                 text-[#4F5A5E]
               "
               aria-hidden="true">

               →
             </span>
           </div>

           {hasRetailerRating && (
             <div
               className="
                 mt-1.5
                 flex
                 flex-wrap
                 items-center
                 gap-1.5
               ">

               <RatingStars
                 rating={
                   retailerRating
                 }
               />

               <span
                 className="
                   font-semibold
                   text-[#3F494D]
                 ">

                 {retailerRating.toFixed(
                   1
                 )}
               </span>

               {typeof retailerReviewCount ===
                 "number" &&
                 retailerReviewCount >
                   0 && (
                 <span
                   className="
                     text-[#697276]
                   ">

                   (
                   {formatReviewCount(
                     retailerReviewCount
                   )}
                   )
                 </span>
               )}
             </div>
           )}

           <p className="mt-1">
             Buy directly
           </p>
         </div>
       </div>

       <button
         type="button"
         onClick={
           handleBuyBottle
         }
         disabled={
           isFindingVendorLink
         }
         className="
           mt-auto
           flex
           h-[38px]
           w-full
           min-w-0
           items-center
           justify-center
           whitespace-nowrap
           rounded-[7px]
           border
           border-[#8C1D40]
           bg-white
           px-2
           text-[11px]
           font-semibold
           text-[#8C1D40]
           transition
           hover:bg-[#FAF6F7]
           disabled:cursor-wait
           disabled:border-[#C9AFB8]
           disabled:text-[#9A6D7D]
         ">

         {isFindingVendorLink
           ? `Finding ${representative.retailer} link…`
           : `Buy at ${representative.retailer}`}
       </button>

{/*
       {vendorPriceNotice && (
 <p
   className="
     mt-2
     text-[10px]
     leading-[1.4]
     text-[#596367]
   "
   role="status">

   {vendorPriceNotice}
 </p>
)} */}


       {vendorLinkError && (
         <p
           className="
             mt-2
             text-[10px]
             leading-[1.4]
             text-[#A23636]
           "
           role="alert">

           {vendorLinkError}
         </p>
       )}



     </div>

     {/* Add to VitaPouch */}

     <div
       className="
         flex
         min-w-0
         flex-col
         px-4
         py-5
         lg:border-l
         lg:border-[#EEE7DF]
       ">

       {canAddToVitaPouch ? (
         <>
           <div className="min-w-0">
             <p
               className="
                 whitespace-nowrap
                 text-[11px]
                 leading-5
                 text-[#485256]
               ">

               {pouchUnitCount}{" "}
               {pouchPluralUnitLabel}
             </p>

             <p
               className="
                 mt-1
                 whitespace-nowrap
                 text-[23px]
                 font-semibold
                 leading-none
                 tracking-[-0.025em]
                 text-[#081620]
               ">

               {formatCurrency(
                 product
                   .displayedMonthlyCost
               )}
             </p>

             {pouchPricePerUnit !==
               null && (
               <p
                 className="
                   mt-2
                   whitespace-nowrap
                   text-[11px]
                   leading-5
                   text-[#596367]
                 ">

                 {formatCurrency(
                   pouchPricePerUnit
                 )}{" "}
                 / {unitLabel}
               </p>
             )}

             <div
               className="
                 mt-4
                 text-[11px]
                 leading-[1.55]
                 text-[#4F5A5E]
               ">

               <p>
                 Only pay for what you need.
               </p>

               <p className="mt-1">
                 Ships in your daily pouch.
               </p>
             </div>
           </div>





           <button
            type="button"
            onClick={
              handleAddToPouch
            }
            disabled={
              isInPouch
            }
            className="
              mt-auto
              flex
              h-[38px]
              w-full
              min-w-0
              items-center
              justify-between
              gap-2
              whitespace-nowrap
              rounded-[7px]
              bg-[#8C1D40]
              px-3
              text-[11px]
              font-semibold
              text-white
              transition
              hover:bg-[#741935]
              disabled:cursor-default
              disabled:bg-[#E9E2DC]
              disabled:text-[#625B56]
            ">

            <span>
              {isInPouch
                ? "Added to VidaPouch"
                : "Add to VidaPouch"}
            </span>

            <span
              className="
                flex-none
                text-[18px]
                font-light
                leading-none
              "
              aria-hidden="true">

              {isInPouch
                ? "✓"
                : "+"}
            </span>
          </button>




         </>
       ) : (
         <div
           className="
             flex
             h-full
             min-h-[130px]
             flex-col
             items-start
             justify-center
           ">

           <p
             className="
               text-[12px]
               font-semibold
               text-[#17252C]
             ">

             Bottle purchase only
           </p>

           <p
             className="
               mt-2
               text-[11px]
               leading-[1.55]
               text-[#697276]
             ">

             This product form is not
             currently available for
             VitaPouch packaging.
           </p>
         </div>
       )}
     </div>
   </article>
 );
}