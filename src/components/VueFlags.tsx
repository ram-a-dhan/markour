/**
 * Browser warning supresssor because @milkdown/crepe
 * uses Vue under the hood and needs these flags.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

if (typeof window !== "undefined") {
  (window as any).__VUE_OPTIONS_API__ = true;
  (window as any).__VUE_PROD_DEVTOOLS__ = false;
  (window as any).__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
}

export default function VueFlags() {
  return null;
}
