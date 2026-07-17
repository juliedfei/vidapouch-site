import type {
  ProductOption,
 } from "@/lib/recommendations/productOption";
 
 type ProductCardProps = {
  product: ProductOption;
 };
 
 function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
 }
 
 export default function ProductCard({
  product,
 }: ProductCardProps) {
  const representative =
    product.representativeProduct;
 
  const bottlePricePerCapsule =
    representative.bottlePrice /
    representative.capsulesPerBottle;
 
  /*
   * The comparison design shows one capsule
   * per day in a 30-day VidaPouch supply.
   */
  const pouchCapsules = 30;
 
  const pouchPricePerCapsule =
    product.displayedMonthlyCost /
    pouchCapsules;
 
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
 
      {/* Product and quality */}
 
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
 
        {/* Product image placeholder */}
 
        <div
          className="
            flex
            w-[78px]
            flex-none
            items-start
            justify-center
          ">
 
          <div
            className="
              flex
              h-[118px]
              w-[70px]
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
 
          <div
            className="
              mt-2
              flex
              min-w-0
              flex-wrap
              items-center
              gap-2
            ">
 
            <span
              className="
                whitespace-nowrap
                text-[13px]
                leading-none
                tracking-[1px]
                text-[#F5A623]
              "
              aria-label="Five-star rating">
 
              ★★★★★
            </span>
 
            <span
              className="
                whitespace-nowrap
                text-[11px]
                text-[#596367]
              ">
 
              (1,245)
            </span>
          </div>
 
          <p
            className="
              mt-3
              max-w-[290px]
              text-[11px]
              leading-[1.55]
              text-[#4F5A5E]
            ">
 
            {product.reasons[0]?.description}
          </p>
 
          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-1.5
            ">
 
            <span
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
 
              NSF Certified
            </span>
 
            <span
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
 
              Vegan
            </span>
          </div>
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
 
            {representative.capsulesPerBottle} capsules
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
              representative.bottlePrice
            )}
          </p>
 
          <p
            className="
              mt-2
              whitespace-nowrap
              text-[11px]
              leading-5
              text-[#596367]
            ">
 
            {formatCurrency(
              bottlePricePerCapsule
            )}{" "}
            / capsule
          </p>
 
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
 
                {representative.retailer}
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
 
            <p className="mt-1">
              Buy directly
            </p>
          </div>
        </div>
 
        <button
          type="button"
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
          ">
 
          Buy Bottle
        </button>
      </div>
 
      {/* Add to VidaPouch */}
 
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
 
        <div className="min-w-0">
          <p
            className="
              whitespace-nowrap
              text-[11px]
              leading-5
              text-[#485256]
            ">
 
            {pouchCapsules} capsules
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
              product.displayedMonthlyCost
            )}
          </p>
 
          <p
            className="
              mt-2
              whitespace-nowrap
              text-[11px]
              leading-5
              text-[#596367]
            ">
 
            {formatCurrency(
              pouchPricePerCapsule
            )}{" "}
            / capsule
          </p>
 
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
          ">
 
          <span>Add to Pouch</span>
 
          <span
            className="
              flex-none
              text-[18px]
              font-light
              leading-none
            "
            aria-hidden="true">
 
            +
          </span>
        </button>
      </div>
    </article>
  );
 }