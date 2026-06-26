import React, { useState, useMemo } from 'react';
import { type Horse } from '@/types';
import { CompareDrawer } from '@/components/Horse/CompareDrawer';
import { HorseView } from '@/components/Horse/HorseView';
import {
  Search,
  Grid,
  List,
  Compass,
  Database,
  Wrench,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function HorseGrid({horses:INITIAL_HORSES}:{horses: Horse[]}) {
  // Master Horse Records State (to allow mock adding, editing, and status toggles)
  const [horses, setHorses] = useState<Horse[]>(INITIAL_HORSES);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All');
  const [selectedSex, setSelectedSex] = useState<'All' | 'GELDING' | 'MARE'>('All');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Deceased' | 'Featured'>('Active');
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<string>('featured-desc');

  // Page States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6); // number of horses per page
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');



  // Comparisons List (max 3 horses)
  const [compareList, setCompareList] = useState<Horse[]>([]);

  // Unique list of breeds for filters
  const breedOptions = useMemo(() => {
    const breeds = new Set<string>();
    horses.forEach(h => {
      if (h.breed) breeds.add(h.breed);
    });
    return ['All', ...Array.from(breeds)];
  }, [horses]);


  // Toggle comparison state for a horse
  const handleToggleCompare = (horse: Horse) => {
    setCompareList(prev => {
      const alreadyIn = prev.some(h => h.id === horse.id);
      if (alreadyIn) {
        return prev.filter(h => h.id !== horse.id);
      } else {
        if (prev.length >= 3) {
          alert("You can compare a maximum of 3 horses at a time. Please remove one first!");
          return prev;
        }
        return [...prev, horse];
      }
    });
  };

  // Filter & Sort Logic
  const filteredAndSortedHorses = useMemo(() => {
    let result = [...horses];

    // 1. Text Search (name, breed, description, brand, herd management area)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(h =>
        h.name.toLowerCase().includes(query) ||
        (h.description && h.description.toLowerCase().includes(query)) ||
        (h.brand && h.brand.toLowerCase().includes(query)) ||
        h.breed.toLowerCase().includes(query) ||
        (h.herd_management_area && h.herd_management_area.toLowerCase().includes(query))
      );
    }

    // 2. Breed Filter
    if (selectedBreed !== 'All') {
      result = result.filter(h => h.breed === selectedBreed);
    }

    // 3. Sex Filter
    if (selectedSex !== 'All') {
      result = result.filter(h => h.sex === selectedSex);
    }

    // 4. Age Group Filter
    if (selectedAgeGroup !== 'All') {
      result = result.filter(h => {
        if (!h.age) return false;
        if (selectedAgeGroup === 'Young (< 5)') return h.age < 5;
        if (selectedAgeGroup === 'Mature (5-12)') return h.age >= 5 && h.age <= 12;
        if (selectedAgeGroup === 'Senior (> 12)') return h.age > 12;
        return true;
      });
    }

    // 5. Status Filter (Active, Deceased, Featured)
    if (selectedStatus === 'Active') {
      result = result.filter(h => !h.deceased);
    } else if (selectedStatus === 'Deceased') {
      result = result.filter(h => h.deceased);
    } else if (selectedStatus === 'Featured') {
      result = result.filter(h => h.featured && !h.deceased);
    }

     // 7. Sort Logic
    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'age-asc') return (a.age || 0) - (b.age || 0);
      if (sortBy === 'age-desc') return (b.age || 0) - (a.age || 0);
      if (sortBy === 'height-desc') return (b.height || 0) - (a.height || 0);
      if (sortBy === 'weight-desc') return (b.weight || 0) - (a.weight || 0);

      // Default: Featured first, then name
      if (sortBy === 'featured-desc') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [horses, searchQuery, selectedBreed, selectedSex, selectedAgeGroup, selectedStatus, maxPrice, sortBy]);

  // PAGY PAGINATION MATH CALCULATIONS
  const totalCount = filteredAndSortedHorses.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // If filtered count changes and current page exceeds total pages, reset current page to 1
  const activeCurrentPage = currentPage > totalPages ? 1 : currentPage;

  // Paginated elements slice
  const startIndex = (activeCurrentPage - 1) * pageSize;
  const paginatedHorses = useMemo(() => {
    return filteredAndSortedHorses.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedHorses, startIndex, pageSize]);

  // Re-build standard Pagy state properties
  const pagyPagination = {
    current: activeCurrentPage,
    next: activeCurrentPage < totalPages ? activeCurrentPage + 1 : null,
    prev: activeCurrentPage > 1 ? activeCurrentPage - 1 : null,
    count: totalCount,
    pages: totalPages
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-amber-800 selection:text-white font-sans antialiased">

      {/* Main Content Wrap */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Catalog Control Deck: Search, Filters & Sorters */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">

          {/* Top Row: Search and view toggle */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to page 1 on typing search
                }}
                placeholder="Search horses by name, trait keywords, brand, wild HMA..."
                className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-600 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Layout Mode Toggles & Page Sizer */}
            <div className="flex items-center justify-end gap-3.5 w-full md:w-auto shrink-0">

              {/* Page Sizer */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold">Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 p-1 bg-slate-50 text-slate-800 font-bold focus:outline-none"
                >
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>

              {/* Grid / List Mode */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid Gallery View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Detailed Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible/Grid Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2 border-t border-slate-100">

            {/* Filter 1: Breed */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-700" /> Breed
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => {
                  setSelectedBreed(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-800 font-bold focus:outline-none"
              >
                {breedOptions.map(breed => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>

            {/* Filter 2: Sex */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sex / Gender</label>
              <select
                value={selectedSex}
                onChange={(e) => {
                  setSelectedSex(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-800 font-bold focus:outline-none"
              >
                <option value="All">All Genders</option>
                <option value="GELDING">GELDING Only</option>
                <option value="MARE">MARE Only</option>
              </select>
            </div>

            {/* Filter 3: Age Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age Group</label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => {
                  setSelectedAgeGroup(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-800 font-bold focus:outline-none"
              >
                <option value="All">All Ages</option>
                <option value="Young (< 5)">Young (&lt; 5 yrs)</option>
                <option value="Mature (5-12)">Mature (5-12 yrs)</option>
                <option value="Senior (> 12)">Senior (&gt; 12 yrs)</option>
              </select>
            </div>

            {/* Filter 4: Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Roster Category</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-800 font-bold focus:outline-none"
              >
                <option value="All">All Roster History</option>
                <option value="Active">Active Herd Only</option>
                <option value="Featured">Featured Showcase</option>
                <option value="Deceased">In Memoriam Legacy</option>
              </select>
            </div>

            {/* Sorter Deck */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort Roster By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-800 font-bold focus:outline-none"
              >
                <option value="featured-desc">Featured first</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="age-asc">Age: Young to Old</option>
                <option value="age-desc">Age: Old to Young</option>
                <option value="height-desc">Height (hands): Tallest</option>
                <option value="weight-desc">Weight (lbs): Heaviest</option>
              </select>
            </div>
          </div>
        </section>

        {/* Master Double columns: Left Horse catalog list & Right side board (Comparison / Mini stats) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* Left Main column - Horse catalog view (Takes 8 cols) */}
          <div className="xl:col-span-8 space-y-6">

            {/* Actual dynamic view element matching the exact prompt structure */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-50 text-amber-800 rounded-lg">
                    <Compass className="w-4 h-4" />
                  </span>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Ranch Roster Catalog
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">
                  {totalCount} Found
                </span>
              </div>

              {/* HorseView is the component receiving exact:
                  props: { horses: horses_with_profile_image, pagination: {current, next, prev, count, pages} }
              */}
              <HorseView
                horses={paginatedHorses}
                pagination={pagyPagination}
                onPageSelect={(p) => setCurrentPage(p)}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                viewMode={viewMode}
              />
            </div>
          </div>

          {/* Right column - Sidebar containing Comparisons board (Takes 4 cols) */}
          <div className="xl:col-span-4 space-y-6">
            {/* Compare board drawer */}
            <CompareDrawer
              compareList={compareList}
              onRemove={(id) => setCompareList(prev => prev.filter(h => h.id !== id))}
              onClear={() => setCompareList([])}
            />

            {/* Quick Guideline Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-700" /> Active Registry Specs
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All listed horses have completed genetic lineage reports, general physical examinations, vaccine certificates, and farrier updates.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="font-bold">GELDING:</span>
                  <span>Castrated male horse (highly calm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">MARE:</span>
                  <span>Female horse (breeding & performance)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Height (hh):</span>
                  <span>Hands high (1 hand = 4 inches)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">HMA Brand:</span>
                  <span>BLM Wild Gather identification code</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

HorseGrid.layout = (page: React.ReactNode) => <Layout>{page}</Layout>
