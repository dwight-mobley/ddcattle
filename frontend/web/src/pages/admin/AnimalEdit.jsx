// pages/admin/AnimalEdit.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimalForm from '../../components/forms/AnimalForm';
import { useGetAnimalBySlugQuery, useUpdateAnimalMutation } from '../../features/api/animalApi';

export default function AnimalEdit() {
    const { slug } = useParams();
    const navigate = useNavigate();
    
    // Fetch existing animal data based on the URL parameter
    const { data: animal, isLoading: isFetching, isError } = useGetAnimalBySlugQuery(slug);
    const [updateAnimal, { isLoading: isUpdating }] = useUpdateAnimalMutation();

    const handleUpdate = async (formData) => {
        try {
            await updateAnimal({ slug, ...formData }).unwrap();
            navigate('/admin/animals'); // Redirect on success
        } catch (err) {
            console.error('Failed to update animal:', err);
        }
    };

    if (isFetching) return <div className="text-saddle-brown">Loading animal details...</div>;
    if (isError || !animal) return <div className="text-rust">Failed to load animal data.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="font-serif text-2xl font-bold text-saddle-brown">Edit {animal.name}</h2>
                <p className="text-charcoal/70 text-sm mt-1">Update the profile and status information.</p>
            </div>
            <AnimalForm 
                initialData={animal} 
                onSubmit={handleUpdate} 
                isLoading={isUpdating} 
            />
        </div>
    );
}