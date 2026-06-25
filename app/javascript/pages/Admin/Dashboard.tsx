
import AdminLayout from '@/components/layout/AdminLayout';
import { Horse } from '@/types';
import { formatHorsePrice } from '@/utils/horseHelpers';
import { usePage } from '@inertiajs/react';
import { Heart, DollarSign, ShieldAlert, Database, Users, TrendingUp } from 'lucide-react';


interface DashboardStatsProps {
    horses: Horse[];
}

export default function Dashboard({ horses }: DashboardStatsProps) {
   
    const activeHorses = horses.filter(h => !h.deceased);
    const totalCount = horses.length;
    const activeCount = activeHorses.length;
    const deceasedCount = horses.filter(h => h.deceased).length;
    const featuredCount = activeHorses.filter(h => h.featured).length;

    // Average Price calculation (excluding deceased)
    const horsesForSale = activeHorses.filter(h=>h.price && h.price > 0)
    const averagePrice = horsesForSale.filter(h=> h.price && h.price > 0).length > 0
        ? Math.round(horsesForSale.reduce((acc, h) => acc + (h.price || 0), 0) / horsesForSale.length)
        : 0;

    // Breed breakdown
    const breedCounts: Record<string, number> = {};
    horses.forEach(h => {
        breedCounts[h.breed] = (breedCounts[h.breed] || 0) + 1;
    });

    // HMA breakdown
    const hmaCounts: Record<string, number> = {};
    horses.forEach(h => {
        if (!h.deceased) {
            const hma = h.herd_management_area;
            hmaCounts[hma as string] = (hmaCounts[hma as string] || 0) + 1;
        }
    });

    // Sex breakdown
    const sexCounts: Record<string, number> = {};
    activeHorses.forEach(h => {
        sexCounts[h.sex] = (sexCounts[h.sex] || 0) + 1;
    });

    // Price ranges
    let budgetCount = 0; // < 1500
    let midCount = 0;    // 1500 - 3500
    let premiumCount = 0; // > 3500

    activeHorses.forEach(h => {
        if (h.price) {
            if (h.price < 1500) budgetCount++;
            else if (h.price <= 3500) midCount++;
            else premiumCount++;
        }
    });

    // Total investment valuation
    const totalValuation = activeHorses.reduce((sum, h) => sum + (h.price || 0), 0);




    return (
        <div className="space-y-6">
            {/* High-Level KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Registry */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Active Registry</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{activeCount} Horses</h3>
                            <p className="text-xs text-slate-400 mt-1">{totalCount} total registered ever</p>
                        </div>
                        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Average Price */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Avg Adoption Price</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{formatHorsePrice(averagePrice)}</h3>
                            <p className="text-xs text-emerald-500 flex items-center gap-0.5 mt-1 font-semibold">
                                <TrendingUp className="h-3 w-3" />

                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Featured highlights */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Featured Highlights</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{featuredCount} Showcased</h3>
                            <p className="text-xs text-slate-400 mt-1">Synced to public landing page</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400">
                            <Heart className="h-5 w-5 fill-current" />
                        </div>
                    </div>
                </div>

                {/* Deceased/Archived */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Historical Archive</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{deceasedCount} Deceased</h3>
                            <p className="text-xs text-slate-400 mt-1">Kept for genetic trace indices</p>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Side: Dynamic Visualizations */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Herd Management Area (HMA) Populations</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                Distribution of wild horses currently tracked in the database by their original capture ranges.
                            </p>
                        </div>

                        {/* Custom SVG/CSS Bar Chart */}
                        <div className="space-y-4">
                            {Object.entries(hmaCounts).map(([hma, count], i) => {
                                const percentage = (count / activeCount) * 100;
                                return (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{hma || "Domestic"}</span>
                                            <span className="text-slate-500 font-medium">{count} horse{count > 1 ? 's' : ''} ({Math.round(percentage)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                            <div
                                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Breed Distribution Pie Simulation */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Breed Distribution</h3>
                            <div className="space-y-3">
                                {Object.entries(breedCounts).map(([breed, count]) => {
                                    const percentage = (count / totalCount) * 100;
                                    return (
                                        <div key={breed} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${breed === 'Mustang' ? 'bg-amber-500' : 'bg-indigo-400'
                                                    }`}></span>
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">{breed}</span>
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-white">{count} ({Math.round(percentage)}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Price Ranges distribution */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Price Ranges (Value Tiers)</h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-slate-500">Value Tier (Under $1,500)</span>
                                        <span className="text-slate-800 dark:text-white font-bold">{budgetCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                        <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(budgetCount / activeCount) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-slate-500">Standard ($1,500 - $3,500)</span>
                                        <span className="text-slate-800 dark:text-white font-bold">{midCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(midCount / activeCount) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-slate-500">Premium ($3,500+)</span>
                                        <span className="text-slate-800 dark:text-white font-bold">{premiumCount}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(premiumCount / activeCount) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: System Info & Recent Events */}
                <div className="space-y-6">
                    {/* PostgreSQL & Server Health */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 shadow-lg space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Database className="h-4 w-4 text-emerald-400" />
                            <span>Production Server Health</span>
                        </h3>

                        <div className="space-y-3 divide-y divide-slate-800 text-xs">
                            <div className="flex justify-between pb-2.5">
                                <span className="text-slate-400">Database Engine</span>
                                <span className="font-mono text-emerald-400 font-semibold">{usePage().props.db_version.split('(')[0]}</span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span className="text-slate-400">Total Inventory Valuation</span>
                                <span className="font-mono text-white font-bold">{formatHorsePrice(totalValuation)}</span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span className="text-slate-400">Storage Provider</span>
                                <span className="font-mono text-amber-400 font-semibold">{usePage().props.storage_type?.toUpperCase() || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>


                </div>

            </div>
        </div>
    );
}
Dashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>