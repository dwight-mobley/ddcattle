import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
    useGetRemindersQuery,
} from '../../features/api/reminderApi';

import {
    useGetMedicalRecordsQuery,
} from '../../features/api/medicalApi';

import ReminderCompleteButton
    from '../../components/admin/ReminderCompleteButton';


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


function groupReminders(reminders) {
    const groups = new Map();

    reminders.forEach((reminder) => {
        const normalizedTitle = (reminder.title || '')
            .trim()
            .toLowerCase();

        // Same task on a different due date should remain
        // a separate dashboard group.
        const key = [
            normalizedTitle,
            reminder.due_date || '',
        ].join('|');

        if (!groups.has(key)) {
            groups.set(key, {
                key,
                title: reminder.title,
                due_date: reminder.due_date,
                reminders: [],
            });
        }

        groups.get(key).reminders.push(reminder);
    });

    return Array.from(groups.values()).map((group) => ({
        ...group,
        reminders: [...group.reminders].sort((a, b) =>
            (a.animal_name || '').localeCompare(
                b.animal_name || ''
            )
        ),
    }));
}


function localDateString(date = new Date()) {
    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 10);
}


function displayDate(value) {
    if (!value) return '';

    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T12:00:00`)
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}


function StatCard({
    label,
    value,
    detail,
    href,
}) {
    const content = (
        <div className="h-full rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 shadow-sm transition-colors hover:border-saddle-brown/20 sm:p-5">
            <div className="text-3xl font-bold text-saddle-brown">
                {value}
            </div>

            <div className="mt-1 text-sm font-semibold text-charcoal">
                {label}
            </div>

            {detail && (
                <div className="mt-1 text-xs text-charcoal/50">
                    {detail}
                </div>
            )}
        </div>
    );

    if (!href) {
        return content;
    }

    return (
        <Link
            to={href}
            className="block"
        >
            {content}
        </Link>
    );
}


function Section({
    title,
    action,
    children,
    defaultOpen = true,
    collapsible = true,
}) {
    const [isOpen, setIsOpen] =
        React.useState(defaultOpen);

    return (
        <section className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white shadow-sm">
            <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <button
                    type="button"
                    onClick={() => {
                        if (collapsible) {
                            setIsOpen(
                                (current) => !current
                            );
                        }
                    }}
                    className={`flex min-w-0 flex-1 items-center gap-2 text-left ${
                        collapsible
                            ? 'cursor-pointer'
                            : 'cursor-default'
                    }`}
                    aria-expanded={isOpen}
                >
                    {collapsible && (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`h-4 w-4 shrink-0 text-saddle-brown transition-transform ${
                                isOpen
                                    ? 'rotate-90'
                                    : ''
                            }`}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    )}

                    <h2 className="truncate font-serif text-lg font-bold text-saddle-brown">
                        {title}
                    </h2>
                </button>

                {action && (
                    <div
                        className="shrink-0"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {action}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="border-t border-saddle-brown/10">
                    {children}
                </div>
            )}
        </section>
    );
}


function ReminderGroup({
    group,
    urgent = false,
}) {
    const [isOpen, setIsOpen] =
        React.useState(false);

    const reminders = group.reminders;
    const count = reminders.length;
    const single = count === 1;
    const reminder = reminders[0];


    // One reminder does not need an expandable group.
    if (single) {
        return (
            <div className="flex flex-col gap-3 border-b border-saddle-brown/10 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-charcoal">
                            {reminder.title}
                        </span>

                        {urgent && (
                            <span className="rounded-full bg-rust/10 px-2 py-0.5 text-xs font-semibold text-rust">
                                Overdue
                            </span>
                        )}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-2 text-sm text-charcoal/60">
                        <span>
                            {reminder.animal_name ||
                                (
                                    reminder.animal
                                        ? `Animal #${reminder.animal}`
                                        : 'General'
                                )}
                        </span>

                        <span aria-hidden="true">
                            ·
                        </span>

                        <span>
                            {displayDate(
                                reminder.due_date
                            )}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to={`/admin/reminders/${reminder.id}/edit`}
                        className="text-sm text-saddle-brown underline"
                    >
                        Edit
                    </Link>

                    <ReminderCompleteButton
                        reminder={reminder}
                    />
                </div>
            </div>
        );
    }


    return (
        <div className="border-b border-saddle-brown/10 last:border-b-0">

            {/* Group header */}
            <button
                type="button"
                onClick={() =>
                    setIsOpen(
                        (current) => !current
                    )
                }
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-sage/5 sm:px-5"
                aria-expanded={isOpen}
            >
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-charcoal">
                            {group.title}
                        </span>

                        {urgent && (
                            <span className="rounded-full bg-rust/10 px-2 py-0.5 text-xs font-semibold text-rust">
                                Overdue
                            </span>
                        )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-charcoal/60">
                        <span className="font-medium text-saddle-brown">
                            {count} animals
                        </span>

                        <span aria-hidden="true">
                            ·
                        </span>

                        <span>
                            {displayDate(
                                group.due_date
                            )}
                        </span>
                    </div>
                </div>

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-5 w-5 shrink-0 text-saddle-brown transition-transform ${
                        isOpen
                            ? 'rotate-180'
                            : ''
                    }`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 9l6 6 6-6"
                    />
                </svg>
            </button>


            {/* Individual animals */}
            {isOpen && (
                <div className="border-t border-saddle-brown/10 bg-desert-sand/30">
                    {reminders.map(
                        (reminder) => (
                            <div
                                key={
                                    reminder.id
                                }
                                className="flex flex-col gap-3 border-b border-saddle-brown/10 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:pl-8 sm:pr-5"
                            >
                                <div className="min-w-0">
                                    <div className="font-medium text-charcoal">
                                        {reminder.animal_name ||
                                            (
                                                reminder.animal
                                                    ? `Animal #${reminder.animal}`
                                                    : 'General'
                                            )}
                                    </div>

                                    {reminder.description && (
                                        <div className="mt-1 line-clamp-2 text-xs text-charcoal/60">
                                            {
                                                reminder.description
                                            }
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        to={`/admin/reminders/${reminder.id}/edit`}
                                        className="text-sm text-saddle-brown underline"
                                    >
                                        Edit
                                    </Link>

                                    <ReminderCompleteButton
                                        reminder={
                                            reminder
                                        }
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}


function MedicalRow({ record }) {
    return (
        <Link
            to={`/admin/medical/${record.id}/edit`}
            className="flex min-h-16 items-center justify-between gap-4 border-b border-saddle-brown/10 px-4 py-3 transition-colors last:border-b-0 hover:bg-sage/5 sm:px-5"
        >
            <div className="min-w-0">
                <div className="font-medium text-charcoal">
                    {record.title}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-charcoal/60">
                    <span>
                        {record.animal_name}
                    </span>

                    <span aria-hidden="true">
                        ·
                    </span>

                    <span>
                        {RECORD_TYPE_LABELS[
                            record.record_type
                        ] || record.record_type}
                    </span>
                </div>
            </div>

            <div className="shrink-0 text-sm text-charcoal/60">
                {displayDate(record.date)}
            </div>
        </Link>
    );
}


function EmptyState({ children }) {
    return (
        <div className="px-4 py-8 text-center text-sm text-charcoal/60 sm:px-5">
            {children}
        </div>
    );
}


function LoadingSection() {
    return (
        <div className="px-4 py-8 text-center text-sm text-charcoal/60 sm:px-5">
            Loading...
        </div>
    );
}


export default function Dashboard() {
    const {
        data: reminderData,
        isLoading: remindersLoading,
        isError: remindersError,
    } = useGetRemindersQuery();

    const {
        data: medicalData,
        isLoading: medicalLoading,
        isError: medicalError,
    } = useGetMedicalRecordsQuery();


    const reminders = Array.isArray(reminderData)
        ? reminderData
        : reminderData?.results || [];

    const medicalRecords =
        Array.isArray(medicalData)
            ? medicalData
            : medicalData?.results || [];


    const today = localDateString();


    /*
     * First divide individual reminders into
     * overdue, today and upcoming.
     */
    const {
        overdue,
        dueToday,
        upcoming,
    } = useMemo(() => {
        const active = reminders.filter(
            (reminder) =>
                reminder.active !== false &&
                reminder.due_date
        );

        const overdueItems = active
            .filter(
                (reminder) =>
                    reminder.due_date < today
            )
            .sort((a, b) =>
                a.due_date.localeCompare(
                    b.due_date
                )
            );

        const todayItems = active
            .filter(
                (reminder) =>
                    reminder.due_date === today
            )
            .sort((a, b) =>
                (a.title || '').localeCompare(
                    b.title || ''
                )
            );

        const upcomingItems = active
            .filter(
                (reminder) =>
                    reminder.due_date > today
            )
            .sort((a, b) =>
                a.due_date.localeCompare(
                    b.due_date
                )
            );

        return {
            overdue: overdueItems,
            dueToday: todayItems,
            upcoming: upcomingItems,
        };
    }, [reminders, today]);


    /*
     * Now group reminders that represent the
     * same job on the same date.
     *
     * Example:
     * Worming - Titus
     * Worming - Henry
     * Worming - Tid
     *
     * becomes:
     * Worming - 3 animals
     */
    const overdueGroups = useMemo(
        () => groupReminders(overdue),
        [overdue]
    );

    const dueTodayGroups = useMemo(
        () => groupReminders(dueToday),
        [dueToday]
    );

    const upcomingGroups = useMemo(
        () => groupReminders(upcoming),
        [upcoming]
    );


    const recentMedical = useMemo(() => {
        return [...medicalRecords]
            .sort((a, b) => {
                const dateCompare =
                    (b.date || '').localeCompare(
                        a.date || ''
                    );

                if (dateCompare !== 0) {
                    return dateCompare;
                }

                return (
                    b.created_at || ''
                ).localeCompare(
                    a.created_at || ''
                );
            })
            .slice(0, 5);
    }, [medicalRecords]);


    // Show five upcoming jobs, not five animals.
    const nextUpcoming =
        upcomingGroups.slice(0, 5);


    // This represents the number of individual
    // animals/reminders requiring attention.
    const attentionCount =
        overdue.length + dueToday.length;


    return (
        <div className="space-y-5 sm:space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-saddle-brown">
                        Ranch Overview
                    </h2>

                    <p className="mt-1 text-sm text-charcoal/70">
                        What needs your attention today.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Link
                        to="/admin/reminders/new"
                        className="flex min-h-11 items-center justify-center rounded-lg border border-saddle-brown/20 bg-white px-4 py-2 text-sm font-medium text-saddle-brown hover:bg-sage/10"
                    >
                        Add Reminder
                    </Link>

                    <Link
                        to="/admin/medical/new"
                        className="flex min-h-11 items-center justify-center rounded-lg bg-saddle-brown px-4 py-2 text-sm font-medium text-desert-sand hover:bg-saddle-brown/90"
                    >
                        Add Medical
                    </Link>
                </div>
            </div>


            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    label="Needs Attention"
                    value={
                        remindersLoading
                            ? '—'
                            : attentionCount
                    }
                    detail="Overdue + due today"
                    href="/admin/reminders"
                />

                <StatCard
                    label="Overdue"
                    value={
                        remindersLoading
                            ? '—'
                            : overdue.length
                    }
                    detail="Active reminders"
                    href="/admin/reminders"
                />

                <StatCard
                    label="Upcoming"
                    value={
                        remindersLoading
                            ? '—'
                            : upcoming.length
                    }
                    detail="Future reminders"
                    href="/admin/reminders"
                />

                <StatCard
                    label="Medical Records"
                    value={
                        medicalLoading
                            ? '—'
                            : medicalRecords.length
                    }
                    detail="Recorded history"
                    href="/admin/medical"
                />
            </div>


            {/* Quick Actions */}
            <Section
                title="Quick Actions"
                defaultOpen={false}
            >
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">

                    <Link
                        to="/admin/animals/new"
                        className="flex min-h-20 flex-col items-center justify-center rounded-xl border border-saddle-brown/10 bg-desert-sand/40 px-3 py-4 text-center text-sm font-medium text-saddle-brown transition-colors hover:bg-sage/10"
                    >
                        Add Animal
                    </Link>

                    <Link
                        to="/admin/reminders/new"
                        className="flex min-h-20 flex-col items-center justify-center rounded-xl border border-saddle-brown/10 bg-desert-sand/40 px-3 py-4 text-center text-sm font-medium text-saddle-brown transition-colors hover:bg-sage/10"
                    >
                        Add Reminder
                    </Link>

                    <Link
                        to="/admin/medical/new"
                        className="flex min-h-20 flex-col items-center justify-center rounded-xl border border-saddle-brown/10 bg-desert-sand/40 px-3 py-4 text-center text-sm font-medium text-saddle-brown transition-colors hover:bg-sage/10"
                    >
                        Add Medical Record
                    </Link>

                    <Link
                        to="/admin/media"
                        className="flex min-h-20 flex-col items-center justify-center rounded-xl border border-saddle-brown/10 bg-desert-sand/40 px-3 py-4 text-center text-sm font-medium text-saddle-brown transition-colors hover:bg-sage/10"
                    >
                        Media Library
                    </Link>

                </div>
            </Section>


            {/* Needs Attention */}
            <Section
                title="Needs Attention"
                action={
                    <Link
                        to="/admin/reminders"
                        className="text-sm font-medium text-saddle-brown hover:underline"
                    >
                        View all
                    </Link>
                }
            >
                {remindersLoading ? (
                    <LoadingSection />
                ) : remindersError ? (
                    <EmptyState>
                        Unable to load reminders.
                    </EmptyState>
                ) : attentionCount === 0 ? (
                    <EmptyState>
                        Nothing is overdue or due today.
                    </EmptyState>
                ) : (
                    <>
                        {overdueGroups.map(
                            (group) => (
                                <ReminderGroup
                                    key={group.key}
                                    group={group}
                                    urgent
                                />
                            )
                        )}

                        {dueTodayGroups.map(
                            (group) => (
                                <ReminderGroup
                                    key={group.key}
                                    group={group}
                                />
                            )
                        )}
                    </>
                )}
            </Section>


            {/* Lower Dashboard */}
            <div className="grid gap-5 lg:grid-cols-2">

                {/* Coming Up */}
                <Section
                    title="Coming Up"
                    action={
                        <Link
                            to="/admin/reminders"
                            className="text-sm font-medium text-saddle-brown hover:underline"
                        >
                            View all
                        </Link>
                    }
                >
                    {remindersLoading ? (
                        <LoadingSection />
                    ) : remindersError ? (
                        <EmptyState>
                            Unable to load reminders.
                        </EmptyState>
                    ) : nextUpcoming.length === 0 ? (
                        <EmptyState>
                            No upcoming reminders.
                        </EmptyState>
                    ) : (
                        nextUpcoming.map(
                            (group) => (
                                <ReminderGroup
                                    key={group.key}
                                    group={group}
                                />
                            )
                        )
                    )}
                </Section>


                {/* Medical */}
                <Section
                    title="Recent Medical Activity"
                    action={
                        <Link
                            to="/admin/medical"
                            className="text-sm font-medium text-saddle-brown hover:underline"
                        >
                            View all
                        </Link>
                    }
                >
                    {medicalLoading ? (
                        <LoadingSection />
                    ) : medicalError ? (
                        <EmptyState>
                            Unable to load medical records.
                        </EmptyState>
                    ) : recentMedical.length === 0 ? (
                        <EmptyState>
                            No medical records yet.
                        </EmptyState>
                    ) : (
                        recentMedical.map(
                            (record) => (
                                <MedicalRow
                                    key={record.id}
                                    record={record}
                                />
                            )
                        )
                    )}
                </Section>

            </div>
        </div>
    );
}