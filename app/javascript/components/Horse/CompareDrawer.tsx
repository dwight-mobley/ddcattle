import React from 'react';
import { Horse } from '@/types';
import { X, Scale, Ruler, Award } from 'lucide-react';

interface CompareDrawerProps {
  compareList: Horse[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  compareList,
  onRemove,
  onClear
}) => {
  if (compareList.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-200 text-center text-slate-500">
        <div className="mx-auto w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3">
          <Scale className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Horse Comparison Board</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Add up to 3 horses from the catalog to compare physical stats, pricing, and origin side-by-side.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-sm uppercase tracking-wider">Comparison Board ({compareList.length}/3)</h4>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Grid Table */}
      <div className="p-4 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2 text-xs font-bold uppercase text-slate-400 w-1/4">Feature</th>
              {compareList.map(horse => (
                <th key={horse.id} className="py-2 px-3 text-sm font-semibold text-slate-900 w-1/4 relative group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate max-w-[120px]">{horse.name}</span>
                    <button
                      onClick={() => onRemove(horse.id)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              {compareList.length < 3 && (
                <th className="py-2 px-3 text-xs italic text-slate-400 text-center border-dashed border border-slate-100 bg-slate-50/50 rounded-lg">
                  Slot empty
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {/* Image */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Photo</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3">
                  <div className="relative h-16 w-full rounded-lg overflow-hidden bg-slate-50">
                    <img
                      src={horse.images[0]?.thumbnail_url || 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=200'}
                      alt={horse.name}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    />
                    {horse.featured && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5" title="Featured">
                        <Award className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Breed */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Breed</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3 font-medium text-slate-800">
                  {horse.breed}
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Price */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Price</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3 font-bold text-slate-900">
                  {horse.price !== null ? (
                    <span className="text-emerald-700">${horse.price.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-400 italic">In Memoriam</span>
                  )}
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Sex */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Sex</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                    horse.sex === 'GELDING' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                  }`}>
                    {horse.sex}
                  </span>
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Age */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Age</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3 font-medium text-slate-800">
                  {horse.age !== null ? `${horse.age} yrs` : 'N/A'}
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Height */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Height</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3 text-slate-700">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-slate-400" />
                    {horse.height ? `${horse.height} hh` : 'Unknown'}
                  </span>
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Weight */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Weight</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3 text-slate-700">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3 h-3 text-slate-400" />
                    {horse.weight ? `${horse.weight} lbs` : 'Unknown'}
                  </span>
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Color */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Color</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3 text-slate-700">
                  {horse.color}
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Origin & Brand */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Lineage & Brand</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3 text-slate-600 space-y-1">
                  {horse.brand && (
                    <div className="font-mono text-[10px] bg-slate-100 py-0.5 px-1.5 rounded-sm inline-block">
                      Brand: {horse.brand}
                    </div>
                  )}
                  {horse.herd_management_area ? (
                    <div className="text-[10px] leading-tight text-amber-700 font-medium">
                      Wild HMA: {horse.herd_management_area}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">Ranch Bred</div>
                  )}
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>

            {/* Actions */}
            <tr>
              <td className="py-3 font-semibold text-slate-500">Quick view</td>
              {compareList.map(horse => (
                <td key={horse.id} className="py-3 px-3">
                  <button
                    className="w-full py-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold text-[10px] transition-colors cursor-pointer"
                  >
                    Open Profile
                  </button>
                </td>
              ))}
              {compareList.length < 3 && <td className="p-3 bg-slate-50/30"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
