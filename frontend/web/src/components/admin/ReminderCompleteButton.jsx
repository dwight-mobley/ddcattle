import React, { useState } from 'react';

import ReminderCompleteDialog from './ReminderCompleteDialog';
import { primaryClasses } from './ReminderFields';


export default function ReminderCompleteButton({
    reminder,
    onCompleted,
    className = primaryClasses,
}) {
    const [open, setOpen] = useState(false);

    if (!reminder || reminder.active === false) {
        return null;
    }

    function handleCompleted(result) {
        setOpen(false);

        if (onCompleted) {
            onCompleted(result, reminder);
        }
    }

    return (
        <>
            <button
                type="button"
                className={className}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen(true);
                }}
                aria-label={`Complete ${reminder.title}${
                    reminder.animal_name
                        ? ` for ${reminder.animal_name}`
                        : ''
                }`}
            >
                Complete
            </button>

            {open && (
                <ReminderCompleteDialog
                    key={reminder.id}
                    reminder={reminder}
                    onClose={() => setOpen(false)}
                    onCompleted={handleCompleted}
                />
            )}
        </>
    );
}