import React, { useState } from 'react';

import { useGetAnimalsQuery } from '../../features/api/animalApi';


const RECORD_TYPES = [
    { value: 'general', label: 'General' },
    { value: 'exam', label: 'Exam' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'medication', label: 'Medication' },
    { value: 'injury', label: 'Injury' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'dental', label: 'Dental' },
    { value: 'lab', label: 'Lab/Test' },
    { value: 'deworming', label: 'Deworming' },
    { value: 'other', label: 'Other' },
];


const inputClasses = `
    min-h-11 w-full rounded-lg
    border border-saddle-brown/20
    bg-white px-4 py-2.5
    text-charcoal
    outline-none transition-colors
    focus:border-sage focus:ring-1 focus:ring-sage
`;


function today() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 10);
}


function Field({ label, required = false, children }) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-sm font-medium text-saddle-brown">
                {label}

                {required && (
                    <span className="ml-1 text-rust">*</span>
                )}
            </span>

            {children}
        </label>
    );
}


function errorText(error) {
    if (!error) return '';

    const data = error?.data;

    if (!data) {
        return (
            error?.message ||
            error?.error ||
            'Something went wrong. Please try again.'
        );
    }

    if (typeof data === 'string') {
        return data;
    }

    const flatten = (value, prefix = '') => {
        if (Array.isArray(value)) {
            return value
                .map((item) => flatten(item, prefix))
                .join(' ');
        }

        if (value && typeof value === 'object') {
            return Object.entries(value)
                .map(([key, item]) =>
                    flatten(
                        item,
                        prefix
                            ? `${prefix}.${key}`
                            : key
                    )
                )
                .join(' ');
        }

        return `${prefix ? `${prefix}: ` : ''}${String(
            value ?? ''
        )}`;
    };

    return flatten(data);
}


