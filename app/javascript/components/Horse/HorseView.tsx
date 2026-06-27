import React from 'react';
import { Horse } from '@/types';
import { Ruler, Scale, Eye, Heart, Award, Edit, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatHorsePrice } from '@/utils/horseHelpers';

export interface PagyPagination {
  current: number;
  next: number | null;
  prev: number | null;
  count: number;
  pages: number;
}

export interface HorseViewProps {
  horses: Horse[]; // current page's horses (horses_with_profile_image)
  pagination: PagyPagination;
  onPageSelect: (page: number) => void;
  onToggleCompare: (horse: Horse) => void;
  compareList: Horse[];
  viewMode: 'grid' | 'list';
}

export const HorseView: React.FC<HorseViewProps> = ({
  horses,
  pagination,
  onPageSelect,
  onToggleCompare,
  compareList,
  viewMode
}) => {
  const isCompared = (id: string) => compareList.some(h => h.id === id);

  return (
    <div className="space-y-6">
      {/* Active Count and Page Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <p className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{horses.length}</span> out of{' '}
          <span className="font-bold text-slate-800">{pagination.count}</span> registered horses &bull; Page{' '}
          <span className="font-bold text-slate-800">{pagination.current}</span> of{' '}
          <span className="font-bold text-slate-800">{pagination.pages}</span>
        </p>
      </div>

      {horses.length === 0 ? (
        <div className="bg-white rounded-2xl py-16 px-4 text-center border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-sm font-semibold">No horses match the selected criteria.</p>
          <p className="text-slate-400 text-xs mt-1">Try relaxing your search terms or expanding your filter ranges.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW LAYOUT */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {horses.map((horse) => {
            const isComp = isCompared(horse.id);
            const mainImg = horse.images.length >= 1 ? horse.images[0].url :
            horse.deceased ?'https://images.unsplash.com/photo-1598146621261-7cdbb2b30d4b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400'
                      : 'https://www.mampublicschool.com/demo.jpg'


            return (
              <div
                key={horse.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
                  horse.featured
                    ? 'border-amber-200 ring-4 ring-amber-500/5 hover:border-amber-400'
                    : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Photo Header */}
                <div className="relative h-48 bg-slate-50 overflow-hidden">
                  <img
                    src={mainImg}
                    alt={horse.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Floating Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {horse.featured && (
                      <span className="bg-amber-600 text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Award className="w-3 h-3" /> Featured Champion
                      </span>
                    )}
                    {horse.deceased && (
                      <span className="bg-rose-600 text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-md">
                        In Memoriam
                      </span>
                    )}
                  </div>

                  {/* Brand Tag */}
                  {horse.brand && (
                    <div className="absolute bottom-2 left-2.5 font-mono text-[9px] bg-slate-900/75 text-amber-300 px-1.5 py-0.5 rounded-sm backdrop-blur-xs">
                      Brand: {horse.brand}
                    </div>
                  )}

                  {/* Price overlay / deceased */}
                  <div className="absolute bottom-2 right-2.5 text-right">
                    {horse.price !== null ? (
                      <span className="bg-emerald-950/85 text-emerald-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md backdrop-blur-xs shadow-md">
                        {formatHorsePrice(horse.price)}
                      </span>
                    ) : (
                      <span className="bg-slate-950/85 text-slate-300 text-[9px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Legacy
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{horse.breed}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        horse.sex === 'GELDING' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {horse.sex}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 truncate tracking-wide leading-snug">
                      {horse.name}
                    </h4>

                    {/* Quick Specs Icons */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Ruler className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {horse.height ? `${horse.height} hh` : '--'}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {horse.weight ? `${horse.weight} lbs` : '--'}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {horse.age !== null ? `${horse.age} yrs` : 'Age N/A'}
                      </span>
                    </div>

                    {/* HMA Indicator */}
                    {horse.herd_management_area && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-800 font-semibold pt-0.5">
                        <Shield className="w-3 h-3 shrink-0" />
                        <span className="truncate" title={horse.herd_management_area}>HMA: {horse.herd_management_area}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1.5">
                      {horse.description || 'Gentle and well-mannered horse raised with premier care.'}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    <Link href={`/horses/${horse.id}`}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Profile
                    </Link>

                    <button
                      onClick={() => onToggleCompare(horse)}
                      title="Add to comparison"
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isComp
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isComp ? 'fill-amber-600 text-amber-600' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW LAYOUT */
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                  <th className="p-4">Photo</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Breed</th>
                  <th className="p-4">Sex</th>
                  <th className="p-4">Age</th>
                  <th className="p-4">Color</th>
                  <th className="p-4">Height/Weight</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {horses.map((horse) => {
                  const isComp = isCompared(horse.id);
                  const thumb = horse.images[0]?.thumbnail_url || 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=150';

                  return (
                    <tr key={horse.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="relative h-12 w-16 rounded-md overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          {horse.name}
                          {horse.featured && (
                            <span className="text-amber-600" title="Featured Champion">
                              <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            </span>
                          )}
                          {horse.deceased && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-bold rounded-sm uppercase tracking-wide">
                              Legacy
                            </span>
                          )}
                        </div>
                        {horse.brand && (
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Brand: {horse.brand}</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{horse.breed}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          horse.sex === 'GELDING' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {horse.sex}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{horse.age !== null ? `${horse.age} yrs` : '--'}</td>
                      <td className="p-4 text-slate-600">{horse.color}</td>
                      <td className="p-4 text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-slate-400" /> {horse.height ? `${horse.height} hh` : '--'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Scale className="w-3 h-3 text-slate-400" /> {horse.weight ? `${horse.weight} lbs` : '--'}
                        </div>
                      </td>
                      <td className="p-4 font-extrabold">
                        {horse.price !== null ? (
                          <span className="text-emerald-800 font-extrabold text-sm">{formatHorsePrice(horse.price)}</span>
                        ) : (
                          <span className="text-slate-400 italic font-normal">Memoriam</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/horses/${horse.id}`}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-[10px] rounded-md flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Link>

                          <button
                            onClick={() => onToggleCompare(horse)}
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              isComp
                                ? 'bg-amber-100 text-amber-950 border-amber-300'
                                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isComp ? 'fill-amber-600 text-amber-600' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPATIBLE PAGY PAGINATION COMPONENT */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 shrink-0">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">Page {pagination.current}</span> of{' '}
          <span className="font-bold text-slate-800">{pagination.pages}</span> &bull; Total{' '}
          <span className="font-bold text-slate-800">{pagination.count}</span> horses registered
        </div>

        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            onClick={() => pagination.prev && onPageSelect(pagination.prev)}
            disabled={pagination.prev === null}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              pagination.prev !== null
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.pages }, (_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => onPageSelect(pNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pNum === pagination.current
                      ? 'bg-amber-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => pagination.next && onPageSelect(pagination.next)}
            disabled={pagination.next === null}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              pagination.next !== null
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
