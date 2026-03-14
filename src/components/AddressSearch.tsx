"use client";

import { useState, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchAddress, type AddressResult } from "@/utils/geocoding";

interface AddressSearchProps {
  onSelect: (result: { name: string; lat: number; lng: number }) => void;
  onCancel: () => void;
}

export default function AddressSearch({ onSelect, onCancel }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value.trim()) {
        setResults([]);
        setSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        const data = await searchAddress(value);
        setResults(data);
        setSearched(true);
        setLoading(false);
      }, 500);
    },
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-medium text-[#101828]">
          Search Address
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] text-[#e8b4a0] font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99a1af]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type an address or place name…"
          autoFocus
          className="w-full h-[44px] pl-10 pr-4 rounded-[16px] bg-[#f3f4f6] text-[14px] text-[#364153] placeholder:text-[#99a1af] outline-none focus:ring-2 focus:ring-[#b8e6d5] transition-all"
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99a1af] animate-spin"
          />
        )}
      </div>

      {/* Results list */}
      <div className="max-h-[240px] overflow-y-auto flex flex-col gap-1">
        {results.map((item, idx) => (
          <button
            key={`${item.lat}-${item.lng}-${idx}`}
            type="button"
            onClick={() => onSelect({ name: item.name, lat: item.lat, lng: item.lng })}
            className="w-full text-left px-3 py-2.5 rounded-[12px] hover:bg-[#f3f4f6] active:bg-[#e5e7eb] transition-colors"
          >
            <p className="text-[14px] font-medium text-[#364153] leading-tight">
              {item.name}
            </p>
            <p className="text-[11px] text-[#99a1af] leading-tight mt-0.5 truncate">
              {item.fullName}
            </p>
          </button>
        ))}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <p className="text-[13px] text-[#99a1af] text-center py-4">
            No results found. Try a different search.
          </p>
        )}
      </div>
    </div>
  );
}
