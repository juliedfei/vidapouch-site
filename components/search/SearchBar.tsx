"use client";

import VidaSearchAutocomplete from "./VidaSearchAutocomplete";

import {
  trackEvent,
} from "@/lib/analytics/trackEvent";

type SearchBarProps = {
  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  onSubmit?:
    (
      query:
        string
    ) => void;

  placeholder?:
    string;

  variant?:
    "hero" |
    "compact";

  disabled?:
    boolean;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder =
    "Search supplements",
  variant =
    "hero",
  disabled =
    false,
}: SearchBarProps) {
  function handleSubmit(
    query:
      string
  ) {
    const cleanedQuery =
      query.trim();

    if (
      !cleanedQuery
    ) {
      return;
    }

    onChange(
      cleanedQuery
    );

    trackEvent(
      "search_submitted",
      {
        search_query:
          cleanedQuery,

        search_location:
          variant ===
            "hero"
            ? "hero_search"
            : "compact_search",
      }
    );

    onSubmit?.(
      cleanedQuery
    );
  }

  const containerClassName =
    variant ===
      "compact"
      ? "w-full [&_input]:h-12 [&_button[type='submit']]:h-9 [&_button[type='submit']]:px-5"
      : "w-full";

  return (
    <div
      className={
        containerClassName
      }>

      <VidaSearchAutocomplete
        value={value}
        onChange={onChange}
        onSubmit={
          handleSubmit
        }
        placeholder={
          placeholder
        }
        disabled={
          disabled
        }
      />
    </div>
  );
}
