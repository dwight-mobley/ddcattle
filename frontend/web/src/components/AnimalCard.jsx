import { Link } from 'react-router-dom';
import { animalApi } from '../features/api/animalApi';
import ImageWithLoader  from './ImageWithLoader';

export const AnimalCard = ({ animal }) => {
  const prefetch = animalApi.usePrefetch('getAnimalBySlug');

  return (
    <div key={animal.id} className="bg-desert-sand rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-sage/20 group cursor-pointer flex flex-col overflow-hidden">
      <div className="h-72 overflow-hidden bg-saddle-brown/5 flex items-center justify-center">
        {animal.profile_image ? (
          <ImageWithLoader
            src={animal.profile_image} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt={`${animal.name} profile`}
          />
        ) : (
          <span className="text-saddle-brown/40 font-serif text-lg">No Image</span>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h4 className="text-2xl font-serif text-saddle-brown">{animal.name}</h4>
          <span className="text-xs font-bold uppercase px-2 py-1 bg-sage/20 text-saddle-brown rounded-full">
            {animal.species}
          </span>
        </div>

        <p className="text-sm font-semibold text-sage mt-2 uppercase tracking-wider">Sex: {animal.sex}</p>
        {animal.age && <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">Age: {animal.age}</p>}
        {animal.color && <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">Color: {animal.color}</p>}
        {animal.breed && <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">Breed: {animal.breed}</p>}

        {/* DYNAMIC SPECIES-SPECIFIC DETAILS */}
        <div className="mt-2">
          {/* HORSE DETAILS */}
          {animal.species === 'horse' && (
            <div className="space-y-1 pt-2 border-t border-sage/10">
              {animal.height && <p className="text-sm font-semibold text-sage uppercase tracking-wider">Height: {animal.height} hands</p>}
              {animal.brand && <p className="text-sm font-semibold text-sage uppercase tracking-wider">Brand: {animal.brand}</p>}
              {animal.herd_management_area && <p className="text-sm font-semibold text-sage uppercase tracking-wider">HMA: {animal.herd_management_area}</p>}
            </div>
          )}

          {/* DOG DETAILS */}
          {animal.species === 'dog' && (
            <div className="space-y-1 pt-2 border-t border-sage/10">
              {animal.microchip_number && <p className="text-sm font-semibold text-sage uppercase tracking-wider">Microchip: {animal.microchip_number}</p>}
              {animal.spayed_neutered !== undefined && (
                <p className="text-sm font-semibold text-sage uppercase tracking-wider">
                  {animal.spayed_neutered ? 'Spayed / Neutered' : 'Intact'}
                </p>
              )}
            </div>
          )}

          {/* CATTLE DETAILS */}
          {animal.species === 'cattle' && (
            <div className="space-y-1 pt-2 border-t border-sage/10">
              {animal.ear_tag && <p className="text-sm font-semibold text-sage uppercase tracking-wider">Ear Tag: {animal.ear_tag}</p>}
              {animal.brand && <p className="text-sm font-semibold text-sage uppercase tracking-wider">Brand: {animal.brand}</p>}
            </div>
          )}
        </div>

        {/* DESCRIPTION / NOTES */}
        {(animal.description || animal.notes) && (
          <p className="text-base text-charcoal/80 mt-4 line-clamp-3">
            {animal.description || animal.notes}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Link 
            to={`/animals/${animal.slug}`} 
            onMouseEnter={() => prefetch(animal.slug, { force: true })} 
            className="text-sm font-bold text-rust group-hover:text-saddle-brown transition-colors"
          >
            View Profile &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};