"use client";

import posthog from "posthog-js";

type AnalyticsProperties =
 Record<
   string,
   string | number | boolean | null | undefined
>;

export function trackEvent(
 eventName: string,
 properties: AnalyticsProperties = {}
) {
 if (
   typeof window === "undefined"
 ) {
   return;
 }

 try {
   posthog.capture(
     eventName,
     properties
   );
 } catch (error) {
   /*
    * Analytics should never stop
    * the website from working.
    */
   console.error(
     "Analytics event failed:",
     eventName,
     error
   );
 }
}