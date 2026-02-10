'use client';

import { useState, useEffect } from 'react';

interface FilterOptions {
  regional: string[];
  subDistrict: string[];
  distributionChannel: string[];
  siteName: string[];
  materialType: string[];
  productType: string[];
  mgh1: string[];
  mgh2: string[];
  mgh3: string[];
  mgh4: string[];
  gwp: string[];
  bogo: string[];
  idRa: string[];
}

interface FilterValues {
  dateStart: string;
  dateEnd: string;
  regional: string;
  subDistrict: string;
  distributionChannel: string;
  siteName: string;
  materialType: string;
  productType: string;
  mgh1: string;
  mgh2: string;
  mgh3: string;
  mgh4: string;
  gwp: string;
  bogo: string;
  idRa: string;
}

interface FilterPanelProps {
  options: FilterOptions;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterPanel({ options, values, onChange, isOpen, onToggle }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    date: true,
    location: true,
    product: false,
    promo: false,
    employee: false,
  });

  // Auto-expand sections with active filters, collapse the rest
  useEffect(() => {
    const hasDate = !!(values.dateStart || values.dateEnd);
    const hasLocation = values.regional !== 'All' || values.subDistrict !== 'All' || values.distributionChannel !== 'All' || values.siteName !== 'All';
    const hasProduct = values.materialType !== 'All' || values.productType !== 'All' || values.mgh1 !== 'All' || values.mgh2 !== 'All' || values.mgh3 !== 'All' || values.mgh4 !== 'All';
    const hasPromo = values.gwp !== 'All' || values.bogo !== 'All';
    const hasEmployee = values.idRa !== 'All';
    const hasAny = hasDate || hasLocation || hasProduct || hasPromo || hasEmployee;

    setExpandedSections({
      date: hasAny ? hasDate : true,
      location: hasAny ? hasLocation : true,
      product: hasProduct,
      promo: hasPromo,
      employee: hasEmployee,
    });
  }, [values]);

  const handleChange = (field: keyof FilterValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Count active filters
  const activeFilterCount = [
    values.dateStart,
    values.dateEnd,
    values.regional !== 'All' ? values.regional : '',
    values.subDistrict !== 'All' ? values.subDistrict : '',
    values.distributionChannel !== 'All' ? values.distributionChannel : '',
    values.siteName !== 'All' ? values.siteName : '',
    values.materialType !== 'All' ? values.materialType : '',
    values.productType !== 'All' ? values.productType : '',
    values.mgh1 !== 'All' ? values.mgh1 : '',
    values.mgh2 !== 'All' ? values.mgh2 : '',
    values.mgh3 !== 'All' ? values.mgh3 : '',
    values.mgh4 !== 'All' ? values.mgh4 : '',
    values.gwp !== 'All' ? values.gwp : '',
    values.bogo !== 'All' ? values.bogo : '',
    values.idRa !== 'All' ? values.idRa : '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onChange({
      dateStart: '',
      dateEnd: '',
      regional: 'All',
      subDistrict: 'All',
      distributionChannel: 'All',
      siteName: 'All',
      materialType: 'All',
      productType: 'All',
      mgh1: 'All',
      mgh2: 'All',
      mgh3: 'All',
      mgh4: 'All',
      gwp: 'All',
      bogo: 'All',
      idRa: 'All',
    });
  };

  const FilterSelect = ({
    label,
    field,
    options: opts
  }: {
    label: string;
    field: keyof FilterValues;
    options: string[]
  }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={values[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full max-w-full px-3 py-3 lg:py-2 bg-white border border-gray-300 rounded-md text-sm truncate focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
      >
        <option value="All">All</option>
        {opts.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const SectionHeader = ({ sectionKey, title, icon }: { sectionKey: string; title: string; icon: React.ReactNode }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-3 px-1 text-sm font-semibold text-gray-800 hover:text-gray-900 border-b border-gray-200"
    >
      <div className="flex items-center gap-2">
        {icon}
        {title}
      </div>
      <svg
        className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-red-600 text-white px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Filter Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button onClick={onToggle} className="lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-hidden">
          {/* Clear All Button - shown when filters are active */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full mb-4 px-4 py-3 lg:py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Filters ({activeFilterCount})
            </button>
          )}

          {/* Date Section */}
          <SectionHeader
            sectionKey="date"
            title="Date Range"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          {expandedSections.date && (
            <div className="py-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Date</label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={values.dateStart}
                  onChange={(e) => handleChange('dateStart', e.target.value)}
                  className="flex-1 min-w-0 px-2 py-3 lg:py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-gray-400 flex-shrink-0">-</span>
                <input
                  type="date"
                  value={values.dateEnd}
                  onChange={(e) => handleChange('dateEnd', e.target.value)}
                  className="flex-1 min-w-0 px-2 py-3 lg:py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          )}

          {/* Location Section */}
          <SectionHeader
            sectionKey="location"
            title="Lokasi"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          {expandedSections.location && (
            <div className="py-3">
              <FilterSelect label="Regional" field="regional" options={options.regional} />
              <FilterSelect label="Sub District" field="subDistrict" options={options.subDistrict} />
              <FilterSelect label="Distribution Channel" field="distributionChannel" options={options.distributionChannel} />
              <FilterSelect label="Site Name" field="siteName" options={options.siteName} />
            </div>
          )}

          {/* Product Section */}
          <SectionHeader
            sectionKey="product"
            title="Produk"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          {expandedSections.product && (
            <div className="py-3">
              <FilterSelect label="Material Type" field="materialType" options={options.materialType} />
              <FilterSelect label="Product Type" field="productType" options={options.productType} />
              <FilterSelect label="MGH 1" field="mgh1" options={options.mgh1} />
              <FilterSelect label="MGH 2" field="mgh2" options={options.mgh2} />
              <FilterSelect label="MGH 3" field="mgh3" options={options.mgh3} />
              <FilterSelect label="MGH 4" field="mgh4" options={options.mgh4} />
            </div>
          )}

          {/* Promo Section */}
          <SectionHeader
            sectionKey="promo"
            title="Promosi"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />
          {expandedSections.promo && (
            <div className="py-3">
              <FilterSelect label="GWP" field="gwp" options={options.gwp} />
              <FilterSelect label="BOGO" field="bogo" options={options.bogo} />
            </div>
          )}

          {/* Employee Section */}
          <SectionHeader
            sectionKey="employee"
            title="Employee"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          {expandedSections.employee && (
            <div className="py-3">
              <FilterSelect label="Employee" field="idRa" options={options.idRa} />
            </div>
          )}

          {/* Reset Button at bottom */}
          <button
            onClick={clearAllFilters}
            className="w-full mt-4 px-4 py-3 lg:py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}

export type { FilterOptions, FilterValues };
