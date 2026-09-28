import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReminderForm from '../../components/forms/ReminderForm';
import { useGetReminderByIdQuery, useUpdateReminderMutation } from '../../features/api/reminderApi';
import { errorText } from '../../components/admin/reminderUtils';
import { ErrorMessage, secondaryClasses } from '../../components/admin/ReminderFields';

export default function ReminderEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentData: reminder, isLoading, isFetching, error, refetch } = useGetReminderByIdQuery(id);
    const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();
    async function submit(data) {
        await updateReminder({ ...data, id }).unwrap();
        navigate('/admin/reminders', { state: { reminderNotice: 'Reminder saved.' } });
    }
    if (isLoading || (!reminder && isFetching)) return <p role="status" className="text-saddle-brown">Loading reminder…</p>;
    if (error || !reminder) return <div className="space-y-4"><ErrorMessage>{errorText(error)}</ErrorMessage><button onClick={refetch} className={secondaryClasses}>Retry</button><Link to="/admin/reminders" className="ml-4 underline">Back to reminders</Link></div>;
    return <div className="max-w-4xl mx-auto space-y-6">
        <div><h2 className="font-serif text-2xl font-bold text-saddle-brown">Edit {reminder.title}</h2><p className="mt-1 text-sm text-charcoal/70">Update the schedule and medical settings.</p></div>
        <ReminderForm key={id} initialData={reminder} onSubmit={submit} isLoading={isUpdating} />
        {reminder.completions?.length > 0 && <section className="rounded-[var(--radius-xl)] bg-white border border-saddle-brown/10 p-6"><h3 className="font-serif text-lg font-bold text-saddle-brown">Completion history</h3><ul className="divide-y divide-saddle-brown/10">{[...reminder.completions].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)).map(item => <li key={item.id} className="py-3 text-sm"><p>{new Date(item.completed_at).toLocaleString()}{item.completed_by_name ? ` · ${item.completed_by_name}` : ''}</p>{item.notes && <p className="mt-1 whitespace-pre-wrap text-charcoal/70">{item.notes}</p>}</li>)}</ul></section>}
    </div>;
}
