import React, { useEffect, useRef, useState } from 'react';
import { useCompleteReminderMutation } from '../../features/api/reminderApi';
import { errorText, localDateTime } from './reminderUtils';
import { ErrorMessage, Field, inputClasses, primaryClasses, secondaryClasses } from './ReminderFields';

export default function ReminderCompleteDialog({ reminder, onClose, onCompleted }) {
    const dialog = useRef(null);
    const lock = useRef(false);
    const [complete, { isLoading }] = useCompleteReminderMutation();
    const [error, setError] = useState('');
    const [backdate, setBackdate] = useState(false);
    const [form, setForm] = useState({ completed_at: localDateTime(), notes: '', description: '', veterinarian: '', clinic: '', medication: '', dosage: '' });
    const createsRecord = Boolean(reminder.medical?.create_record_on_completion);
    useEffect(() => {
        const element = dialog.current;
        const previousFocus = document.activeElement;
        element.showModal();
        return () => { element.close(); previousFocus?.focus(); };
    }, []);
    const change = ({ target }) => setForm(current => ({ ...current, [target.name]: target.value }));
    async function submit(event) {
        event.preventDefault();
        if (lock.current) return;
        const completed = new Date(form.completed_at);
        if (backdate && (Number.isNaN(completed.getTime()) || completed > new Date())) {
            setError('Choose a valid completion date and time that is not in the future.'); return;
        }
        const payload = { id: reminder.id, notes: form.notes };
        if (backdate) payload.completed_at = completed.toISOString();
        if (createsRecord) ['description', 'veterinarian', 'clinic', 'medication', 'dosage'].forEach(key => { payload[key] = form[key]; });
        lock.current = true; setError('');
        try { await complete(payload).unwrap(); onCompleted(); }
        catch (err) { setError(errorText(err)); }
        finally { lock.current = false; }
    }
    return <dialog ref={dialog} aria-labelledby="completion-title" onCancel={event => { event.preventDefault(); if (!lock.current) onClose(); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-[var(--radius-xl)] border border-saddle-brown/20 bg-desert-sand p-4 sm:p-6 text-charcoal shadow-xl backdrop:bg-charcoal/40 backdrop:backdrop-blur-sm">
        <h2 id="completion-title" className="break-words font-serif text-xl font-bold text-saddle-brown">Complete {reminder.title}</h2>
        <p className="mt-2 mb-5 text-sm text-charcoal/70">{reminder.recurring ? 'The next due date will be based on when this was completed.' : 'Record the completion of this reminder.'}</p>
        <form onSubmit={submit} className="min-w-0 space-y-4">
            <ErrorMessage>{error}</ErrorMessage>
            <fieldset disabled={isLoading} className="min-w-0 space-y-4">
                <label className="flex min-h-11 sm:min-h-0 gap-3 items-center text-sm"><input type="checkbox" className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" checked={backdate} onChange={event => setBackdate(event.target.checked)} />Use an earlier completion date</label>
                {backdate ? <Field label="Completed at (your local time) *"><input type="datetime-local" required name="completed_at" value={form.completed_at} max={localDateTime()} onChange={change} className={inputClasses} /></Field> : <p className="text-sm text-charcoal/70">The server will record the current time when you submit.</p>}
                <Field label="Completion notes"><textarea name="notes" value={form.notes} onChange={change} rows={3} className={inputClasses} /></Field>
                {createsRecord && <div className="border-t border-saddle-brown/10 pt-4 space-y-4">
                    <h3 className="font-serif font-bold text-saddle-brown">Medical record details</h3>
                    <p className="text-sm text-charcoal/70">Creates a {reminder.medical.record_type} record for {reminder.animal_name || 'the selected animal'}.</p>
                    <Field label="Description"><textarea name="description" value={form.description} onChange={change} rows={3} className={inputClasses} /></Field>
                    <div className="grid gap-4 sm:grid-cols-2">{['veterinarian', 'clinic', 'medication', 'dosage'].map(name => <Field key={name} label={name.charAt(0).toUpperCase() + name.slice(1)}><input name={name} value={form[name]} onChange={change} className={inputClasses} /></Field>)}</div>
                </div>}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className={secondaryClasses}>Cancel</button>
                    <button type="submit" className={primaryClasses}>{isLoading ? 'Completing…' : 'Complete Reminder'}</button>
                </div>
            </fieldset>
        </form>
    </dialog>;
}
