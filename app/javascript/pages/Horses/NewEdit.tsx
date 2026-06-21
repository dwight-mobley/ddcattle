import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/components/layout/Layout';
import { Horse, HorseFormPayload, HorseBreed } from '@/types';

interface Props {
    horse?: Horse;
}

const HORSE_BREEDS: HorseBreed[] = ['Mustang', 'Quarter Horse', 'Paint Horse', 'Burro', 'Halflinger'];
const HORSE_COLORS = ['Bay', 'Black', 'Chestnut', 'Palomino', 'Roan', 'Gray', 'Dun', 'Buckskin', 'Pinto', 'Appaloosa'];
const HORSE_SEX = ['GELDING', 'MARE'];

export default function NewEdit({ horse }: Props) {
    const isEditing = !!horse?.id;
    const { data, setData, post, put, processing, progress, errors } = useForm({
        name: horse?.name || '',
        breed: horse?.breed || 'Mustang',
        color: horse?.color || '',
        sex: horse?.sex || '',
        brand: horse?.brand || '',
        birthdate: horse?.birthdate || '',
        herd_management_area: horse?.herd_management_area || '',
        price: horse?.price ? (horse.price / 100) : null,
        featured: horse?.featured || false,
        description: horse?.description || '',
        weight: horse?.weight || null,
        height: horse?.height || null,
        deceased: horse?.deceased || false,
        images: [] as File[]
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();

        // Convert price from dollars to cents
        setData('price', data.price ? data.price * 100 : null)

        if (isEditing && horse?.id) {
            put(`/horses/${horse.id}`);
        } else {
            post('/horses');
        }
    };

    return (
        <>
            <Head title={isEditing ? `Edit ${horse?.name}` : 'Add New Horse'} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/horses" className="text-sm text-brand-clay hover:underline mb-4 inline-block">
                        ← Back to Horses
                    </Link>
                    <h1 className="font-display text-4xl font-bold text-brand-dark mb-2">
                        {isEditing ? `Edit ${horse?.name}` : 'Add New Horse'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditing ? 'Update horse information' : 'Create a new horse profile'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-brand-tan rounded-xl p-8 space-y-8">
                    {/* Basic Info Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-brand-dark mb-6 pb-4 border-b border-brand-tan">
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">
                                    Horse Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Breed */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Breed</label>
                                <select
                                    value={data.breed}
                                    onChange={(e) => setData('breed', e.target.value as HorseBreed)}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                >
                                    {HORSE_BREEDS.map((breed) => (
                                        <option key={breed} value={breed}>
                                            {breed}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Color</label>
                                <input
                                    type="text"
                                    list="colors"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                                <datalist id="colors">
                                    {HORSE_COLORS.map((color) => (
                                        <option key={color} value={color} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Sex */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Sex</label>
                                <select
                                    value={data.sex}
                                    onChange={(e) => setData('sex', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                >
                                    <option value="">Select sex</option>
                                    {HORSE_SEX.map((sex) => (
                                        <option key={sex} value={sex}>
                                            {sex}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Birth Year */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Birth Date</label>
                                <input
                                    type="date"
                                    value={data.birthdate as string}
                                    onChange={(e) => setData('birthdate', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Brand</label>
                                <input
                                    type="text"
                                    value={data.brand}
                                    onChange={(e) => setData('brand', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Physical Characteristics */}
                    <div>
                        <h2 className="text-xl font-semibold text-brand-dark mb-6 pb-4 border-b border-brand-tan">
                            Physical Characteristics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Height */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Height (HH)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.height || undefined}
                                    onChange={(e) => setData('height', parseFloat(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                            </div>

                            {/* Weight */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Weight (lbs)</label>
                                <input
                                    type="number"
                                    value={data.weight || undefined}
                                    onChange={(e) => setData('weight', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-brand-dark mb-6 pb-4 border-b border-brand-tan">
                            Details
                        </h2>

                        <div className="space-y-6">
                            {/* Herd Management Area */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">
                                    Herd Management Area
                                </label>
                                <input
                                    type="text"
                                    value={data.herd_management_area}
                                    onChange={(e) => setData('herd_management_area', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={data.price || undefined}
                                    onChange={(e) => setData('price', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty if not for sale</p>
                            </div>
                        </div>
                    </div>

                    {/* Multiple Image Input */}
                    <div>
                        <label>Upload Images:</label>
                        <input
                            type="file"
                            multiple // Allows selecting more than one file
                            accept="image/*" // Limits file picker to image types
                            onChange={handleFileChange}
                            className="hover:cursor-pointer w-full px-4 py-2 rounded-lg border border-brand-tan/50 focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20 outline-none"
                        />
                        {errors.images && <p className="text-red-500">{errors.images}</p>}
                    </div>

                    {/* Visual upload progress indicator */}
                    {progress && (
                        <progress value={progress.percentage} max="100">
                            {progress.percentage}%
                        </progress>
                    )}


                    {/* Status Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-brand-dark mb-6 pb-4 border-b border-brand-tan">
                            Status
                        </h2>

                        <div className="space-y-4">
                            {/* Featured */}
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.featured}
                                    onChange={(e) => setData('featured', e.target.checked)}
                                    className="w-4 h-4 rounded border-brand-tan focus:ring-brand-clay"
                                />
                                <span className="text-sm font-medium text-brand-dark">Featured Horse</span>
                            </label>

                            {/* Deceased */}
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.deceased}
                                    onChange={(e) => setData('deceased', e.target.checked)}
                                    className="w-4 h-4 rounded border-brand-tan focus:ring-brand-clay"
                                />
                                <span className="text-sm font-medium text-brand-dark">Deceased</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-brand-tan">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-brand-clay text-brand-cream font-medium rounded-lg hover:bg-brand-clay/90 disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Saving...' : isEditing ? 'Update Horse' : 'Add Horse'}
                        </button>
                        <Link
                            href="/horses"
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}

NewEdit.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;