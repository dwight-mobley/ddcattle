// pages/admin/AnimalsAdmin.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAnimalsQuery, useDeleteAnimalMutation } from '../../features/api/animalApi';

export default function AnimalsAdmin() {
    const { data: animals, isLoading, isError } = useGetAnimalsQuery();
    const [deleteAnimal, { isLoading: isDeleting }] = useDeleteAnimalMutation();
    const [animalToDelete, setAnimalToDelete] = useState(null);

    const confirmDelete = async () => {
        if (animalToDelete) {
            try {
                await deleteAnimal(animalToDelete.slug).unwrap();
                setAnimalToDelete(null);
            } catch (err) {
                console.error("Failed to delete animal:", err);
            }
        }
    };

    if (isLoading) return <div className="text-saddle-brown font-medium">Loading herd...</div>;
    if (isError) return <div className="text-rust font-medium">Error loading animals.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-saddle-brown">Herd Overview</h2>
                <Link 
                    to="/admin/animals/new"
                    className="bg-saddle-brown hover:bg-saddle-brown/90 text-desert-sand px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Add Animal
                </Link>
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-saddle-brown/10 overflow-hidden">
                <table className="min-w-full divide-y divide-saddle-brown/10">
                    <thead className="bg-sage/10">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-saddle-brown uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-saddle-brown uppercase tracking-wider">Species</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-saddle-brown uppercase tracking-wider">Sex</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-saddle-brown uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-saddle-brown uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-saddle-brown/10 bg-white">
                        {animals?.map((animal) => (
                            <tr key={animal.id} className="hover:bg-desert-sand/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-charcoal">{animal.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-charcoal/80 capitalize">{animal.species}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-charcoal/80 capitalize">{animal.sex}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${animal.status === 'active' ? 'bg-sage/20 text-sage' : 'bg-charcoal/10 text-charcoal'}`}>
                                        {animal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link 
                                        to={`/admin/animals/${animal.slug}/edit`} 
                                        className="text-sage hover:text-saddle-brown mr-4 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => setAnimalToDelete(animal)}
                                        className="text-rust hover:text-rust/80 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {animalToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm">
                    <div className="bg-desert-sand p-6 rounded-[var(--radius-xl)] shadow-xl max-w-md w-full border border-rust/20">
                        <h3 className="text-lg font-serif font-bold text-rust mb-2">Delete {animalToDelete.name}?</h3>
                        <p className="text-charcoal/80 text-sm mb-6">
                            Are you sure you want to delete this {animalToDelete.species}? This action is permanent and will remove all associated media and medical records.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setAnimalToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-charcoal bg-white border border-saddle-brown/20 rounded-lg hover:bg-sage/10 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-rust rounded-lg hover:bg-rust/90 transition-colors flex items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}