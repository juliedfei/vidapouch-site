"use client";

import {
 useEffect,
 useRef,
 type KeyboardEvent,
} from "react";

import SupplementEntryForm from "./SupplementEntryForm";
import CustomBrandInput from "./CustomBrandInput";

type AddSupplementRowProps = {
 brand: string;
 customBrand: string;
 name: string;
 dosage: string;

 setBrand: (value: string) => void;
 setCustomBrand: (value: string) => void;
 setName: (value: string) => void;
 setDosage: (value: string) => void;

 addSupplement: () => void;
};

export default function AddSupplementRow({
 brand,
 customBrand,
 name,
 dosage,

 setBrand,
 setCustomBrand,
 setName,
 setDosage,

 addSupplement,
}: AddSupplementRowProps) {
 const supplementInputRef =
   useRef<HTMLInputElement>(null);

 const showCustomBrand =
   brand === "Other";

 useEffect(() => {
   supplementInputRef.current?.focus();
 }, []);

 function handleSubmit() {
   if (!name.trim()) {
     supplementInputRef.current?.focus();
     return;
   }

   addSupplement();

   requestAnimationFrame(() => {
     supplementInputRef.current?.focus();
   });
 }

 function handleKeyDown(
   event: KeyboardEvent<
     HTMLInputElement | HTMLSelectElement>

 ) {
   if (event.key !== "Enter") return;

   event.preventDefault();
   handleSubmit();
 }

 return (
   <>
     <SupplementEntryForm
       brand={brand}
       name={name}
       dosage={dosage}
       setBrand={setBrand}
       setName={setName}
       setDosage={setDosage}
       handleKeyDown={handleKeyDown}
       handleSubmit={handleSubmit}
       supplementInputRef={
         supplementInputRef
       }
     />

     {showCustomBrand && (
       <div className="mt-4">
         <CustomBrandInput
           customBrand={customBrand}
           setCustomBrand={
             setCustomBrand
           }
         />
       </div>
     )}
   </>
 );
}