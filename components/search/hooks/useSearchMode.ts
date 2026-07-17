"use client";

import { useState } from "react";

export type SearchMode =
 | "discovery"
 | "searching"
 | "shopping";

export function useSearchMode() {
 const [mode, setMode] =
   useState<SearchMode>("discovery");

 return {
   mode,
   setMode,
 };
}