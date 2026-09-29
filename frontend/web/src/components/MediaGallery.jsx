import React, { useState } from 'react';
import { useGetMediaQuery } from '../features/api/mediaApiSlice';
import ImageWithLoader from './ImageWithLoader';
import VideoWithLoader from './VideoWithLoader';

export default function MediaGallery({ animalId, animalName }) {
    const [page, setPage] = useState(1);
    const [type, setType] = useState('all');

    const {
        currentData: data,
        isFetching,
        error,
        refetch,
    } = useGetMediaQuery({
        animal: animalId,
        public: true,           
        ordering: '-uploaded_at,-id',
        page,
        ...(type !== 'all' ? { media_type: type } : {}),
    });

    const media = data?.results ?? [];
    const total = data?.count ?? 0;

    function changeType(event) {
        setType(event.target.value);
        setPage(1);
    }

    const buttonClasses =
        'rounded-xl border border-saddle-brown px-5 py-3 ' +
        'text-sm font-semibold text-saddle-brown ' +
        'hover:bg-saddle-brown hover:text-white ' +
        'disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <section
            aria-labelledby="gallery-heading"
            aria-busy={isFetching}
            className="border-t border-sage/30 pt-16"
        >
            <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h2
                        id="gallery-heading"
                        className="font-serif text-4xl text-saddle-brown"
                    >
                        Gallery
                    </h2>

                    {data && !error && (
                        <p className="mt-2 text-sm text-charcoal/70">
                            {total} matching {total === 1 ? 'item' : 'items'}
                            {' · '}Page {page}
                        </p>
                    )}
                </div>

                <label className="text-sm font-medium text-saddle-brown">
                    Media type
                    <select
                        value={type}
                        onChange={changeType}
                        className="mt-1 block rounded-lg border border-sage/40 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
                    >
                        <option value="all">All photos and videos</option>
                        <option value="image">Photos only</option>
                        <option value="video">Videos only</option>
                    </select>
                </label>
            </div>

            {isFetching && (
                <p role="status" className="mb-6 text-saddle-brown">
                    Loading gallery…
                </p>
            )}

            {error ? (
                <div
                    role="alert"
                    className="rounded-xl border border-rust/20 bg-white p-6"
                >
                    <p className="mb-4 text-rust">
                        We couldn’t load the gallery. Please try again.
                    </p>
                    <button onClick={refetch} className={buttonClasses}>
                        Try again
                    </button>
                    {page > 1 && (
                        <button
                            onClick={() => setPage(1)}
                            className={`${buttonClasses} ml-3`}
                        >
                            Return to first page
                        </button>
                    )}
                </div>
            ) : data && (
                <>
                    {media.length === 0 ? (
                        <p className="rounded-xl bg-white p-8 text-center text-charcoal/60">
                            No public {type === 'image'
                                ? 'photos'
                                : type === 'video'
                                    ? 'videos'
                                    : 'photos or videos'} available.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {media.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group relative overflow-hidden rounded-xl border border-sage/20 bg-saddle-brown shadow-sm ${
                                        item.media_type === 'video'
                                            ? 'col-span-1 aspect-video sm:col-span-2'
                                            : 'aspect-square'
                                    }`}
                                >
                                    {item.media_type === 'image' ? (
                                        <ImageWithLoader
                                            src={item.url}
                                            size="thumbnail"
                                            alt={
                                                item.caption ||
                                                item.description ||
                                                `Photo of ${animalName}`
                                            }
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : item.media_type === 'video' ? (
                                        <VideoWithLoader
                                            src={item.url}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}

                    {(data.previous || data.next) && (
                        <nav
                            aria-label="Gallery pages"
                            className="mt-10 flex items-center justify-center gap-4"
                        >
                            <button
                                disabled={!data.previous || isFetching}
                                onClick={() => setPage(current => current - 1)}
                                className={buttonClasses}
                            >
                                Previous
                            </button>

                            <span className="text-sm text-charcoal/70">
                                Page {page}
                            </span>

                            <button
                                disabled={!data.next || isFetching}
                                onClick={() => setPage(current => current + 1)}
                                className={buttonClasses}
                            >
                                Next
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    );
}