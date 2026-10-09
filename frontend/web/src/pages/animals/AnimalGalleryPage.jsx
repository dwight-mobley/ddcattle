import MediaGallery from '../../components/MediaGallery';
import { useOutletContext } from 'react-router-dom';

export default function AnimalGalleryPage() {
  const { animal } = useOutletContext();
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <MediaGallery
        key={animal.id}
        animalId={animal.id}
        animalName={animal.name}
      />
    </main>
  );
}