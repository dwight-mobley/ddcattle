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
        <div className="min-w-0 space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="font-serif text-xl font-bold text-saddle-brown">Herd Overview</h2>
                <Link 
                    to="/admin/animals/new"
                    className="inline-flex w-full sm:w-auto min-h-11 sm:min-h-0 items-center justify-center bg-saddle-brown hover:bg-saddle-brown/90 text-desert-sand px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Add Animal
                </Link>
            </div>

            <ul className="grid gap-3 md:hidden">
                {animals?.map(animal => (
                    <li key={animal.id} className="min-w-0 rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 shadow-sm">
                        <h3 className="break-words font-serif font-bold text-saddle-brown">{animal.name}</h3>
                        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="min-w-0"><dt className="text-charcoal/60">Species</dt><dd className="break-words capitalize text-charcoal">{animal.species}</dd></div>
                            <div className="min-w-0"><dt className="text-charcoal/60">Sex</dt><dd className="break-words capitalize text-charcoal">{animal.sex}</dd></div>
                            <div className="col-span-2 min-w-0"><dt className="text-charcoal/60">Status</dt><dd><span className={`inline-flex break-all rounded-full px-2 text-xs font-semibold leading-5 ${animal.status === 'active' ? 'bg-sage/20 text-sage' : 'bg-charcoal/10 text-charcoal'}`}>{animal.status}</span></dd></div>
                        </dl>
                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-saddle-brown/10 pt-3">
                            <Link to={`/admin/animals/${animal.slug}/edit`} className="flex min-h-11 items-center justify-center rounded-lg border border-sage/30 text-sm font-medium text-sage">Edit</Link>
                            <button onClick={() => setAnimalToDelete(animal)} className="min-h-11 rounded-lg border border-rust/20 text-sm font-medium text-rust">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="hidden md:block bg-white rounded-[var(--radius-xl)] shadow-sm border border-saddle-brown/10 overflow-x-auto">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="animal-delete-title" className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-desert-sand p-4 sm:p-6 rounded-[var(--radius-xl)] shadow-xl max-w-md w-full border border-rust/20">
                        <h3 id="animal-delete-title" className="break-words text-lg font-serif font-bold text-rust mb-2">Delete {animalToDelete.name}?</h3>
                        <p className="text-charcoal/80 text-sm mb-6">
                            Are you sure you want to delete this {animalToDelete.species}? This action is permanent and will remove all associated media and medical records.
                        </p>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <button 
                                onClick={() => setAnimalToDelete(null)}
                                className="min-h-11 sm:min-h-0 px-4 py-2 text-sm font-medium text-charcoal bg-white border border-saddle-brown/20 rounded-lg hover:bg-sage/10 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="min-h-11 sm:min-h-0 px-4 py-2 text-sm font-medium text-white bg-rust rounded-lg hover:bg-rust/90 transition-colors flex items-center justify-center gap-2"
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
