import React from 'react';
import { Horse } from '@/types';
import { DollarSign, ShieldCheck, HeartPulse, Sparkles, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  horses: Horse[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ horses }) => {
  const totalCount = horses.length;
  const activeHorses = horses.filter(h => !h.deceased);
  const activeCount = activeHorses.length;
  const deceasedCount = horses.filter(h => h.deceased).length;

  const featuredCount = activeHorses.filter(h => h.featured).length;
  const featuredPercentage = activeCount > 0 ? Math.round((featuredCount / activeCount) * 100) : 0;

  const horsesWithPrice = activeHorses.filter(h => h.price !== null);
  const averagePrice = horsesWithPrice.length > 0
    ? Math.round(horsesWithPrice.reduce((sum, h) => sum + (h.price || 0), 0) / horsesWithPrice.length)
    : 0;

  const totalPrice = horsesWithPrice.reduce((sum, h) => sum + (h.price || 0), 0);

  // Group by breed
  const breedCounts: { [key: string]: number } = {};
  activeHorses.forEach(h => {
    breedCounts[h.breed] = (breedCounts[h.breed] || 0) + 1;
  });

  const sortedBreeds = Object.entries(breedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ranch Horses</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</h3>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-emerald-600">{activeCount} active</span> &bull; {deceasedCount} memoriam
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg active valuation</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">${averagePrice.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Total book value: <span className="font-semibold text-emerald-700">${totalPrice.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Featured Champions</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{featuredCount}</h3>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-blue-600">{featuredPercentage}%</span> of active ranch herd
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Memoriam Legacy</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{deceasedCount}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ranch history since 2004
            </p>
          </div>
        </div>
      </div>

      {/* Breeding & Distribution Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs md:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" /> Top Breed Distribution (Active Herd)
          </h4>
          <div className="space-y-3.5">
            {sortedBreeds.map(([breed, count]) => {
              const pct = Math.round((count / activeCount) * 100);
              return (
                <div key={breed} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{breed}</span>
                    <span className="font-semibold text-slate-900">{count} {count === 1 ? 'horse' : 'horses'} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tips Box */}
        <div className="bg-gradient-to-br from-amber-900 to-amber-950 p-5 rounded-2xl text-amber-50 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Whispering Pines Ranch
            </h4>
            <p className="text-xs text-amber-100/90 mt-2 leading-relaxed">
              Our family ranch has bred champion Quarter Horses, majestic Friesians, and trained rescued wild Mustangs for over two decades.
            </p>
            <p className="text-xs text-amber-100/90 mt-2 leading-relaxed">
              Filter by brand or HMA (Herd Management Area) to track original wild gathered lineages.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-800/60 flex items-center justify-between text-xs text-amber-200">
            <span>Established: 2004</span>
            <span className="px-2 py-0.5 bg-amber-800/80 rounded-md font-mono text-[10px]">v2.6 Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
