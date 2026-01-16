'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, Check } from 'lucide-react';
import { COUNTRIES, Country } from '@/lib/data/countries';

type CountrySelectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (countryCode: string) => void;
  selectedCountry?: string;
};

export default function CountrySelectModal({
  isOpen,
  onClose,
  onSelect,
  selectedCountry,
}: CountrySelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset search query when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return COUNTRIES;
    }

    const query = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.nameKo.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Handle country selection
  const handleSelect = (country: Country) => {
    onSelect(country.code);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              국가 선택
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="국가 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCountries.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCountries.map((country) => {
                const isSelected = selectedCountry === country.code;
                return (
                  <button
                    key={country.code}
                    onClick={() => handleSelect(country)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                      ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {country.nameKo}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {country.name}
                      </p>
                    </div>
                    {isSelected && (
                      <Check size={20} className="text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
