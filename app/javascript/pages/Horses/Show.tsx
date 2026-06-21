import React, { useEffect, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Layout from '@/components/layout/Layout';
import { Horse } from '@/types';
import CarouselImage from '@/components/CarouselImage'
interface Props {
    horse: Horse;
    images: { id: number, url: string }[]
    imagesPagination: { next: number | null; prev: number | null; count: number }
}

export default function Show({ horse, images: initialImages, imagesPagination }: Props) {
    
    const { auth } = usePage().props;
    const isLoggedIn = auth?.logged_in;
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [images, setImages] = useState(initialImages)

    const handleDeleteImage = (imageId: number) => {
        if (confirm('Are you sure you want to permanently delete this photo from the gallery?')) {
            // Sends request to our custom Rails member route with the target attachment ID
            router.delete(`/horses/${horse.id}/delete_image`, {
                data: { image_id: imageId },
                preserveScroll: true // Keeps the browser window positioned right where it is
            });
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${horse.name}?`)) {
            router.delete(`/horses/${horse.id}`);
        }
    };

    const currentImage = images?.[selectedImageIndex];

    const loadMoreImages = (pageNumber: number) => {
        router.get(
            `/horses/${horse.id}`,
            { page: pageNumber },
            {
                preserveState: true,
                only: ['images', 'imagesPagination'],
                onSuccess: (d)=>{
                    console.log(d)
                    setImages((prev)=>[...prev, ...d.props.images])
                }
            }
        );
    };



    return (
        <>
            <Head title={horse.name} />

            <div className="space-y-8">
                {/* Breadcrumb */}
                <Link href="/horses" className="text-sm text-brand-clay hover:underline inline-block">
                    ← Back to Horses
                </Link>

                {/* Hero Section with Image */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image Gallery */}
                    <div className="lg:col-span-2  ">
                        <div className=" rounded-xl overflow-hidden  relative">
                            {currentImage ? (
                                <div className='relative w-full bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center p-2 h-[400px] sm:h-[500px]'>
                                    <img
                                        src={currentImage?.url}
                                        alt={horse.name}
                                        loading="lazy"
                                        className="w-full h-full  object-contain select-none max-w-full max-h-full"
                                    />
                                    {/* Deletion Button Layout - Only visible if logged in */}
                                    {isLoggedIn && (
                                        <button
                                            onClick={() => handleDeleteImage(currentImage?.id)}
                                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-md shadow-lg transition-colors cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand-sage/20 text-brand-sage font-display text-3xl italic font-semibold">
                                    {horse.name}
                                </div>
                            )}

                            {/* Featured Badge */}
                            {horse.featured && (
                                <span className="absolute top-4 left-4 bg-brand-clay text-brand-cream text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded shadow-lg">
                                    ★ Featured
                                </span>
                            )}

                            {/* Deceased Badge */}
                            {horse.deceased && (
                                <span className="absolute top-4 right-4 bg-gray-700 text-white text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded shadow-lg">
                                    Deceased
                                </span>
                            )}
                        </div>

                        {/* Thumbnail Navigation */}
                        {images && images.length > 1 && (
                            <div className="">
                                <div className='rounded bg-green-600 text-white border p-1 w-10 h-8 text-center'>{imagesPagination.count}</div>
                                {/* Scrollable Container Container */}
                                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-300 scroll-smooth snap-x">

                                    {images.map((image, idx) => (
                                        <button
                                            key={image.id || idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`flex-none w-24 h-24 aspect-square rounded-lg overflow-hidden border-2 transition-all snap-start ${idx === selectedImageIndex
                                                ? 'border-brand-clay scale-95 shadow-sm'
                                                : 'border-transparent hover:border-brand-tan'
                                                }`}
                                        >
                                            {/* Handles individual cloud loading and skeleton placeholders */}
                                            <CarouselImage src={image.url} alt={`${horse.name} thumbnail ${idx + 1}`} />
                                        </button>
                                    ))}
                                    {imagesPagination.next && (
                                        <button onClick={() => loadMoreImages(imagesPagination.next!)}
                                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                                                bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"`}>
                                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-brand-cream/30 border border-brand-tan/40 rounded-xl p-6">
                            {!horse.deceased && horse.price && (
                                <div className="mb-4">
                                    <p className="text-xs uppercase tracking-wider text-brand-sage font-semibold">Available For Sale</p>
                                    <p className="text-3xl font-bold text-brand-clay">${(horse.price / 100).toFixed(2)}</p>
                                </div>
                            )}
                            {horse.deceased && (
                                <p className="text-sm font-semibold text-gray-600">This horse is no longer with us.</p>
                            )}
                            {!horse.deceased && !horse.price && (
                                <p className="text-sm font-semibold text-gray-600">Not currently for sale</p>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white border border-brand-tan rounded-xl p-6 space-y-4">
                            {horse.age !== null && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Age</p>
                                    <p className="text-lg font-semibold text-brand-dark">{horse.age} years</p>
                                </div>
                            )}

                            {horse.sex && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Sex</p>
                                    <p className="text-lg font-semibold text-brand-dark">{horse.sex}</p>
                                </div>
                            )}

                            {horse.breed && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Breed</p>
                                    <p className="text-lg font-semibold text-brand-dark">{horse.breed}</p>
                                </div>
                            )}

                            {horse.color && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Color</p>
                                    <p className="text-lg font-semibold text-brand-dark">{horse.color}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {isLoggedIn && (
                            <div className="flex flex-col gap-3">
                                <Link
                                    href={`/horses/${horse.id}/edit`}
                                    className="text-center px-5 py-3 bg-brand-clay text-brand-cream font-medium rounded-lg hover:bg-brand-clay/90 transition-all"
                                >
                                    Edit Horse
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="px-5 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all"
                                >
                                    Delete Horse
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Physical Characteristics */}
                    {(horse.height || horse.weight) &&
                        <div className="bg-white border border-brand-tan rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-brand-dark mb-6 pb-4 border-b border-brand-tan">
                                Physical Characteristics
                            </h2>
                            <div className="space-y-4">
                                {horse.height && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Height</p>
                                        <p className="text-lg font-medium text-brand-dark">{horse.height} HH</p>
                                    </div>
                                )}
                                {horse.weight && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Weight</p>
                                        <p className="text-lg font-medium text-brand-dark">{horse.weight} lbs</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    }

                    {/* Background Info */}
                    {(horse.brand || horse.herd_management_area) &&
                        <div className="bg-white border border-brand-tan rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-brand-dark mb-6 pb-4 border-b border-brand-tan">
                                Background
                            </h2>
                            <div className="space-y-4">
                                {horse.brand && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Brand</p>
                                        <p className="text-lg font-medium text-brand-dark">{horse.brand}</p>
                                    </div>
                                )}
                                {horse.herd_management_area && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Herd Management Area</p>
                                        <p className="text-lg font-medium text-brand-dark">{horse.herd_management_area}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                </div>

                {/* Description Section */}
                {horse.description && (
                    <div className="bg-white border border-brand-tan rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-brand-dark mb-4 pb-4 border-b border-brand-tan">
                            About {horse.name}
                        </h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {horse.description}
                        </p>
                    </div>
                )}

                {/* Related Horses Section */}
                <div className="pt-8 border-t border-brand-tan/20">
                    <Link
                        href="/horses"
                        className="inline-flex items-center text-brand-clay font-medium hover:text-brand-dark transition-colors"
                    >
                        ← View all horses
                    </Link>
                </div>
            </div >
        </>
    );
}

Show.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;