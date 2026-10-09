import { useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useGetAnimalBySlugQuery } from '../../features/api/animalApi';
import ImageWithLoader from '../../components/ImageWithLoader';

import InquiryModal from '../../components/InquiryModal';
import ErrorPage from '../Error';
import Loader from '../../components/Loader';



import AnimalNav from '../../components/animals/AnimalNav';

export default function AnimalDetails() {
  const { slug } = useParams();

  // State For Modal
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Fetch animal using your generalized RTK Query hook
  const { data: animal, isLoading, isFetching, error } = useGetAnimalBySlugQuery(slug);

  if (isLoading || (!animal && isFetching)) {
    return <Loader />;
  }

  if (error) {
    if (error?.status === 404) {
      return <ErrorPage />;
    }
    return <p className="text-center py-24 text-rust font-serif text-xl">Error loading animal details.</p>;
  }

  if (!animal) {
    return <ErrorPage />;
  }


  return (
    <div className="min-h-screen bg-desert-sand font-sans text-charcoal selection:bg-rust selection:text-white pb-24">

      {/* Hero Section */}
      <header className="relative w-full h-[60vh] bg-saddle-brown">
        <div className="absolute inset-0">
          <ImageWithLoader
            src={animal.profile_image}
            alt={animal.name}
            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent"></div>
        </div>

        <div className="absolute bottom-0 w-full px-6 md:px-12 pb-12 max-w-7xl mx-auto left-0 right-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase px-3 py-1 bg-sage text-white rounded-full tracking-wider">
                {animal.species}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-2 drop-shadow-lg">
              {animal.name}
            </h1>
            {/* Conditional Sub-heading metadata based on species */}
            {animal.species === 'horse' && animal.brand && (
              <p className="text-xl text-sage font-light tracking-wide font-serif">
                BLM Freezemark: <span className="font-semibold text-white">{animal.brand}</span>
              </p>
            )}
            {animal.species === 'dog' && animal.microchip_number && (
              <p className="text-xl text-sage font-light tracking-wide font-serif">
                Microchip: <span className="font-semibold text-white">{animal.microchip_number}</span>
              </p>
            )}
            {animal.species === 'cattle' && animal.ear_tag && (
              <p className="text-xl text-sage font-light tracking-wide font-serif">
                Ear Tag: <span className="font-semibold text-white">{animal.ear_tag}</span>
              </p>
            )}
          </div>
          <div className="hidden md:flex gap-4 mb-2 text-white/90 uppercase tracking-widest text-sm font-semibold">
            {animal.color && <span>{animal.color}</span>}
            {animal.color && animal.sex && <span>•</span>}
            {animal.sex && <span>{animal.sex}</span>}
          </div>
           <div className="p-8 pt-0 mt-4">
                <button onClick={() => setIsModalOpen(true)} className="w-full py-4 px-4 bg-rust text-white font-semibold rounded hover:cursor-pointer hover:bg-saddle-brown transition-all duration-300 uppercase tracking-widest text-sm shadow-md">
                  Inquire About {animal.name}
                </button>
              </div>
        </div>
      </header>


      <AnimalNav slug={slug} species={animal.species} />
      <Outlet context={{animal }} />

     
      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        animal={animal}
        slug={slug}
      />
    </div>
  );
}