export default function MedicalRecordForm({
    initialData = {},
    onSubmit,
    isLoading = false,
    submitError = null,
    mode = 'create',
}) {
    const {
        data: animalData,
        isLoading: animalsLoading,
        isError: animalsError,
    } = useGetAnimalsQuery();

    const animals = Array.isArray(animalData)
        ? animalData
        : animalData?.results || [];

    const [form, setForm] = useState({
        animal: initialData.animal
            ? String(initialData.animal)
            : '',
        record_type:
            initialData.record_type || 'general',
        title: initialData.title || '',
        date: initialData.date || today(),
        weight: initialData.weight ?? '',
        height: initialData.height ?? '',
        description: initialData.description || '',
        veterinarian: initialData.veterinarian || '',
        clinic: initialData.clinic || '',
        medication: initialData.medication || '',
        dosage: initialData.dosage || '',
        follow_up_date:
            initialData.follow_up_date || '',
        private_notes:
            initialData.private_notes || '',
    });



    function change(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function submit(event) {
        event.preventDefault();

        const payload = {
            animal: Number(form.animal),
            record_type: form.record_type,
            title: form.title.trim(),
            date: form.date,
            weight: form.weight === '' ? null : form.weight,
            height: form.height === '' ? null : form.height,
            description: form.description.trim(),
            veterinarian: form.veterinarian.trim(),
            clinic: form.clinic.trim(),
            medication: form.medication.trim(),
            dosage: form.dosage.trim(),
            follow_up_date:
                form.follow_up_date || null,
            private_notes: form.private_notes.trim(),
        };

        await onSubmit(payload);
    }

    return (
        <form
            onSubmit={submit}
            className="space-y-5 sm:space-y-6"
        >
            {submitError && (
                <div
                    role="alert"
                    className="rounded-lg border border-rust/20 bg-rust/10 p-4 text-sm text-rust"
                >
                    {errorText(submitError)}
                </div>
            )}

            {/* Record details */}
            <section className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5">
                    <h3 className="font-serif text-lg font-bold text-saddle-brown">
                        Record Details
                    </h3>

                    <p className="mt-1 text-sm text-charcoal/60">
                        Basic information about this medical event.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <Field label="Animal" required>
                        <select
                            name="animal"
                            value={form.animal}
                            onChange={change}
                            required
                            disabled={
                                animalsLoading ||
                                animalsError
                            }
                            className={inputClasses}
                        >
                            <option value="">
                                {animalsLoading
                                    ? 'Loading animals...'
                                    : 'Select an animal'}
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
                    </Field>

                    <Field label="Record Type" required>
                        <select
                            name="record_type"
                            value={form.record_type}
                            onChange={change}
                            required
                            className={inputClasses}
                        >
                            {RECORD_TYPES.map((type) => (
                                <option
                                    key={type.value}
                                    value={type.value}
                                >
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Title" required>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={change}
                            required
                            maxLength={200}
                            placeholder="Annual Vaccination"
                            className={inputClasses}
                        />
                    </Field>

                    <Field label="Date" required>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={change}
                            required
                            className={inputClasses}
                        />
                    </Field>
                </div>
                <div className="mt-4 sm:mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Weight (lbs)">
                        <input
                            type="number"
                            name="weight"
                            value={form.weight}
                            onChange={change}
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="1100"
                            className={inputClasses}
                        />
                    </Field>

                    <Field label="Height">
                        <input
                            type="number"
                            name="height"
                            value={form.height}
                            onChange={change}
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="15.2"
                            className={inputClasses}
                        />
                    </Field>
                </div>

                <div className="mt-4 sm:mt-5">
                    <Field label="Description">
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={change}
                            rows={4}
                            placeholder="Describe the treatment, exam, injury, or other medical event..."
                            className={`${inputClasses} resize-y`}
                        />
                    </Field>
                </div>
            </section>

            {/* Treatment */}
            <section className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5">
                    <h3 className="font-serif text-lg font-bold text-saddle-brown">
                        Treatment & Provider
                    </h3>

                    <p className="mt-1 text-sm text-charcoal/60">
                        Optional treatment and provider details.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <Field label="Veterinarian">
                        <input
                            type="text"
                            name="veterinarian"
                            value={form.veterinarian}
                            onChange={change}
                            maxLength={200}
                            placeholder="Veterinarian name"
                            className={inputClasses}
                        />
                    </Field>

                    <Field label="Clinic">
                        <input
                            type="text"
                            name="clinic"
                            value={form.clinic}
                            onChange={change}
                            maxLength={200}
                            placeholder="Clinic or practice"
                            className={inputClasses}
                        />
                    </Field>

                    <Field label="Medication">
                        <input
                            type="text"
                            name="medication"
                            value={form.medication}
                            onChange={change}
                            maxLength={250}
                            placeholder="Quest Plus"
                            className={inputClasses}
                        />
                    </Field>

                    <Field label="Dosage">
                        <input
                            type="text"
                            name="dosage"
                            value={form.dosage}
                            onChange={change}
                            maxLength={150}
                            placeholder="2 mL"
                            className={inputClasses}
                        />
                    </Field>

                    <Field label="Follow-up Date">
                        <input
                            type="date"
                            name="follow_up_date"
                            value={form.follow_up_date}
                            onChange={change}
                            className={inputClasses}
                        />
                    </Field>
                </div>
            </section>

            {/* Private notes */}
            <section className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5">
                    <h3 className="font-serif text-lg font-bold text-saddle-brown">
                        Private Notes
                    </h3>

                    <p className="mt-1 text-sm text-charcoal/60">
                        Internal notes for ranch management.
                    </p>
                </div>

                <Field label="Notes">
                    <textarea
                        name="private_notes"
                        value={form.private_notes}
                        onChange={change}
                        rows={4}
                        placeholder="Reactions, observations, instructions, or other private notes..."
                        className={`${inputClasses} resize-y`}
                    />
                </Field>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    disabled={isLoading}
                    className="min-h-11 w-full rounded-lg border border-saddle-brown/20 bg-white px-5 py-2.5 text-sm font-medium text-charcoal hover:bg-sage/10 disabled:opacity-50 sm:w-auto"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={
                        isLoading ||
                        animalsLoading ||
                        animalsError
                    }
                    className="min-h-11 w-full rounded-lg bg-saddle-brown px-5 py-2.5 text-sm font-medium text-desert-sand hover:bg-saddle-brown/90 disabled:opacity-50 sm:w-auto"
                >
                    {isLoading
                        ? 'Saving...'
                        : mode === 'edit'
                            ? 'Save Changes'
                            : 'Create Medical Record'}
                </button>
            </div>
        </form>
    );
}