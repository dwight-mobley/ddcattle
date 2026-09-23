// components/admin/AnimalForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetHorseBreedsQuery, useGetDogBreedsQuery } from '../../features/api/animalApi';

export default function AnimalForm({ initialData = {}, onSubmit, isLoading }) {
    const navigate = useNavigate();
    const { data: horseBreeds = [] } = useGetHorseBreedsQuery();
    const { data: dogBreeds = [] } = useGetDogBreedsQuery();

    const [formData, setFormData] = useState({
        // Base Animal Fields
        name: initialData.name || '',
        species: initialData.species || 'horse',
        sex: initialData.sex || 'unknown',
        birth_date: initialData.birth_date || '',
        weight: initialData.weight || '',
        color: initialData.color || '',
        status: initialData.status || 'active',
        description: initialData.description || '',
        featured: initialData.featured || false,
        public: initialData.public || false,

        // Specific Fields
        brand: initialData.brand || '',
        herd_management_area: initialData.herd_management_area || '',
        adoption_date: initialData.adoption_date || '',
        height: initialData.height || '',
        registration_number: initialData.registration_number || '',
        breed_registry: initialData.breed_registry || '',
        sire: initialData.sire || '',
        dam: initialData.dam || '',
        microchip_number: initialData.microchip_number || '',
        rabies_tag_number: initialData.rabies_tag_number || '',
        spayed_neutered: initialData.spayed_neutered || false,
        ear_tag: initialData.ear_tag || '',
        breed: initialData.breed || '',
    });

    // Reset sex to 'unknown' if species changes to prevent validation errors
    useEffect(() => {
        if (formData.species === 'horse' && ['male', 'female'].includes(formData.sex)) {
            setFormData(prev => ({ ...prev, sex: 'unknown' }));
        } else if (formData.species !== 'horse' && ['stallion', 'gelding', 'mare', 'filly', 'colt'].includes(formData.sex)) {
            setFormData(prev => ({ ...prev, sex: 'unknown' }));
        }
       
    }, [formData.species, formData.sex]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
       
        const cleanedData = { ...formData };

        // Only convert empty strings to null for Date and Number fields. 
        // Text/Char fields should remain as "" so Django doesn't throw a "may not be null" error.
        const nullableFields = ['birth_date', 'weight', 'height', 'adoption_date'];

        Object.keys(cleanedData).forEach(key => {
            if (cleanedData[key] === '') {
                if (nullableFields.includes(key)) {
                    cleanedData[key] = null;
                }
                // Note: String fields like 'sire', 'dam', 'registration_number' 
                // remain as '' which DRF will gladly accept.
            }
        });

        onSubmit(cleanedData);
    };

    const inputClasses = "w-full rounded-lg border border-saddle-brown/20 bg-white px-4 py-2 text-charcoal focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-colors";
    const labelClasses = "block text-sm font-medium text-saddle-brown mb-1";

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[var(--radius-xl)] shadow-sm border border-saddle-brown/10 space-y-8">

            {/* BASE ANIMAL FIELDS */}
            <div>
                <h3 className="text-lg font-serif font-bold text-saddle-brown mb-4 border-b border-saddle-brown/10 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Species</label>
                        <select name="species" value={formData.species} onChange={handleChange} className={inputClasses}>
                            <option value="horse">Horse</option>
                            <option value="cattle">Cattle</option>
                            <option value="dog">Dog</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* DYNAMIC SEX SELECTION */}
                    <div>
                        <label className={labelClasses}>Sex</label>
                        <select name="sex" value={formData.sex} onChange={handleChange} className={inputClasses}>
                            {formData.species === 'horse' ? (
                                <>
                                    <option value="unknown">Unknown</option>
                                    <option value="stallion">Stallion</option>
                                    <option value="gelding">Gelding</option>
                                    <option value="mare">Mare</option>
                                    <option value="filly">Filly</option>
                                    <option value="colt">Colt</option>
                                </>
                            ) : (
                                <>
                                    <option value="unknown">Unknown</option>
                                    <option value="Male">Male</option>
                                    <option value="female">Female</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Birth Date</label>
                        <input type="date" name="birth_date" value={formData.birth_date || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="deceased">Deceased</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Weight (lbs)</label>
                        <input type="number" step="0.01" name="weight" value={formData.weight || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Color</label>
                        <input type="text" name="color" value={formData.color || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>
            </div>

            {/* CONDITIONAL SPECIES FIELDS */}
            {formData.species !== 'other' && (
                <div>
                    <h3 className="text-lg font-serif font-bold text-saddle-brown mb-4 border-b border-saddle-brown/10 pb-2 capitalize">
                        {formData.species} Specifics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {formData.species === 'horse' && (
                            <>
                                <div>
                                    <label className={labelClasses}>Breed</label>
                                    <select name="breed" value={formData.breed || ''} onChange={handleChange} className={inputClasses}>
                                        <option value="">Unknown / Mixed</option>
                                        {horseBreeds.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Height (Hands)</label>
                                    <input type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>BLM Brand</label>
                                    <input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Herd Management Area</label>
                                    <input type="text" name="herd_management_area" value={formData.herd_management_area || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Adoption Date</label>
                                    <input type="date" name="adoption_date" value={formData.adoption_date || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Registration Number</label>
                                    <input type="text" name="registration_number" value={formData.registration_number || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Breed Registry</label>
                                    <input type="text" name="breed_registry" value={formData.breed_registry || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Sire</label>
                                    <input type="text" name="sire" value={formData.sire || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Dam</label>
                                    <input type="text" name="dam" value={formData.dam || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                            </>
                        )}

                        {formData.species === 'dog' && (
                            <>
                                <div>
                                    <label className={labelClasses}>Breed</label>
                                    <select name="breed" value={formData.breed || ''} onChange={handleChange} className={inputClasses}>
                                        <option value="">Unknown / Mixed</option>
                                        {dogBreeds.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Microchip Number</label>
                                    <input type="text" name="microchip_number" value={formData.microchip_number || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Rabies Tag Number</label>
                                    <input type="text" name="rabies_tag_number" value={formData.rabies_tag_number || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Registration Number</label>
                                    <input type="text" name="registration_number" value={formData.registration_number || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="spayed_neutered" checked={formData.spayed_neutered} onChange={handleChange} className="rounded text-saddle-brown focus:ring-sage" />
                                        <span className="text-sm font-medium text-charcoal">Spayed / Neutered</span>
                                    </label>
                                </div>
                            </>
                        )}

                        {formData.species === 'cattle' && (
                            <>
                                <div>
                                    <label className={labelClasses}>Ear Tag</label>
                                    <input type="text" name="ear_tag" value={formData.ear_tag || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Brand</label>
                                    <input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Registration Number</label>
                                    <input type="text" name="registration_number" value={formData.registration_number || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Sire</label>
                                    <input type="text" name="sire" value={formData.sire || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Dam</label>
                                    <input type="text" name="dam" value={formData.dam || ''} onChange={handleChange} className={inputClasses} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* SETTINGS & DESCRIPTION */}
            <div>
                <h3 className="text-lg font-serif font-bold text-saddle-brown mb-4 border-b border-saddle-brown/10 pb-2">Additional Details</h3>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className={labelClasses}>Description / Notes</label>
                        <textarea name="description" rows="4" value={formData.description || ''} onChange={handleChange} className={inputClasses}></textarea>
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="rounded text-saddle-brown focus:ring-sage" />
                            <span className="text-sm font-medium text-charcoal">Featured Animal</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="public" checked={formData.public} onChange={handleChange} className="rounded text-saddle-brown focus:ring-sage" />
                            <span className="text-sm font-medium text-charcoal">Public Profile</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-4 border-t border-saddle-brown/10">
                <button type="button" onClick={() => navigate('/admin/animals')} className="px-5 py-2 text-sm font-medium text-charcoal bg-desert-sand border border-saddle-brown/20 rounded-lg hover:bg-sage/10 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-medium text-desert-sand bg-saddle-brown rounded-lg hover:bg-saddle-brown/90 transition-colors disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Animal'}
                </button>
            </div>
        </form>
    );
}