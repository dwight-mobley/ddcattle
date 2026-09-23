import { Link } from 'react-router-dom';
import  {horsesApi} from '../features/horse/horseApi';

export const HorseCard = ({ horse }) => {
  const prefetch = horsesApi.usePrefetch('getHorseBySlug');
 
    return (
        <div key={horse.id} className="bg-desert-sand rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-sage/20 group cursor-pointer flex flex-col overflow-hidden">
              <div className="h-72 overflow-hidden">
                <img 
                  src={horse.profile_image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Mustang profile"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h4 className="text-2xl font-serif text-saddle-brown">{horse.name}</h4>
                <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">Sex: {horse.sex} </p>
                <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">Age: {horse.age}</p>
                <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">
                  Color: {horse.color}
                </p>
                {horse.breed == 'MUSTANG' && (
                  <div>
                    <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">Mustang</p>
                    <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">{horse.blm_brand}</p>
                    <p className="text-sm font-semibold text-sage mt-1 uppercase tracking-wider">{horse.herd_management_area}</p>
                  </div>
                )}
                <p className="text-base text-charcoal/80 mt-4 line-clamp-3">
                  {horse.notes}
                </p>
                <div className="mt-auto pt-6">
                  <Link to={`/horse/${horse.slug}`} onMouseEnter={() => prefetch(horse.slug, {force:true})} className="text-sm font-bold text-rust group-hover:text-saddle-brown transition-colors">
                    View Profile &rarr;
                  </Link>
                </div>
              </div>
              
            </div>
    );
};