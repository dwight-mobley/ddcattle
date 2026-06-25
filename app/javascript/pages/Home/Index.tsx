import React, { ReactNode } from "react";
import Layout from "@/components/layout/Layout";
import { Horse } from "@/types";
import { formatHorsePrice } from "@/utils/horseHelpers";
import { Link } from "@inertiajs/react";

type FeaturedHorse = Horse & {profile_image_url: string}

interface Props {
  featuredHorses: FeaturedHorse[] ;
}

export default function HomeIndex({ featuredHorses }: Props) {

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative -mx-4 sm:-mx-8 lg:-mx-12 -mt-8 h-[85vh] min-h-[600px] bg-brand-dark flex items-center justify-center overflow-hidden">
        {/* Hero Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.jpg" alt="DDCattle Company Mustang Training" className="w-full h-full object-cover opacity-45 object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
          <span className="inline-block text-brand-cream bg-brand-clay/80 backdrop-blur-xs text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">✦ North Georgia's Premier Ranch</span>
          <h1 className="font-display text-5xl sm:text-7xl font-bold text-brand-cream tracking-tight">DDCattle Company</h1>
          <p className="font-display text-xl sm:text-2xl text-brand-tan/90 italic font-medium">Mustang Training</p>
          <p className="text-brand-cream/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-sans">Where heritage meets excellence. We specialize in preserving the spirit of the American Mustang through patient, dedicated horsemanship.</p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/horses" className="w-full sm:w-auto px-8 py-3.5 bg-brand-clay text-brand-cream font-medium rounded-md shadow-sm hover:bg-brand-clay/90 transition-all text-center">
              View Our Horses →
            </Link>
            <Link href="/contact" className="w-full sm:w-auto px-8 py-3.5 bg-white/10 backdrop-blur-xs text-brand-cream font-medium rounded-md border border-brand-cream/20 hover:bg-white/20 transition-all text-center">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Welcome/About Teaser Section */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-bold tracking-widest text-brand-clay uppercase block">📍 Out of North Georgia</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-dark">
            Welcome to <span className="text-brand-clay">DDCattle</span>
          </h2>
          <p className="text-gray-600 leading-relaxed">Founded by lifelong friends David Jones and Dwight Mobley, who share a deep passion for horses and cattle. With 19+ years of friendship behind them, we’ve created a unique ranch experience.</p>
          <p className="text-gray-600 leading-relaxed">Nestled in the beautiful hills of North Georgia, our ranch specializes in preserving the heritage of the American Mustang.</p>

          {/* Quick Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-brand-cream/40 border border-brand-tan/30 rounded-lg flex items-start gap-3">
              <span className="text-xl">🌟</span>
              <div>
                <h4 className="font-semibold text-brand-dark text-sm">Quality First</h4>
                <p className="text-xs text-gray-500">Excellence in every horse handled.</p>
              </div>
            </div>
            <div className="p-4 bg-brand-cream/40 border border-brand-tan/30 rounded-lg flex items-start gap-3">
              <span className="text-xl">🌿</span>
              <div>
                <h4 className="font-semibold text-brand-dark text-sm">Sustainable</h4>
                <p className="text-xs text-gray-500">Eco-friendly practices and pasture care.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Link href="/about" className="px-5 py-2.5 bg-brand-dark text-brand-cream rounded-md text-sm font-medium hover:bg-brand-dark/90 transition-colors">
              Learn Our Story
            </Link>
            <Link href="/horses" className="px-5 py-2.5 bg-white text-brand-dark border border-brand-tan rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              Meet the Horses
            </Link>
          </div>
        </div>

        {/* Feature Right Image Frame */}
        <div className="lg:col-span-7 relative">
          {/* Flex or Grid wrapper to sit the frames side-by-side with a gap */}
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-4/3 rounded-xl overflow-hidden border border-brand-tan bg-brand-cream shadow-xs">
              <img src="/images/about-feature.jpg" alt="Dwight on the ranch" className="w-full h-full object-cover" />
            </div>

            <div className="aspect-4/3 rounded-xl overflow-hidden border border-brand-tan bg-brand-cream shadow-xs">
              <img src="/images/david-x0WirGjp.jpeg" alt="David on the ranch" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Floating Badge - Absolute positioned relative to the parent frame container */}
          <div className="absolute -bottom-6 left-[35%] z-10 bg-white border border-brand-tan p-4 rounded-lg shadow-md text-center min-w-[120px]">
            <span className="block font-display text-2xl font-bold text-brand-clay">19+</span>
            <span className="text-xxs font-semibold uppercase tracking-wider text-gray-400">Years Horsemanship</span>
          </div>
        </div>
      </section>

      {/* 3. Explore Our Ranch Programs (Cards Side-by-Side) */}
      <section className="bg-brand-cream/-mx-4 sm:-mx-8 lg:-mx-12 bg-brand-cream/30 border-y border-brand-tan/20 py-20 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest text-brand-sage uppercase block">What We Offer</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-dark">
              Explore Our <span className="text-brand-sage">Ranch</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Program 1 */}
            <div className="relative group rounded-xl overflow-hidden aspect-16/10 border border-brand-tan shadow-xs bg-brand-dark">
              <img src="/images/program-horses.jpg" alt="Exceptional Horses" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-101 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-2">
                <h3 className="font-display text-2xl font-bold text-brand-cream">Exceptional Horses</h3>
                <p className="text-brand-cream/80 text-sm max-w-sm line-clamp-2">Our ranch is home to some of the finest horses in the region, bred for performance, temperament, and conformation.</p>
                <Link href="/horses" className="inline-flex items-center text-xs font-semibold text-brand-cream hover:underline pt-2">
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Program 2 */}
            <div className="relative group rounded-xl overflow-hidden aspect-16/10 border border-brand-tan shadow-xs bg-brand-dark">
              <img src="/images/titus.jpeg" alt="Training Programs" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-101 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-2">
                <h3 className="font-display text-2xl font-bold text-brand-cream">Training Programs</h3>
                <p className="text-brand-cream/80 text-sm max-w-sm line-clamp-2">With decades of experience, DDCattle offers specialized Mustang training programs for riders of all levels.</p>
                <Link href="/training" className="inline-flex items-center text-xs font-semibold text-brand-cream hover:underline pt-2">
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dynamic Featured Horses Section */}
      <section className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-widest text-brand-clay uppercase block">⭐️ Highlighted Partners</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-dark">Featured Horses</h2>
        </div>

        <div className="space-y-16">
          {featuredHorses.map((horse, idx) => (
            <div
              key={horse.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center border-b border-brand-tan/40 pb-16 last:border-0 last:pb-0 ${
                idx % 2 === 1 ? "lg:dir-rtl" : "" // Alternates side columns for visual balance
              }`}>
              {/* Card Image Block */}
              <div className="lg:col-span-5 lg:dir-ltr">
                <div className="aspect-16/10 rounded-xl overflow-hidden border border-brand-tan bg-brand-cream relative">
                  {horse?.profile_image_url &&  <img src={horse.profile_image_url} alt={horse.name} className="w-full h-full object-cover" /> || <div className="w-full h-full flex items-center justify-center text-brand-sage font-display italic font-semibold">{horse.name}</div>}
                  <span className="absolute top-4 left-4 bg-brand-clay text-brand-cream text-xxs uppercase tracking-wider font-bold px-2.5 py-1 rounded shadow-xs">★ Featured</span>
                 {horse.price && <span className="absolute bottom-4 left-4 bg-brand-clay text-brand-cream text-xxs uppercase tracking-wider font-bold px-2.5 py-1 rounded shadow-xs">{formatHorsePrice(horse.price)}</span>}
                </div>
              </div>

              {/* Card Text Content Block */}
              <div className="lg:col-span-7 space-y-4 lg:dir-ltr">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-3xl font-bold text-brand-dark">{horse.name}</h3>
                  <div className="flex gap-1 text-xxs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    <span>{horse.breed}</span>
                    <span>•</span>
                    <span>{horse.sex}</span>
                    {horse.birthdate && (
                      <>
                        <span>•</span>
                        <span>{new Date().getFullYear() - new Date(horse.birthdate).getFullYear()} Years Old</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed font-sans">{horse.description}</p>

                {/* Technical Metric Row */}
                <div className="grid grid-cols-2 gap-4 bg-brand-cream/20 p-3 rounded-lg border border-brand-tan/20 max-w-md">
                  <div>
                    <span className="block text-xxs uppercase text-gray-400 font-semibold tracking-wider">Color</span>
                    <span className="text-sm font-medium text-brand-dark">{horse.color || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="block text-xxs uppercase text-gray-400 font-semibold tracking-wider">Height</span>
                    <span className="text-sm font-medium text-brand-dark">{horse.height ? `${horse.height} HH` : "—"}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link href={`/horses/${horse.id}`} className="px-5 py-2.5 bg-brand-clay text-brand-cream rounded-md text-sm font-medium hover:bg-brand-clay/90 transition-colors">
                    Learn More About "{horse.name}" →
                  </Link>
                  <Link href="/horses" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-dark transition-colors">
                    View All Horses
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

HomeIndex.layout = (page: ReactNode) => <Layout>{page}</Layout>;
