"use client";

import {
 FormEvent,
 useState,
} from "react";

import {
 useRouter,
} from "next/navigation";

export default function AdminLoginPage() {
 const router =
   useRouter();

 const [
   email,
   setEmail,
 ] = useState("");

 const [
   password,
   setPassword,
 ] = useState("");

 const [
   error,
   setError,
 ] = useState<
   string |
   null
>(null);

 const [
   isLoading,
   setIsLoading,
 ] = useState(
   false
 );

 async function handleSubmit(
   event:
     FormEvent<HTMLFormElement>
 ) {
   event.preventDefault();

   setError(
     null
   );

   setIsLoading(
     true
   );

   try {
     const response =
       await fetch(
         "/api/admin/login",
         {
           method:
             "POST",

           headers: {
             "Content-Type":
               "application/json",
           },

           body:
             JSON.stringify({
               email,
               password,
             }),
         }
       );

     const data =
       await response.json() as {
         success?:
           boolean;

         error?:
           string;
       };

     if (
       !response.ok ||
       !data.success
     ) {
       throw new Error(
         data.error ??
         "Unable to sign in."
       );
     }

     router.push(
       "/admin/orders"
     );

     router.refresh();
   } catch (
     error
   ) {
     setError(
       error instanceof Error
         ? error.message
         : "Unable to sign in."
     );
   } finally {
     setIsLoading(
       false
     );
   }
 }

 return (
   <main className="min-h-screen bg-[#F7F3EE] px-5 py-16">
     <div className="mx-auto max-w-md rounded-3xl border border-[#DED4C9] bg-white p-8 shadow-sm sm:p-10">
       <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B6F58]">
         VidaPouch Admin
       </p>

       <h1 className="mt-3 text-3xl font-semibold text-[#26211D]">
         Sign in
       </h1>

       <p className="mt-4 leading-7 text-[#665C54]">
         Enter your private administrator credentials
         to view VidaPouch orders.
       </p>

       <form
         className="mt-8"
         onSubmit={
           handleSubmit
         }>

         <label
           className="block text-sm font-medium text-[#302A25]"
           htmlFor="admin-email">

           Email address
         </label>

         <input
           id="admin-email"
           type="email"
           autoComplete="username"
           required
           value={
             email
           }
           onChange={(
             event
           ) => {
             setEmail(
               event.target.value
             );
           }}
           className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-4 py-3 text-[#26211D] outline-none transition focus:border-[#8B6F58] focus:ring-2 focus:ring-[#8B6F58]/20"
         />

         <label
           className="mt-5 block text-sm font-medium text-[#302A25]"
           htmlFor="admin-password">

           Password
         </label>

         <input
           id="admin-password"
           type="password"
           autoComplete="current-password"
           required
           value={
             password
           }
           onChange={(
             event
           ) => {
             setPassword(
               event.target.value
             );
           }}
           className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-4 py-3 text-[#26211D] outline-none transition focus:border-[#8B6F58] focus:ring-2 focus:ring-[#8B6F58]/20"
         />

         {error ? (
           <p className="mt-4 text-sm text-red-700">
             {error}
           </p>
         ) : null}

         <button
           type="submit"
           disabled={
             isLoading
           }
           className="mt-6 w-full rounded-full bg-[#26211D] px-5 py-3 font-semibold text-white transition hover:bg-[#40372F] disabled:cursor-not-allowed disabled:opacity-60">

           {isLoading
             ? "Signing in..."
             : "Sign in"}
         </button>
       </form>
     </div>
   </main>
 );
}