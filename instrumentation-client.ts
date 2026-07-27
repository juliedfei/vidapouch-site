import posthog from "posthog-js";

const posthogToken =
 process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

const posthogHost =
 process.env.NEXT_PUBLIC_POSTHOG_HOST ??
 "https://us.i.posthog.com";

if (posthogToken) {
 posthog.init(posthogToken, {
   api_host: posthogHost,

   /*
    * Automatically records the first page load
    * and Next.js client-side route changes.
    */
   capture_pageview: "history_change",

   capture_pageleave: true,

   /*
    * Protect anything customers type into forms
    * from appearing in session recordings.
    */
   session_recording: {
     maskAllInputs: true,
   },
 });
}
