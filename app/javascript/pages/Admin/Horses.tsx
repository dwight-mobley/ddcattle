import React, { useState, useMemo } from 'react';
import { Horse } from '@/types';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Weight,
    Ruler,
    MapPin,
    X,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Link } from '@inertiajs/react';

interface HorseTableProps {
    horses: Horse[];
}

export default function HorseTable({ horses }: HorseTableProps) {
    const [search, setSearch] = useState('');
    const [breed, setBreed] = useState('');
    const [sex, setSex] = useState('');
    const [hma, setHma] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'hma' | 'weight' | 'height'>(
        'name'
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const breeds = useMemo(
        () => [...new Set(horses.map((h) => h.breed).filter(Boolean))],
        [horses]
    );
    const sexes = useMemo(
        () => [...new Set(horses.map((h) => h.sex).filter(Boolean))],
        [horses]
    );
    const hmas = useMemo(
        () => [
            ...new Set(
                horses.map((h) => h.herd_management_area).filter(Boolean) as string[]
            ),
        ],
        [horses]
    );

    const filteredHorses = useMemo(() => {
        const q = search.toLowerCase().trim();
        return horses.filter((horse) => {
            const matchesSearch =
                !q ||
                horse.name.toLowerCase().includes(q) ||
                horse.breed.toLowerCase().includes(q) ||
                (horse.herd_management_area &&
                    horse.herd_management_area.toLowerCase().includes(q)) ||
                (horse.color && horse.color.toLowerCase().includes(q));
            const matchesBreed = !breed || horse.breed === breed;
            const matchesSex = !sex || horse.sex === sex;
            const matchesHma = !hma || horse.herd_management_area === hma;
            return matchesSearch && matchesBreed && matchesSex && matchesHma;
        });
    }, [horses, search, breed, sex, hma]);

    const sortedHorses = useMemo(() => {
        const copy = [...filteredHorses];
        return copy.sort((a, b) => {
            let fieldA: any = a[sortBy as keyof Horse];
            let fieldB: any = b[sortBy as keyof Horse];

            if (sortBy === 'weight' || sortBy === 'height') {
                fieldA = Number(fieldA) || 0;
                fieldB = Number(fieldB) || 0;
                return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
            }

            const aStr = String(fieldA ?? '').toLowerCase();
            const bStr = String(fieldB ?? '').toLowerCase();
            return sortOrder === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
        });
    }, [filteredHorses, sortBy, sortOrder]);

    const totalItems = sortedHorses.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedHorses = sortedHorses.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage
    );

    const hasActiveFilters = search || breed || sex || hma;

    const resetFilters = () => {
        setSearch('');
        setBreed('');
        setSex('');
        setHma('');
        setCurrentPage(1);
    };

    const handleFilterChange = (setter: (v: string) => void, v: string) => {
        setter(v);
        setCurrentPage(1);
    };

    const toggleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const SortHeader = ({
        field,
        children,
        align = 'left',
    }: {
        field: typeof sortBy;
        children: React.ReactNode;
        align?: 'left' | 'center' | 'right';
    }) => (
        <th
            onClick={() => toggleSort(field)}
            className={`px-3 py-3 text-${align} text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100/60 transition group whitespace-nowrap`}
        >
            <div
                className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''
                    } ${align === 'center' ? 'justify-center' : ''}`}
            >
                {children}
                <ArrowUpDown
                    className={`h-3 w-3 transition-colors ${sortBy === field
                            ? 'text-indigo-600'
                            : 'text-slate-300 group-hover:text-slate-400'
                        }`}
                />
            </div>
        </th>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Horse Registry
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {totalItems} {totalItems === 1 ? 'horse' : 'horses'} found
                        </p>
                    </div>

                    <Link
                        href="/admin/horses/new"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                    >
                        <Plus className="h-4 w-4" />
                        Add Horse
                    </Link>

                </div>

                {/* Filter Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    {/* Search */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name, breed, HMA, or color..."
                                value={search}
                                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    {/* Filter dropdowns */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Breed
                            </label>
                            <select
                                value={breed}
                                onChange={(e) => handleFilterChange(setBreed, e.target.value)}
                                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                            >
                                <option value="">All breeds</option>
                                {breeds.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Sex
                            </label>
                            <select
                                value={sex}
                                onChange={(e) => handleFilterChange(setSex, e.target.value)}
                                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                            >
                                <option value="">All sexes</option>
                                {sexes.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                HMA
                            </label>
                            <select
                                value={hma}
                                onChange={(e) => handleFilterChange(setHma, e.target.value)}
                                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                            >
                                <option value="">All HMAs</option>
                                {hmas.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="px-4 pb-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                                <span className="text-slate-500">Active filters:</span>
                                {search && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        "{search}"
                                    </span>
                                )}
                                {breed && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {breed}
                                    </span>
                                )}
                                {sex && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {sex}
                                    </span>
                                )}
                                {hma && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {hma}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                            >
                                <X className="h-3 w-3" />
                                Reset
                            </button>
                        </div>
                    )}
                </div>

                {/* Table Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-200">
                                    <SortHeader field="name">Name</SortHeader>
                                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Breed
                                    </th>
                                    <SortHeader field="hma">HMA</SortHeader>
                                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Sex
                                    </th>
                                    <SortHeader field="weight" align="center">
                                        Weight
                                    </SortHeader>
                                    <SortHeader field="height" align="center">
                                        Height
                                    </SortHeader>
                                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedHorses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <p className="text-slate-700 font-semibold">
                                                No horses found
                                            </p>
                                            <p className="text-slate-500 text-xs mt-1">
                                                Try adjusting your filters
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedHorses.map((horse) => (
                                        <tr
                                            key={horse.id}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-slate-900">
                                                    {horse.name}
                                                </div>
                                                {horse.color && (
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {horse.color}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-slate-700">
                                                {horse.breed}
                                            </td>
                                            <td className="px-3 py-3 text-slate-700">
                                                <div className="inline-flex items-center gap-1 max-w-[200px]">
                                                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {horse.herd_management_area || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                                    {horse.sex}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-slate-700">
                                                    <Weight className="h-3 w-3 text-slate-400" />
                                                    {horse.weight ? `${horse.weight} lbs` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-slate-700">
                                                    <Ruler className="h-3 w-3 text-slate-400" />
                                                    {horse.height ? `${horse.height} hh` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 font-bold text-red-800">
                                                <div className="flex items-center justify-end gap-1.5">


                                                    <Link
                                                        href={`/admin/horses/${horse.id}/edit`}
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition"
                                                        title="Edit"
                                                        aria-label="Edit horse"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />

                                                    </Link>


                                                    <Link
                                                        href={`/admin/horses/${horse.id}`}
                                                        method='delete'
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
                                                        title="Delete"
                                                        aria-label="Delete horse"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Link>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {paginatedHorses.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-slate-700 font-semibold">No horses found</p>
                                <p className="text-slate-500 text-xs mt-1">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            paginatedHorses.map((horse) => (
                                <div key={horse.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="font-semibold text-slate-900 truncate">
                                                {horse.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {horse.breed} {horse.color && `· ${horse.color}`}
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium shrink-0">
                                            {horse.sex}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                        <span className="truncate">
                                            {horse.herd_management_area || 'No HMA'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <div className="flex items-center gap-3 text-xs text-slate-700">
                                            <span className="inline-flex items-center gap-1">
                                                <Weight className="h-3 w-3 text-slate-400" />
                                                {horse.weight ? `${horse.weight} lbs` : '—'}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Ruler className="h-3 w-3 text-slate-400" />
                                                {horse.height ? `${horse.height} hh` : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={`/admin/horses/${horse.id}/edit`}
                                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition"
                                                title="Edit"
                                                aria-label="Edit horse"
                                            >
                                                <Edit className="h-3.5 w-3.5" />

                                            </Link>


                                            <Link
                                                href={`/admin/horses/${horse.id}`}
                                                method='delete'
                                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
                                                title="Delete"
                                                aria-label="Delete horse"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-3 flex items-center justify-between gap-2">
                            <div className="text-xs text-slate-600">
                                Page <span className="font-semibold">{safePage}</span> of{' '}
                                <span className="font-semibold">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={safePage === 1}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Prev
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                                    }
                                    disabled={safePage === totalPages}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

HorseTable.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>