import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetReminderOptionsQuery } from '../../features/api/reminderApi';
import { useGetAnimalsQuery } from '../../features/api/animalApi';
import { animalId, errorText, recurrenceUnits, reminderPayload, rowsOf } from '../admin/reminderUtils';
import { ErrorMessage, Field, inputClasses, primaryClasses, secondaryClasses } from '../admin/ReminderFields';

export default function ReminderForm({ initialData = {}, onSubmit, isLoading = false }) {
    const navigate = useNavigate();
    const { data, isLoading: animalsLoading, isError: animalsError, refetch } = useGetAnimalsQuery();
    const { data: metadata } = useGetReminderOptionsQuery();
    const recordTypes = metadata?.actions?.POST?.medical?.children?.record_type?.choices || [];
    const animals = rowsOf(data);
    const lock = useRef(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(() => ({
        title: initialData.title || '', reminder_type: initialData.reminder_type || 'general', description: initialData.description || '',
        animal: animalId(initialData.animal) ?? '', due_date: initialData.due_date?.slice(0, 10) || '',
        active: initialData.active ?? true, recurring: initialData.recurring ?? false,
        recurrence_interval: initialData.recurrence_interval ?? 1, recurrence_unit: initialData.recurrence_unit || 'months',
        medical_enabled: Boolean(initialData.medical), record_type: initialData.medical?.record_type || '',
        create_record_on_completion: initialData.medical?.create_record_on_completion ?? true,
    }));
    const change = ({ target }) => setForm(current => ({ ...current, [target.name]: target.type === 'checkbox' ? target.checked : target.value }));
    const input = (name, type = 'text', extra = {}) => <input name={name} type={type} value={form[name]} onChange={change} className={inputClasses} {...extra} />;
    const check = (name, label) => <label className="flex items-center gap-2 text-sm text-charcoal"><input type="checkbox" name={name} checked={form[name]} onChange={change} className="accent-saddle-brown" />{label}</label>;
    async function submit(event) {
        event.preventDefault();
        if (lock.current) return;
        if (!form.title.trim()) return setError('Enter a reminder title.');
        if (form.recurring && (!Number.isInteger(Number(form.recurrence_interval)) || Number(form.recurrence_interval) < 1)) return setError('Enter a whole recurrence interval of at least 1.');
        if (form.medical_enabled && !form.record_type.trim()) return setError('Enter a medical record type.');
        if (form.medical_enabled && form.create_record_on_completion && !form.animal) return setError('Select an animal to create a medical record on completion.');
        lock.current = true; setError('');
        try { await onSubmit(reminderPayload(form)); }
        catch (err) { setError(errorText(err)); }
        finally { lock.current = false; }
    }
    return <form onSubmit={submit} className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <ErrorMessage>{error}</ErrorMessage>
        <fieldset disabled={isLoading} className="space-y-6 disabled:opacity-60">
            <legend className="font-serif text-lg font-bold text-saddle-brown mb-4">Reminder details</legend>
            <Field label="Title *">{input('title', 'text', { required: true, maxLength: 200 })}</Field>
            <Field label="Category"><select name="reminder_type" value={form.reminder_type} onChange={change} className={inputClasses}>{[['general', 'General'], ['medical', 'Medical'], ['appointment', 'Appointment'], ['feed', 'Feed / Supplies'], ['other', 'Other']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <div className="grid gap-6 md:grid-cols-2">
                <Field label="Due date *">{input('due_date', 'date', { required: true })}</Field>
                <Field label="Animal"><select name="animal" value={form.animal} onChange={change} className={inputClasses} disabled={animalsLoading}>
                    <option value="">General — no specific animal</option>
                    {form.animal && !animals.some(a => String(a.id) === String(form.animal)) && <option value={form.animal}>{initialData.animal_name || `Animal #${form.animal}`}</option>}
                    {animals.map(animal => <option key={animal.id} value={animal.id}>{animal.name}</option>)}
                </select></Field>
            </div>
            {animalsLoading && <p role="status" className="text-sm text-charcoal/70">Loading animals…</p>}
            {animalsError && <div role="alert" className="text-sm text-rust">Animals could not be loaded. <button type="button" onClick={refetch} className="underline">Retry</button></div>}
            {data?.next && <p className="text-sm text-rust">The animal query returned only one page. Update the existing getAnimals query to return all selectable animals.</p>}
            <Field label="Description / reminder notes"><textarea name="description" value={form.description} onChange={change} rows={4} className={inputClasses} /></Field>
            {check('active', 'Active reminder')}
            <div className="border-t border-saddle-brown/10 pt-6 space-y-4">
                {check('recurring', 'Repeat this reminder')}
                {form.recurring && <><div className="grid gap-4 md:grid-cols-2">
                    <Field label="Repeat every *">{input('recurrence_interval', 'number', { min: 1, step: 1, required: true })}</Field>
                    <Field label="Unit"><select name="recurrence_unit" value={form.recurrence_unit} onChange={change} className={inputClasses}>{[...new Set([...recurrenceUnits, form.recurrence_unit])].map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></Field>
                </div><p className="text-sm text-charcoal/70">The next due date is calculated by the server from the actual completion date.</p></>}
            </div>
            <div className="border-t border-saddle-brown/10 pt-6 space-y-4">
                {check('medical_enabled', 'Configure medical record on completion')}
                {form.medical_enabled && <>
                    <Field label="Medical record type *">{recordTypes.length ? <select name="record_type" value={form.record_type} onChange={change} required className={inputClasses}><option value="">Select record type</option>{form.record_type && !recordTypes.some(type => type.value === form.record_type) && <option value={form.record_type}>{form.record_type}</option>}{recordTypes.map(type => <option key={type.value} value={type.value}>{type.display_name}</option>)}</select> : input('record_type', 'text', { required: true, maxLength: 30, placeholder: 'Medical record type code' })}</Field>
                    {!recordTypes.length && <p className="text-sm text-charcoal/70">Enter the exact record type code accepted by your medical records.</p>}
                    {check('create_record_on_completion', 'Create a medical record when completed')}
                    {form.create_record_on_completion && <p className="text-sm text-charcoal/70">Requires an animal. Treatment details are entered when you complete the reminder.</p>}
                </>}
            </div>
            <div className="flex justify-end gap-3 border-t border-saddle-brown/10 pt-6">
                <button type="button" onClick={() => navigate('/admin/reminders')} className={secondaryClasses}>Cancel</button>
                <button type="submit" className={primaryClasses}>{isLoading ? 'Saving…' : 'Save Reminder'}</button>
            </div>
        </fieldset>
    </form>;
}

