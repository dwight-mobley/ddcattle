import React, { ReactNode, useState } from 'react';
import { Horse } from '@/types';
import { formatHorsePrice, isForSale } from '@/utils/horseHelpers';
import Layout from '@/components/layout/Layout';
import { Link, usePage } from '@inertiajs/react';

interface Props {
  horses: Horse[];
}

export default function HorseIndex({ horses }: Props) {
  const { auth } = usePage().props
  // Simple filter state so users can toggle between all horses vs only those for sale
  const [filterForSale, setFilterForSale] = useState<boolean>(false);

  // Filter out deceased horses first, then apply "For Sale" filter if active
  const activeHorses = horses
    .filter(horse => !horse.deceased)
    .filter(horse => !filterForSale || isForSale(horse));

  return (
    <>
      {/* Hero Header */}
      <div className="mb-12 border-b border-brand-tan pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Meet the Herd
        </h1>
        <p className="text-gray-600 max-w-2xl leading-relaxed">
          Raised on the open range, refined by hand. Our mustangs are carefully gentled, trained, and prepared for their next partnership.
        </p>

        {/* Filter Toggles */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setFilterForSale(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!filterForSale
              ? 'bg-brand-dark text-brand-cream shadow-xs'
              : 'bg-white text-brand-dark border border-brand-tan hover:bg-gray-50'
              }`}
          >
            All Horses
          </button>
          <button
            onClick={() => setFilterForSale(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterForSale
              ? 'bg-brand-clay text-brand-cream shadow-xs'
              : 'bg-white text-brand-dark border border-brand-tan hover:bg-gray-50'
              }`}
          >
            Available For Sale
          </button>
          {auth?.user &&
            <Link
              href="/horses/new"
              className={`px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white`}
            >
              + Add New
            </Link>
          }
        </div>
      </div>

      {/* Grid Layout */}
      {activeHorses.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-brand-tan rounded-xl bg-white">
          <p className="text-gray-500 font-medium">No horses currently match this criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeHorses.map((horse) => (
            <div
              key={horse.id}
              className="bg-white border border-brand-tan rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image Window */}
              <div className="h-64 bg-brand-tan relative overflow-hidden">
                {horse.images && horse.images.length > 0 ? (
                  <img
                    src={horse.images[0]}
                    alt={horse.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  // Elegant silhouette/placeholder using brand colors
                  <div className="w-full h-full flex items-center justify-center bg-brand-sage/20 text-brand-sage font-display text-xl italic font-semibold">
                    {horse.name}
                  </div>
                )}

                {/* Badge Overlay for Featured Horses */}
                {horse.featured && (
                  <span className="absolute top-3 left-3 bg-brand-clay text-brand-cream text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded shadow-xs">
                    Featured Partner
                  </span>
                )}
              </div>

              {/* Content Block */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-baseline mb-1 gap-3">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-brand-dark">
                      {horse.name}
                    </h2>
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Age {horse.foal_year ? (new Date().getFullYear() - horse.foal_year) : 'Unknown'}
                    </span>
                    {auth.user &&
                      <Link href={`/horses/${horse.id}/edit`} className='text-xs font-mono bg-yellow-100 text-gray-600 px-2 py-0.5 rounded'>Edit</Link>
                    }
                  </div>

                  {/* Subtitle Details */}
                  <p className="text-sm font-medium text-brand-sage mb-3">
                    {horse.color} {horse.breed} {horse.herd_management_area ? `• From ${horse.herd_management_area}` : ''}
                  </p>

                  {/* Truncated Description */}
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {horse.description || "No description provided yet for this ranch partner."}
                  </p>
                </div>

                {/* Footer details inside Card */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="block text-xxs uppercase tracking-wider text-gray-400 font-semibold">Price</span>
                    <span className="font-semibold text-brand-dark">
                      {formatHorsePrice(horse.price)}
                    </span>
                  </div>

                  <Link
                    href={`/horses/${horse.id}`}
                    className="inline-flex items-center text-sm font-medium text-brand-clay hover:text-brand-dark transition-colors"
                  >
                    View Details
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                {auth.user &&
                  <div>
                    <Link href={`/horses/${horse.id}`} method="delete" className='bg-red-600 text-white p-3 rounded'>Delete</Link>
                  </div>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

HorseIndex.layout = (page: ReactNode) => <Layout>{page}</Layout>