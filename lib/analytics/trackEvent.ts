"use client";

import posthog from "posthog-js";

type AnalyticsProperties =
 Record<
   string,
   string | number | boolean | null | undefined
>;

type AnalyticsOptions = {
 sendInstantly?:
   boolean;
};

export function trackEvent(
 eventName:
   string,

 properties:
   AnalyticsProperties = {},

 options:
   AnalyticsOptions = {}
) {
 if (
   typeof window ===
   "undefined"
 ) {
   return;
 }

 try {
   posthog.capture(
     eventName,
     properties,
     options.sendInstantly
       ? {
           send_instantly:
             true,
         }
       : undefined
   );
 } catch (
   error
 ) {
   console.error(
     "Analytics event failed:",
     eventName,
     error
   );
 }
}
