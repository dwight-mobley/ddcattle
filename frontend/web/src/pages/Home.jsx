import React from 'react';
import { useGetHorsesQuery } from '../features/horse/horseApi';
import { Link } from 'react-router-dom';
import { HorseCard } from '../components/HorseCard';
import { useGetFeaturedAnimalsQuery } from '../features/api/animalApi';
import Loader from '../components/Loader';
import { AnimalCard } from '../components/AnimalCard';

export default function RanchHome() {
  const { data: featuredAnimals=[], isLoading, isError } = useGetFeaturedAnimalsQuery(); 
  if (isLoading) return <Loader/>;
  if (isError) return <p>Error loading horses.</p>;
  return (
    <main className="w-full min-h-screen">
      
      {/* Hero Section: Epic, sweeping imagery */}
      <section className="relative w-full h-[85vh] flex items-center justify-center bg-saddle-brown">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="images/491d6900-da7c-437d-bb29-af1101e03c88_C_xBEjnAX.jpeg" 
            alt="Mustangs running in open pasture" 
            className="w-full h-full object-cover opacity-65 mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center mt-12">
          <h1 className="text-5xl md:text-7xl font-serif text-desert-sand font-bold tracking-wide uppercase drop-shadow-lg">
            Spirit of the West
          </h1>
          <p className="mt-6 text-lg md:text-xl text-desert-sand/90 font-light max-w-2xl drop-shadow-md">
            Preserving the heritage, resilience, and natural conformation of the American Mustang.
          </p>
          <Link to="/barn" className="mt-10 px-8 py-4 bg-rust text-desert-sand font-semibold rounded-xl hover:bg-saddle-brown transition-all duration-300 uppercase tracking-wider text-sm border border-transparent hover:border-desert-sand/50 shadow-xl">
           Tour The Barn
          </Link>
        </div>
      </section>

      {/* Narrative Section: Emulating "From Pasture to Progress" */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-saddle-brown mb-8 leading-tight">
            A Legacy Built on Resilience
          </h2>
          <p className="text-charcoal/80 mb-6 leading-relaxed text-lg">
            Mustangs represent a unique chapter in equestrian history. Decades of dedicated horsemanship form the foundation of our approach, allowing us to understand the distinct nuances of gentle training and specialized care these animals require. 
          </p>
          <p className="text-charcoal/80 mb-8 leading-relaxed text-lg">
            Whether evaluating behavioral traits, assessing conformation, or managing daily medical records, our facility is dedicated to bringing out the best in their natural intelligence and spirit.
          </p>
          <a href="/about" className="text-rust font-bold hover:text-saddle-brown underline underline-offset-8 decoration-2 transition-colors">
            Discover Our Story
          </a>
        </div>
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl border-4 border-white">
           <img 
            src="images/20260525213209817859.jpeg" 
            alt="Mustang horse portrait" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      </section>

      {/* Grid Showcase: Mapping RTK Query Data */}
      <section className="bg-sage/15 py-24 border-y border-sage/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-serif text-saddle-brown mb-4">DD Spotlight</h3>         
          <p className="text-charcoal/70 max-w-2xl mx-auto mb-16">
            Checkout our featured animals in the spotlight section below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
            {featuredAnimals.map(fa => (
             <AnimalCard
               key={fa.id}
               animal={fa}
             />
            ))}
        
          </div>
        </div>
      </section>
      
    </main>
  );
}