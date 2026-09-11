import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

interface PlaceSuggestion {
  placeId: string;
  text: string;
  primaryText: string;
  secondaryText: string;
  isMock?: boolean;
}

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = 'e.g. 1438 N Gower St, Hollywood, CA',
  required = false,
  className = '',
  id,
}) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLiveGoogle, setIsLiveGoogle] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2)
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when value changes and user is focused
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const query = value.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getPlaceSuggestions(query, sessionToken);
        if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setIsLiveGoogle(data.source === 'google_maps');
          setIsOpen(true);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Failed to get address suggestions', err);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, sessionToken]);

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    onChange(suggestion.text);
    setSuggestions([]);
    setIsOpen(false);
    // Reset session token for subsequent autocomplete sessions
    setSessionToken(
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0 && value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors ${className}`}
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          )}
          {value && !isLoading && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="Clear address"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1.5 max-h-60 overflow-y-auto divide-y divide-slate-50">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.placeId || idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-50/80 text-amber-950' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MapPin
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isSelected ? 'text-amber-500' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-slate-900">
                      {item.primaryText || item.text}
                    </p>
                    {item.secondaryText && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.secondaryText}
                      </p>
                    )}
                  </div>
                  {item.isMock && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                      Stage / Studio
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Google Maps Attribution / Source Footer */}
          <div className="px-3.5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 select-none">
            <div className="flex items-center gap-1.5">
              {isLiveGoogle ? (
                <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Google Maps Places
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Studio Stages & Smart Suggestions
                </span>
              )}
            </div>
            <span className="font-semibold tracking-wide text-slate-500">
              powered by Google
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
