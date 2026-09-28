import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReminderForm from '../../components/forms/ReminderForm';
import { useAddReminderMutation } from '../../features/api/reminderApi';

export default function ReminderCreate() {
    const navigate = useNavigate();
    const [addReminder, { isLoading }] = useAddReminderMutation();
    async function submit(data) {
        await addReminder(data).unwrap();
        navigate('/admin/reminders', { state: { reminderNotice: 'Reminder created.' } });
    }
    return <div className="max-w-4xl mx-auto space-y-6">
        <div><h2 className="font-serif text-2xl font-bold text-saddle-brown">Add Reminder</h2><p className="mt-1 text-sm text-charcoal/70">Plan a general task or care for an animal.</p></div>
        <ReminderForm onSubmit={submit} isLoading={isLoading} />
    </div>;
}
