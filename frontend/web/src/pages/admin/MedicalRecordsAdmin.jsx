import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    useDeleteMedicalRecordMutation,
    useGetMedicalRecordsQuery,
} from '../../features/api/medicalApi';


const RECORD_TYPE_LABELS = {
    general: 'General',
    exam: 'Exam',
    vaccination: 'Vaccination',
    medication: 'Medication',
    injury: 'Injury',
    surgery: 'Surgery',
    dental: 'Dental',
    lab: 'Lab/Test',
    deworming: 'Deworming',
    other: 'Other',
};


function displayDate(value) {
    if (!value) return '';

    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T12:00:00`)
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}


function MedicalRecordCard({
    record,
    onDelete,
    isDeleting,
}) {
    const hasTreatment =
        record.medication ||
        record.dosage;

    const hasProvider =
        record.veterinarian ||
        record.clinic;

    return (
        <article className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-lg font-bold text-saddle-brown">
                            {record.animal_name}
                        </span>

                        <span className="rounded-full bg-sage/10 px-2.5 py-1 text-xs font-semibold text-saddle-brown">
                            {RECORD_TYPE_LABELS[record.record_type]
                                || record.record_type}
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-charcoal/60">
                        {displayDate(record.date)}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        to={`/admin/medical/${record.id}/edit`}
                        className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-saddle-brown/20 px-4 py-2 text-sm font-medium text-saddle-brown transition-colors hover:bg-sage/10 sm:flex-none"
                    >
                        Edit
                    </Link>

                    <button
                        type="button"
                        onClick={() => onDelete(record)}
                        disabled={isDeleting}
                        className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-rust/20 px-4 py-2 text-sm font-medium text-rust transition-colors hover:bg-rust/10 disabled:opacity-50 sm:flex-none"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="font-semibold text-charcoal">
                    {record.title}
                </h3>

                {record.description && (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-charcoal/70">
                        {record.description}
                    </p>
                )}
            </div>

            {(hasTreatment || hasProvider || record.follow_up_date) && (
                <div className="mt-4 grid gap-3 border-t border-saddle-brown/10 pt-4 sm:grid-cols-2 lg:grid-cols-3">

                    {hasTreatment && (
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                                Treatment
                            </div>

                            <div className="mt-1 text-sm text-charcoal">
                                {record.medication || 'Medication not specified'}

                                {record.dosage && (
                                    <span className="text-charcoal/60">
                                        {' · '}
                                        {record.dosage}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {hasProvider && (
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                                Provider
                            </div>

                            <div className="mt-1 text-sm text-charcoal">
                                {record.veterinarian || record.clinic}

                                {record.veterinarian && record.clinic && (
                                    <span className="text-charcoal/60">
                                        {' · '}
                                        {record.clinic}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {record.follow_up_date && (
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                                Follow Up
                            </div>

                            <div className="mt-1 text-sm text-charcoal">
                                {displayDate(record.follow_up_date)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {record.private_notes && (
                <div className="mt-4 rounded-lg bg-desert-sand/60 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                        Private Notes
                    </div>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/70">
                        {record.private_notes}
                    </p>
                </div>
            )}
        </article>
    );
}


export default function MedicalRecordsAdmin() {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetMedicalRecordsQuery();

    const [
        deleteMedicalRecord,
        { isLoading: isDeleting },
    ] = useDeleteMedicalRecordMutation();

    const [search, setSearch] = useState('');
    const [animalFilter, setAnimalFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    const records = Array.isArray(data)
        ? data
        : data?.results || [];

    const animals = useMemo(() => {
        const map = new Map();

        records.forEach((record) => {
            if (record.animal && record.animal_name) {
                map.set(
                    String(record.animal),
                    record.animal_name
                );
            }
        });

        return Array.from(map.entries())
            .map(([id, name]) => ({
                id,
                name,
            }))
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );
    }, [records]);

    const filteredRecords = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return records.filter((record) => {
            if (
                animalFilter &&
                String(record.animal) !== animalFilter
            ) {
                return false;
            }

            if (
                typeFilter &&
                record.record_type !== typeFilter
            ) {
                return false;
            }

            if (!query) {
                return true;
            }

            const searchable = [
                record.animal_name,
                record.title,
                record.description,
                record.veterinarian,
                record.clinic,
                record.medication,
                record.dosage,
                record.private_notes,
                RECORD_TYPE_LABELS[record.record_type],
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchable.includes(query);
        });
    }, [
        records,
        search,
        animalFilter,
        typeFilter,
    ]);

    async function confirmDelete() {
        if (!recordToDelete) return;

        setDeleteError('');

        try {
            await deleteMedicalRecord(
                recordToDelete.id
            ).unwrap();

            setRecordToDelete(null);
        } catch (err) {
            setDeleteError(
                'Unable to delete this medical record.'
            );
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-6 text-sm text-charcoal/70 shadow-sm">
                Loading medical records...
            </div>
        );
    }

    if (isError) {
        return (
            <div
                role="alert"
                className="rounded-[var(--radius-xl)] border border-rust/20 bg-rust/10 p-4 text-sm text-rust"
            >
                Unable to load medical records.
                {error?.status && (
                    <> Error {error.status}.</>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-5 sm:space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-saddle-brown">
                            Medical Records
                        </h2>

                        <p className="mt-1 text-sm text-charcoal/70">
                            View and manage animal medical history.
                        </p>
                    </div>

                    <Link
                        to="/admin/medical/new"
                        className="flex min-h-11 w-full items-center justify-center rounded-lg bg-saddle-brown px-5 py-2.5 text-sm font-medium text-desert-sand transition-colors hover:bg-saddle-brown/90 sm:w-auto"
                    >
                        Add Medical Record
                    </Link>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-saddle-brown/10 bg-white p-4 shadow-sm">
                        <div className="text-2xl font-bold text-saddle-brown">
                            {records.length}
                        </div>
                        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-charcoal/50">
                            Records
                        </div>
                    </div>

                    <div className="rounded-xl border border-saddle-brown/10 bg-white p-4 shadow-sm">
                        <div className="text-2xl font-bold text-saddle-brown">
                            {animals.length}
                        </div>
                        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-charcoal/50">
                            Animals
                        </div>
                    </div>

                    <div className="col-span-2 rounded-xl border border-saddle-brown/10 bg-white p-4 shadow-sm sm:col-span-1">
                        <div className="text-2xl font-bold text-saddle-brown">
                            {filteredRecords.length}
                        </div>
                        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-charcoal/50">
                            Showing
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-3">

                        <label className="block">
                            <span className="sr-only">
                                Search medical records
                            </span>

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search records..."
                                className="min-h-11 w-full rounded-lg border border-saddle-brown/20 bg-white px-4 py-2.5 text-charcoal outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                            />
                        </label>

                        <label className="block">
                            <span className="sr-only">
                                Filter by animal
                            </span>

                            <select
                                value={animalFilter}
                                onChange={(event) =>
                                    setAnimalFilter(
                                        event.target.value
                                    )
                                }
                                className="min-h-11 w-full rounded-lg border border-saddle-brown/20 bg-white px-4 py-2.5 text-charcoal outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                            >
                                <option value="">
                                    All animals
                                </option>

                                {animals.map((animal) => (
                                    <option
                                        key={animal.id}
                                        value={animal.id}
                                    >
                                        {animal.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="sr-only">
                                Filter by record type
                            </span>

                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(
                                        event.target.value
                                    )
                                }
                                className="min-h-11 w-full rounded-lg border border-saddle-brown/20 bg-white px-4 py-2.5 text-charcoal outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                            >
                                <option value="">
                                    All record types
                                </option>

                                {Object.entries(
                                    RECORD_TYPE_LABELS
                                ).map(([value, label]) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* Records */}
                {filteredRecords.length ? (
                    <div className="space-y-3">
                        {filteredRecords.map((record) => (
                            <MedicalRecordCard
                                key={record.id}
                                record={record}
                                onDelete={setRecordToDelete}
                                isDeleting={isDeleting}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-8 text-center shadow-sm">
                        <h3 className="font-serif text-lg font-bold text-saddle-brown">
                            No medical records found
                        </h3>

                        <p className="mt-2 text-sm text-charcoal/60">
                            {records.length
                                ? 'Try changing your search or filters.'
                                : 'Medical records will appear here as they are added.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Delete confirmation */}
            {recordToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-medical-title"
                        className="w-full max-w-md rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-desert-sand p-4 shadow-xl sm:p-6"
                    >
                        <h2
                            id="delete-medical-title"
                            className="font-serif text-xl font-bold text-saddle-brown"
                        >
                            Delete Medical Record?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-charcoal/70">
                            Delete{' '}
                            <strong>
                                {recordToDelete.title}
                            </strong>{' '}
                            for{' '}
                            <strong>
                                {recordToDelete.animal_name}
                            </strong>
                            ? This cannot be undone.
                        </p>

                        {deleteError && (
                            <div
                                role="alert"
                                className="mt-4 rounded-lg border border-rust/20 bg-rust/10 p-3 text-sm text-rust"
                            >
                                {deleteError}
                            </div>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setRecordToDelete(null);
                                    setDeleteError('');
                                }}
                                disabled={isDeleting}
                                className="min-h-11 w-full rounded-lg border border-saddle-brown/20 bg-white px-5 py-2 text-sm font-medium text-charcoal hover:bg-sage/10 disabled:opacity-50 sm:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="min-h-11 w-full rounded-lg bg-rust px-5 py-2 text-sm font-medium text-white hover:bg-rust/90 disabled:opacity-50 sm:w-auto"
                            >
                                {isDeleting
                                    ? 'Deleting...'
                                    : 'Delete Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}