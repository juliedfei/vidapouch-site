import posthog from "posthog-js";

const posthogToken =
 process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

const posthogHost =
 process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogToken) {
 posthog.init(posthogToken, {
   api_host:
     posthogHost ??
     "https://us.i.posthog.com",

   capture_pageview: "history_change",
   capture_pageleave: true,

   /*
    * Protect customer-entered information
    * in session recordings.
    */
   session_recording: {
     maskAllInputs: true,
   },
 });
}
