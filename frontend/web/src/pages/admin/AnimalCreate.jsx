import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalForm from '../../components/forms/AnimalForm';
import { useAddAnimalMutation } from '../../features/api/animalApi';

export default function AnimalCreate() {
    const navigate = useNavigate();
    const [addAnimal, { isLoading }] = useAddAnimalMutation();

    const handleCreate = async (formData) => {
        try {
            await addAnimal(formData).unwrap();
            navigate('/admin/animals'); // Redirect back to list on success
        } catch (err) {
            console.error('Failed to create animal:', err);
            // Handle error state/toast notification here
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="font-serif text-2xl font-bold text-saddle-brown">Add New Animal</h2>
                <p className="text-charcoal/70 text-sm mt-1">Enter the details for the new addition to the herd.</p>
            </div>
            <AnimalForm onSubmit={handleCreate} isLoading={isLoading} />
        </div>
    );
}