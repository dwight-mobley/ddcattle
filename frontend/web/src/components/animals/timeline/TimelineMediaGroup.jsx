import { Link } from 'react-router-dom';

export default function TimelineMediaGroup({ group, slug }) {
    const images = group.items.filter(
        (item) => item.data.media_type === 'image'
    );

    const videos = group.items.filter(
        (item) => item.data.media_type === 'video'
    );

    const documents = group.items.filter(
        (item) => item.data.media_type === 'document'
    );

    const previewItems = group.items.slice(0, 6);
    const remainingCount = group.items.length - previewItems.length;

    return (
        <article className="bg-white rounded-xl border border-sage/20 shadow-sm p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-sage">
                        Media
                    </span>

                    <h3 className="text-xl font-serif text-saddle-brown mt-1">
                        {group.label}
                    </h3>
                </div>

                <p className="text-sm text-charcoal/55">
                    {images.length > 0 && (
                        <>
                            {images.length}{' '}
                            {images.length === 1 ? 'photo' : 'photos'}
                        </>
                    )}

                    {images.length > 0 && videos.length > 0 && ' · '}

                    {videos.length > 0 && (
                        <>
                            {videos.length}{' '}
                            {videos.length === 1 ? 'video' : 'videos'}
                        </>
                    )}

                    {(images.length > 0 || videos.length > 0) &&
                        documents.length > 0 &&
                        ' · '}

                    {documents.length > 0 && (
                        <>
                            {documents.length}{' '}
                            {documents.length === 1
                                ? 'document'
                                : 'documents'}
                        </>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previewItems.map((item, index) => {
                    const isLastPreview =
                        index === previewItems.length - 1;

                    return (
                        <div
                            key={item.id}
                            className="relative aspect-square overflow-hidden rounded-lg bg-charcoal/10"
                        >
                            {item.data.media_type === 'image' && (
                                <img
                                    src={item.data.url}
                                    alt={item.title || 'Animal media'}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {item.data.media_type === 'video' && (
                                <>
                                    <video
                                        src={item.data.url}
                                        preload="metadata"
                                        className="w-full h-full object-cover"
                                    />

                                    {!isLastPreview || remainingCount === 0 ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-charcoal/10">
                                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-saddle-brown shadow">
                                                ▶
                                            </span>
                                        </div>
                                    ) : null}
                                </>
                            )}

                            {item.data.media_type === 'document' && (
                                <div className="w-full h-full flex items-center justify-center px-4 text-center text-sm text-charcoal/50">
                                    Document
                                </div>
                            )}

                            {isLastPreview && remainingCount > 0 && (
                                <Link
                                    to={`/animals/${slug}/gallery`}
                                    aria-label={`View ${remainingCount} more media items`}
                                    className="absolute inset-0 bg-charcoal/65 flex flex-col items-center justify-center text-white hover:bg-charcoal/75 transition-colors"
                                >
                                    <span className="text-3xl font-serif">
                                        +{remainingCount}
                                    </span>

                                    <span className="text-[10px] uppercase tracking-widest mt-1">
                                        View Gallery
                                    </span>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </article>
    );
}