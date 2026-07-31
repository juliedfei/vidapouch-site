function cleanText(
    value:
      string
   ) {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function removeWholePhrase(
    value:
      string,
   
    phrase:
      string
   ) {
    const cleanedPhrase =
      cleanText(
        phrase
      );
   
    if (
      !cleanedPhrase
    ) {
      return value;
    }
   
    return value
      .replace(
        new RegExp(
          `\\b${cleanedPhrase
            .split(
              " "
            )
            .join(
              "\\s+"
            )}\\b`,
          "gi"
        ),
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function normalizeFormWord(
    value:
      string
   ) {
    return value
      .replace(
        /\bcapsules?\b/g,
        " "
      )
      .replace(
        /\btablets?\b/g,
        " "
      )
      .replace(
        /\bsoftgels?\b/g,
        " "
      )
      .replace(
        /\bcaplets?\b/g,
        " "
      )
      .replace(
        /\bservings?\b/g,
        " "
      )
      .replace(
        /\bunits?\b/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   export function normalizeInventoryProductName({
    productName,
    brand,
   }: {
    productName:
      string;
   
    brand:
      string;
   }) {
    let normalizedName =
      cleanText(
        productName
      );
   
    normalizedName =
      removeWholePhrase(
        normalizedName,
        brand
      );
   
    normalizedName =
      normalizeFormWord(
        normalizedName
      );
   
    return normalizedName;
   }
   
   export function buildInventoryProductKey({
    brand,
    productName,
    dosage,
    form,
    unitLabel,
   }: {
    brand:
      string;
   
    productName:
      string;
   
    dosage?:
      string | null;
   
    form?:
      string | null;
   
    unitLabel:
      string;
   }) {
    const normalizedBrand =
      cleanText(
        brand
      );
   
    const normalizedProductName =
      normalizeInventoryProductName({
        productName,
        brand,
      });
   
    const normalizedDosage =
      dosage
        ? cleanText(
            dosage
          )
        : "";
   
    const normalizedForm =
      form
        ? cleanText(
            form
          ).replace(
            /s$/,
            ""
          )
        : "";
   
    const normalizedUnitLabel =
      cleanText(
        unitLabel
      ).replace(
        /s$/,
        ""
      );
   
    return [
      normalizedBrand,
      normalizedProductName,
      normalizedDosage,
      normalizedForm,
      normalizedUnitLabel,
    ].join(
      "|"
    );
   }