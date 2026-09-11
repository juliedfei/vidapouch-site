export type ManufacturerSource = {
    canonicalBrand: string;
    aliases: readonly string[];
    origin: string;
    catalogUrls: readonly string[];
    productPathHints: readonly string[];
  };
  
  function normalizeBrandValue(value: string | null | undefined) {
    return (value ?? "")
      .toLowerCase()
      .replace(/[®™©]/g, " ")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(?:inc|llc|company|co|laboratories|labs)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  /*
   * Generic registry: adding a manufacturer is configuration only.
   * The crawler, parser, caching and Buy Bottle behavior are shared.
   */
  export const MANUFACTURER_SOURCES: readonly ManufacturerSource[] = [
    { canonicalBrand:"Thorne", aliases:["Thorne","Thorn"], origin:"https://www.thorne.com", catalogUrls:["https://www.thorne.com/products"], productPathHints:["/products/dp/","/products/"] },
    { canonicalBrand:"Nature Made", aliases:["Nature Made","NatureMade"], origin:"https://www.naturemade.com", catalogUrls:["https://www.naturemade.com/collections/supplements","https://www.naturemade.com/collections/shop-all"], productPathHints:["/products/"] },
    { canonicalBrand:"NOW", aliases:["NOW","NOW Foods","NOW Supplements"], origin:"https://www.nowfoods.com", catalogUrls:["https://www.nowfoods.com/products/supplements"], productPathHints:["/products/supplements/","/products/"] },
    { canonicalBrand:"Life Extension", aliases:["Life Extension","LifeExtension"], origin:"https://www.lifeextension.com", catalogUrls:["https://www.lifeextension.com/vitamins-supplements"], productPathHints:["/vitamins-supplements/item","/vitamins-supplements/"] },
    { canonicalBrand:"Nordic Naturals", aliases:["Nordic Naturals","Nordic"], origin:"https://www.nordic.com", catalogUrls:["https://www.nordic.com/products/"], productPathHints:["/products/"] },
    { canonicalBrand:"Solgar", aliases:["Solgar"], origin:"https://www.solgar.com", catalogUrls:["https://www.solgar.com/products/"], productPathHints:["/products/"] },
    { canonicalBrand:"Jarrow Formulas", aliases:["Jarrow Formulas","Jarrow"], origin:"https://jarrow.com", catalogUrls:["https://jarrow.com/collections/all-products"], productPathHints:["/products/"] },
    { canonicalBrand:"Doctor's Best", aliases:["Doctor's Best","Doctors Best","Doctor Best"], origin:"https://www.doctorsbest.com", catalogUrls:["https://www.doctorsbest.com/collections/all"], productPathHints:["/products/"] },
    { canonicalBrand:"Nature's Bounty", aliases:["Nature's Bounty","Natures Bounty"], origin:"https://naturesbounty.com", catalogUrls:["https://naturesbounty.com/collections/all-products"], productPathHints:["/products/"] },
    { canonicalBrand:"MegaFood", aliases:["MegaFood","Mega Food"], origin:"https://megafood.com", catalogUrls:["https://megafood.com/collections/all"], productPathHints:["/products/"] },
    { canonicalBrand:"New Chapter", aliases:["New Chapter"], origin:"https://www.newchapter.com", catalogUrls:["https://www.newchapter.com/products/"], productPathHints:["/products/"] },
    { canonicalBrand:"Gaia Herbs", aliases:["Gaia Herbs","Gaia"], origin:"https://www.gaiaherbs.com", catalogUrls:["https://www.gaiaherbs.com/collections/all-products"], productPathHints:["/products/"] },
    { canonicalBrand:"Carlson", aliases:["Carlson","Carlson Labs","Carlson Laboratories"], origin:"https://www.carlsonlabs.com", catalogUrls:["https://www.carlsonlabs.com/collections/all"], productPathHints:["/products/"] },
    { canonicalBrand:"Sports Research", aliases:["Sports Research"], origin:"https://sportsresearch.com", catalogUrls:["https://sportsresearch.com/collections/all-products"], productPathHints:["/products/"] },
    { canonicalBrand:"MaryRuth's", aliases:["MaryRuth's","MaryRuth Organics","Mary Ruth Organics","MaryRuths"], origin:"https://www.maryruthorganics.com", catalogUrls:["https://www.maryruthorganics.com/collections/all-products"], productPathHints:["/products/"] },
    { canonicalBrand:"OLLY", aliases:["OLLY","Olly"], origin:"https://www.olly.com", catalogUrls:["https://www.olly.com/collections/all"], productPathHints:["/products/"] },
    { canonicalBrand:"SmartyPants", aliases:["SmartyPants","Smarty Pants"], origin:"https://www.smartypantsvitamins.com", catalogUrls:["https://www.smartypantsvitamins.com/collections/all-products"], productPathHints:["/products/"] },
  ];
  
  export function getManufacturerSourceByBrand(value: string | null | undefined) {
    const normalized=normalizeBrandValue(value);
    if (!normalized) return null;
    for (const source of MANUFACTURER_SOURCES) {
      const matched=[source.canonicalBrand,...source.aliases].some(candidate=>{
        const c=normalizeBrandValue(candidate);
        return normalized===c || normalized.includes(c) || c.includes(normalized);
      });
      if (matched) return source;
    }
    return null;
  }
  
  export function getManufacturerSourceForSearch({brand,supplement}:{brand?:string|null;supplement?:string|null}) {
    return getManufacturerSourceByBrand(brand) ?? getManufacturerSourceByBrand(supplement);
  }
  
  export function isUrlOnManufacturerSource(value:string, source:ManufacturerSource) {
    try {
      const url=new URL(value); const origin=new URL(source.origin);
      const h=url.hostname.toLowerCase().replace(/^www\./,"");
      const sh=origin.hostname.toLowerCase().replace(/^www\./,"");
      if (url.protocol!=="https:" || !(h===sh || h.endsWith(`.${sh}`))) return false;
      return source.productPathHints.some(hint=>url.pathname.toLowerCase().includes(hint.toLowerCase()));
    } catch { return false; }
  }
  