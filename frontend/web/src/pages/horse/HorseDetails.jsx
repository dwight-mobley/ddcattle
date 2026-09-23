import React, { useState } from 'react';
import { useParams, useLoaderData, Link } from 'react-router-dom';
import { useGetAnimalBySlugQuery } from '../../features/api/animalApi';
import { store } from '../../store';
import ImageWithLoader from '../../components/ImageWithLoader';
import VideoWithLoader from '../../components/VideoWithLoader';




export default function HorseDetails() {

  const { slug } = useParams();

  // State for pagination/load-more of media gallery (efficiently handles hundreds of images)
  const [visibleMediaCount, setVisibleMediaCount] = useState(12);
  const mediaIncrement = 12;

  // Simulated RTK Query hook matching your Django serialization
  const { data: horse, isLoading, error } = useGetAnimalBySlugQuery(slug);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading horse details.</p>;
  }


  // Slice the media array for performance optimization with large media libraries
  const displayedMedia = horse.media ? horse.media.slice(0, visibleMediaCount) : [];
  const hasMoreMedia = horse.media && visibleMediaCount < horse.media.length;

  return (
    <div className="min-h-screen bg-desert-sand font-sans text-charcoal selection:bg-rust selection:text-white pb-24">



      {/* Hero Section */}
      <header className="relative w-full h-[60vh] bg-saddle-brown">
        <div className="absolute inset-0">
          <ImageWithLoader
            src={horse.profile_image}
            alt={horse.name}
            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent"></div>
        </div>

        <div className="absolute bottom-0 w-full px-6 md:px-12 pb-12 max-w-7xl mx-auto left-0 right-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-2 drop-shadow-lg">
              {horse.name}
            </h1>
            {horse.brand && (
              <p className="text-xl text-sage font-light tracking-wide font-serif">
                BLM Freezemark: <span className="font-semibold text-white">{horse.brand}</span>
              </p>
            )}
          </div>
          <div className="hidden md:flex gap-4 mb-2 text-white/90 uppercase tracking-widest text-sm font-semibold">
            <span>{horse.color}</span>
            <span>•</span>
            <span>{horse.sex}</span>
            <span>•</span>
            <span>{horse.foal_year}</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

          {/* Left Column: Narrative (Takes up 7 cols) */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-3xl font-serif text-saddle-brown mb-6">About {horse.name}</h2>
              {horse.description ? (
                <p className="text-lg leading-relaxed text-charcoal/80 whitespace-pre-line">
                  {horse.description}
                </p>
              ) : (
                <p className="text-lg italic text-charcoal/50">No description provided.</p>
              )}
            </section>

            {(horse.sire || horse.dam) && (
              <section className="border-t border-sage/30 pt-10">
                <h3 className="text-2xl font-serif text-saddle-brown mb-6">Lineage</h3>
                <div className="grid grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-sm border border-sage/10">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-sage font-bold mb-1">Sire</p>
                    <p className="text-lg font-serif text-charcoal">{horse.sire || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-sage font-bold mb-1">Dam</p>
                    <p className="text-lg font-serif text-charcoal">{horse.dam || 'Unknown'}</p>
                  </div>
                </div>
              </section>
            )}

            {horse.notes && (
              <section className="bg-sage/10 p-8 rounded-xl border-l-4 border-rust">
                <h4 className="text-sm uppercase tracking-widest text-saddle-brown font-bold mb-3">Trainer Notes</h4>
                <p className="text-charcoal/80 leading-relaxed">
                  {horse.notes}
                </p>
              </section>
            )}
          </div>

          {/* Right Column: Specs Sidebar (Takes up 5 cols) */}
          <aside className="lg:col-span-5 relative">
            <div className="sticky top-10 bg-white rounded-2xl shadow-xl border border-sage/20 overflow-hidden">

              <div className="bg-saddle-brown p-6 text-center">
                <h3 className="text-2xl font-serif text-desert-sand">Heritage & Specs</h3>
              </div>

              <dl className="p-8 grid grid-cols-1 gap-y-6 text-sm">
                {horse.herd_management_area && (
                  <div className="flex justify-between pb-4 border-b border-sage/20">
                    <dt className="text-sage font-bold uppercase tracking-widest">HMA Origin</dt>
                    <dd className="font-semibold text-charcoal text-right">{horse.herd_management_area}</dd>
                  </div>
                )}

                {horse.adoption_date && (
                  <div className="flex justify-between pb-4 border-b border-sage/20">
                    <dt className="text-sage font-bold uppercase tracking-widest">Adoption Date</dt>
                    <dd className="font-semibold text-charcoal">{new Date(horse.adoption_date).toLocaleDateString()}</dd>
                  </div>
                )}

                <div className="flex justify-between pb-4 border-b border-sage/20">
                  <dt className="text-sage font-bold uppercase tracking-widest">Sex</dt>
                  <dd className="font-semibold text-charcoal capitalize">{horse.sex}</dd>
                </div>

                <div className="flex justify-between pb-4 border-b border-sage/20">
                  <dt className="text-sage font-bold uppercase tracking-widest">Age</dt>
                  <dd className="font-semibold text-charcoal">{horse.age}</dd>
                </div>

                <div className="flex justify-between pb-4 border-b border-sage/20">
                  <dt className="text-sage font-bold uppercase tracking-widest">Height</dt>
                  <dd className="font-semibold text-charcoal">{horse.height ? `${horse.height} hh` : '--'}</dd>
                </div>

                <div className="flex justify-between pb-4 border-b border-sage/20">
                  <dt className="text-sage font-bold uppercase tracking-widest">Weight</dt>
                  <dd className="font-semibold text-charcoal">{horse.weight ? `${Math.round(horse.weight)} lbs` : '--'}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-sage font-bold uppercase tracking-widest">Status</dt>
                  <dd className="font-semibold text-charcoal">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider ${horse.status === 'active' ? 'bg-sage/20 text-saddle-brown' : 'bg-rust/20 text-rust'
                      }`}>
                      {horse.status}
                    </span>
                  </dd>
                </div>
              </dl>

              <div className="p-8 pt-0 mt-4">
                <button className="w-full py-4 bg-rust text-white font-semibold rounded-xl hover:bg-saddle-brown transition-all duration-300 uppercase tracking-widest text-sm shadow-md">
                  Inquire About {horse.name}
                </button>
              </div>
            </div>
          </aside>

        </div>

        {/* Media Gallery Section with Performance Load More */}
        {horse.media && horse.media.length > 0 && (
          <section className="pt-16 border-t border-sage/30">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
              <h2 className="text-4xl font-serif text-saddle-brown">Gallery</h2>
              <span className="text-sage font-semibold uppercase tracking-widest text-sm mt-2 sm:mt-0">
                Showing {displayedMedia.length} of {horse.media.length} Items
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedMedia.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-sage/20 bg-saddle-brown group ${item.media_type === 'video' ? 'col-span-1 sm:col-span-2 aspect-video' : 'aspect-square'
                    }`}
                >
                  {item.media_type === 'image' ? (
                    <ImageWithLoader
                      src={item.file}
                      alt={item.description}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <VideoWithLoader
                      src={item.file}
                      poster={item.file}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
              ))}
            </div>

            {hasMoreMedia && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleMediaCount(prev => prev + mediaIncrement)}
                  className="px-10 py-4 border-2 border-saddle-brown text-saddle-brown font-bold rounded-xl hover:bg-saddle-brown hover:text-white transition-all duration-300 uppercase tracking-widest text-sm"
                >
                  Load More Media
                </button>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}