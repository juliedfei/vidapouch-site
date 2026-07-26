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

   /*
    * We will send page views explicitly
    * rather than relying on automatic capture.
    */
   capture_pageview: false,
   capture_pageleave: true,

   session_recording: {
     maskAllInputs: true,
   },
 });

 /*
  * Explicitly record the initial page load.
  */
 posthog.capture("$pageview");
}
