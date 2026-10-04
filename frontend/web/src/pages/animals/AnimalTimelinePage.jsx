import React from 'react';
import { useParams } from 'react-router-dom';
import AnimalTimeline from '../../components/animals/timeline/AnimalTimeline';
import { useOutletContext } from 'react-router-dom';

export default function AnimalTimelinePage() {
  const {slug} = useParams()
  const {animal} = useOutletContext();   
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <AnimalTimeline
        slug={slug}
        animalName={animal.name}
      />
    </main>
  );
}