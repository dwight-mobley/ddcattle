import React from 'react';
import { useNavigate } from 'react-router-dom';

import ReminderForm from '../../components/forms/ReminderForm';

import {
    useAddReminderMutation,
    useBulkAddRemindersMutation,
} from '../../features/api/reminderApi';


export default function ReminderCreate() {
    const navigate = useNavigate();

    const [
        addReminder,
        { isLoading: isAdding },
    ] = useAddReminderMutation();

    const [
        bulkAddReminders,
        { isLoading: isBulkAdding },
    ] = useBulkAddRemindersMutation();


    async function submit(data, bulk = false) {
        if (bulk) {
            const result =
                await bulkAddReminders(data).unwrap();

            const count =
                result?.count || data.animals.length;

            navigate(
                '/admin/reminders',
                {
                    state: {
                        reminderNotice:
                            `${count} ${
                                count === 1
                                    ? 'reminder'
                                    : 'reminders'
                            } created.`,
                    },
                }
            );

            return;
        }

        await addReminder(data).unwrap();

        navigate(
            '/admin/reminders',
            {
                state: {
                    reminderNotice:
                        'Reminder created.',
                },
            }
        );
    }


    return (
        <div className="w-full min-w-0 max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div>
                <h2 className="break-words font-serif text-xl sm:text-2xl font-bold text-saddle-brown">
                    Add Reminder
                </h2>

                <p className="mt-1 text-sm text-charcoal/70">
                    Plan a general task or care for one or more animals.
                </p>
            </div>

            <ReminderForm
                mode="create"
                onSubmit={submit}
                isLoading={
                    isAdding ||
                    isBulkAdding
                }
            />
        </div>
    );
}