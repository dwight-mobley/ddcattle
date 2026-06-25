import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { cn } from '@/utils/cn';
import {
    type Horse,
    type HorseFormPayload,
    HORSE_BREEDS,
    HORSE_SEX_OPTIONS,
    getDefaultFormData,
    horseToFormData,
} from '@/types';
/* ─── helpers ──────────────────────────────────────────────────────── */
function formatBirthdate(date: Date | null): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
}
function formatCents(cents: number | null): string {
    if (cents === null) return '';
    return (cents / 100).toFixed(2);
}
/* ─── sub-components ───────────────────────────────────────────────── */
/** Thumbnail for a newly selected (not yet uploaded) file */
function NewImagePreview({
    file,
    onRemove,
}: {
    file: File;
    onRemove: () => void;
}) {
    const url = URL.createObjectURL(file);
    return (
        <div className="group relative h-28 w-28 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
            <img src={url} alt={file.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
                <button
                    type="button"
                    onClick={onRemove}
                    className="scale-0 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all group-hover:scale-100 hover:bg-red-600"
                    aria-label="Remove image"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-[10px] font-medium text-white">
                {file.name}
            </div>
        </div>
    );
}
/** Thumbnail for an already-uploaded (existing) image with delete overlay */
function ExistingImagePreview({
    src,
    pendingDelete,
    onToggleDelete,
}: {
    src: string;
    pendingDelete: boolean;
    onToggleDelete: () => void;
}) {
    return (
        <div
            className={cn(
                'group relative h-28 w-28 overflow-hidden rounded-xl border-2 bg-slate-100 shadow-sm transition-all',
                pendingDelete
                    ? 'border-red-400 opacity-50'
                    : 'border-slate-200 hover:border-red-300 hover:shadow-md',
            )}
        >
            <img src={src} alt="" className="h-full w-full object-cover" />
            {/* Overlay */}
            <div
                className={cn(
                    'absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all',
                    pendingDelete
                        ? 'bg-red-900/50'
                        : 'bg-black/0 group-hover:bg-black/40',
                )}
            >
                <button
                    type="button"
                    onClick={onToggleDelete}
                    className={cn(
                        'rounded-full p-1.5 text-white shadow-lg transition-all',
                        pendingDelete
                            ? 'scale-100 bg-slate-600 hover:bg-slate-700'
                            : 'scale-0 bg-red-500 hover:bg-red-600 group-hover:scale-100',
                    )}
                    aria-label={pendingDelete ? 'Undo delete' : 'Delete image'}
                >
                    {pendingDelete ? (
                        /* Undo icon */
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                    ) : (
                        /* Trash icon */
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    )}
                </button>
                {pendingDelete && (
                    <span className="text-[10px] font-semibold text-white drop-shadow">
                        Will be deleted
                    </span>
                )}
            </div>
        </div>
    );
}
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
}
/* ─── main component ───────────────────────────────────────────────── */
interface HorseFormProps {
    horse?: Horse | null;
}
export default function HorseForm({ horse = null }: HorseFormProps) {
    console.log(horse);
    const isEditMode = !!horse;
    const fileInputRef = useRef<HTMLInputElement>(null);
    /* ── useForm initialisation ──────────────────────────────────────── */
    const form = useForm<HorseFormPayload>(
        isEditMode ? horseToFormData(horse) : getDefaultFormData(),
    );
    const { data, setData, processing, errors, clearErrors, reset, transform, post } = form;
    /* ── local state ─────────────────────────────────────────────────── */
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    /**
     * IDs of existing images the user has marked for deletion.
     * These are sent to the server on submit so Rails can purge them.
     */
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    /* ── existing-image delete toggle ────────────────────────────────── */
    const toggleDeleteExisting = useCallback((id: number) => {
        setDeletedImageIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }, []);
    /* ── generic field handlers ──────────────────────────────────────── */
    const handleText = useCallback(
        (field: keyof HorseFormPayload) =>
            (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                setData(field, e.target.value as never);
                clearErrors(field as keyof HorseFormPayload);
            },
        [setData, clearErrors],
    );
    const handleNumber = useCallback(
        (field: 'age' | 'price' | 'weight' | 'height') =>
            (e: ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value;
                setData(field, v === '' ? null : Number(v));
                clearErrors(field);
            },
        [setData, clearErrors],
    );
    const handleDate = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            setData('birthdate', v ? new Date(v) : null);
            clearErrors('birthdate');
        },
        [setData, clearErrors],
    );
    const handlePrice = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            setData('price', v === '' ? null : Math.round(parseFloat(v) * 100));
            clearErrors('price');
        },
        [setData, clearErrors],
    );
    const handleCheckbox = useCallback(
        (field: 'featured' | 'deceased') =>
            (e: ChangeEvent<HTMLInputElement>) => {
                setData(field, e.target.checked);
            },
        [setData],
    );
    const handleImageUpload = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;
            const newFiles = Array.from(files);
            const merged = [...imageFiles, ...newFiles];
            setImageFiles(merged);
            setData('images', merged);
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        [imageFiles, setData],
    );
    const removeNewImage = useCallback(
        (index: number) => {
            const next = imageFiles.filter((_, i) => i !== index);
            setImageFiles(next);
            setData('images', next);
        },
        [imageFiles, setData],
    );
    /* ── transform payload before submit ─────────────────────────────── */
    transform((formData) => ({
        ...formData,
        brand: formData.brand || null,
        herd_management_area: formData.herd_management_area || null,
        description: formData.description || null,
        // Tell Rails which existing image blobs to purge
        purge_image_ids: deletedImageIds,
    }));
    /* ── submit ──────────────────────────────────────────────────────── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            for (const imageId of deletedImageIds) {
                router.delete(`/horses/${horse.id}/delete_image`, {
                    data: { image_id: imageId },
                    preserveScroll: true // Keeps the browser window positioned right where it is
                });

            }
            form.patch(`/admin/horses/${horse.id}`)
        } else {
            post('/admin/horses', {
                onSuccess: () => {
                    console.log('Horse Added');
                    reset();
                    setImageFiles([]);
                    setDeletedImageIds([]);
                },
            });
        }
    };
    /* ── derived ─────────────────────────────────────────────────────── */
    const existingImages = horse?.images ?? [];
    const deletionCount = deletedImageIds.length;
    /* ────────────────────────────────────────────────────────────────── */
    return (
        <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            {isEditMode ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            )}
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {isEditMode ? 'Edit Horse' : 'Add New Horse'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isEditMode ? `Editing ${horse.name}` : 'Fill in the details to add a new horse'}
                        </p>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ── Identity ─────────────────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                        Identity
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Name */}
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={handleText('name')}
                                placeholder="Enter horse name"
                                className={cn(
                                    'w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                    errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:border-indigo-400',
                                )}
                            />
                            <FieldError message={errors.name} />
                        </div>
                        {/* Breed */}
                        <div>
                            <label htmlFor="breed" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Breed
                            </label>
                            <select
                                id="breed"
                                value={data.breed}
                                onChange={handleText('breed')}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                {HORSE_BREEDS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        {/* Sex */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Sex</label>
                            <div className="flex gap-3">
                                {HORSE_SEX_OPTIONS.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={cn(
                                            'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all',
                                            data.sex === opt.value
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="sex"
                                            value={opt.value}
                                            checked={data.sex === opt.value}
                                            onChange={handleText('sex')}
                                            className="sr-only"
                                        />
                                        {data.sex === opt.value && (
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Color */}
                        <div>
                            <label htmlFor="color" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Color <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="color"
                                type="text"
                                value={data.color}
                                onChange={handleText('color')}
                                placeholder="e.g., Bay, Chestnut, Palomino"
                                className={cn(
                                    'w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                    errors.color
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:border-indigo-400',
                                )}
                            />
                            <FieldError message={errors.color} />
                        </div>
                        {/* Brand */}
                        <div>
                            <label htmlFor="brand" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Brand
                            </label>
                            <input
                                id="brand"
                                type="text"
                                value={data.brand ?? ''}
                                onChange={(e) => setData('brand', e.target.value || null)}
                                placeholder="Brand or marking"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                </section>
                {/* ── Physical Details ─────────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        Physical Details
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Age */}
                        <div>
                            <label htmlFor="age" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Age (years)
                            </label>
                            <input
                                id="age"
                                type="number"
                                min="0"
                                value={data.age ?? ''}
                                onChange={handleNumber('age')}
                                placeholder="—"
                                className={cn(
                                    'w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                    errors.age
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:border-indigo-400',
                                )}
                            />
                            <FieldError message={errors.age} />
                        </div>
                        {/* Birthdate */}
                        <div>
                            <label htmlFor="birthdate" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Birthdate
                            </label>
                            <input
                                id="birthdate"
                                type="date"
                                value={formatBirthdate(data.birthdate)}
                                onChange={handleDate}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        {/* Weight */}
                        <div>
                            <label htmlFor="weight" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Weight (lbs)
                            </label>
                            <input
                                id="weight"
                                type="number"
                                min="0"
                                step="0.1"
                                value={data.weight ?? ''}
                                onChange={handleNumber('weight')}
                                placeholder="—"
                                className={cn(
                                    'w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                    errors.weight
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:border-indigo-400',
                                )}
                            />
                            <FieldError message={errors.weight} />
                        </div>
                        {/* Height */}
                        <div>
                            <label htmlFor="height" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Height (hands)
                            </label>
                            <input
                                id="height"
                                type="number"
                                min="0"
                                step="0.1"
                                value={data.height ?? ''}
                                onChange={handleNumber('height')}
                                placeholder="—"
                                className={cn(
                                    'w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                    errors.height
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:border-indigo-400',
                                )}
                            />
                            <FieldError message={errors.height} />
                        </div>
                    </div>
                </section>
                {/* ── Management & Pricing ─────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                        Management & Pricing
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Herd Management Area */}
                        <div>
                            <label htmlFor="herd_management_area" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Herd Management Area
                            </label>
                            <input
                                id="herd_management_area"
                                type="text"
                                value={data.herd_management_area ?? ''}
                                onChange={(e) => setData('herd_management_area', e.target.value || null)}
                                placeholder="e.g., Palomino Valley"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Price (USD)
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    $
                                </span>
                                <input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formatCents(data.price)}
                                    onChange={handlePrice}
                                    placeholder="0.00"
                                    className={cn(
                                        'w-full rounded-xl border bg-slate-50 py-3 pl-8 pr-4 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                        errors.price
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-slate-200 focus:border-indigo-400',
                                    )}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-400">Leave empty if not for sale</p>
                            <FieldError message={errors.price} />
                        </div>
                    </div>
                </section>
                {/* ── Description ──────────────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                        Description
                    </h2>
                    <div>
                        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
                            About this horse
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={data.description ?? ''}
                            onChange={(e) => setData('description', e.target.value || null)}
                            placeholder="Describe temperament, training, history, or any other details..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </section>
                {/* ── Photos ───────────────────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                        Photos
                    </h2>
                    {/* ── Existing images (edit mode) ───────────────────────── */}
                    {isEditMode && existingImages.length > 0 && (
                        <div className="mb-6">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-600">
                                    Existing Photos
                                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                        {existingImages.length}
                                    </span>
                                </p>
                                {deletionCount > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                                        </svg>
                                        {deletionCount} will be deleted on save
                                    </span>
                                )}
                            </div>
                            <p className="mb-3 text-xs text-slate-400">
                                Hover over a photo and click the trash icon to mark it for deletion. Changes apply when you save.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {existingImages.map((img) => (
                                    <ExistingImagePreview
                                        key={img.id}
                                        src={img.url}
                                        pendingDelete={deletedImageIds.includes(img.id)}
                                        onToggleDelete={() => toggleDeleteExisting(img.id)}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 border-t border-slate-100" />
                        </div>
                    )}
                    {/* ── Newly selected images ─────────────────────────────── */}
                    {imageFiles.length > 0 && (
                        <div className="mb-5">
                            <p className="mb-3 text-sm font-medium text-slate-600">
                                {isEditMode ? 'New Photos to Upload' : 'Selected Photos'}
                                <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-500">
                                    {imageFiles.length}
                                </span>
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {imageFiles.map((file, i) => (
                                    <NewImagePreview
                                        key={`${file.name}-${file.size}-${i}`}
                                        file={file}
                                        onRemove={() => removeNewImage(i)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {/* ── Upload drop zone ──────────────────────────────────── */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const dropped = Array.from(e.dataTransfer.files).filter((f) =>
                                f.type.startsWith('image/'),
                            );
                            if (dropped.length) {
                                const merged = [...imageFiles, ...dropped];
                                setImageFiles(merged);
                                setData('images', merged);
                            }
                        }}
                        className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/30"
                    >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-indigo-100">
                            <svg
                                className="h-6 w-6 text-slate-400 transition-colors group-hover:text-indigo-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zM8.25 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">
                            Click or drag photos here
                        </p>
                        <p className="mt-1 text-xs text-slate-400">PNG, JPG, JPEG up to 10 MB each</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </section>
                {/* ── Status Toggles ───────────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                        Status
                    </h2>
                    <div className="space-y-4">
                        {/* Featured */}
                        <label className="group flex cursor-pointer items-start gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50">
                            <div className="relative mt-0.5 flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={data.featured}
                                    onChange={handleCheckbox('featured')}
                                    className="peer sr-only"
                                />
                                <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-indigo-500" />
                                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">Featured Horse</p>
                                <p className="text-xs text-slate-400">Display this horse prominently on the website</p>
                            </div>
                        </label>
                        {/* Deceased */}
                        <label className="group flex cursor-pointer items-start gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50">
                            <div className="relative mt-0.5 flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={data.deceased}
                                    onChange={handleCheckbox('deceased')}
                                    className="peer sr-only"
                                />
                                <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-slate-500" />
                                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">Deceased</p>
                                <p className="text-xs text-slate-400">Mark this horse as no longer living</p>
                            </div>
                        </label>
                    </div>
                </section>
                {/* ── Actions ──────────────────────────────────────────────── */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                    <Link
                        href="/admin/horses"
                        className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
                    >
                        Cancel
                    </Link>
                    {isEditMode && (
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setDeletedImageIds([]);
                            }}
                            disabled={processing}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
                        >
                            Reset Changes
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving…
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                {isEditMode ? 'Update Horse' : 'Create Horse'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}