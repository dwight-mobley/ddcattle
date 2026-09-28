// Choices from the supplied Reminder model.
export const recurrenceUnits = ['days', 'weeks', 'months', 'years'];
export const rowsOf = (data) => Array.isArray(data) ? data : data?.results || [];
export const animalId = (animal) => animal && typeof animal === 'object' ? animal.id : animal;
export function localDateTime(date = new Date()) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
export function today() { return localDateTime().slice(0, 10); }
export function groupOf(reminder) {
    if (reminder.active === false) return 'Completed / inactive';
    if (!reminder.due_date) return 'Unscheduled';
    return reminder.due_date.slice(0, 10) < today() ? 'Overdue' : 'Upcoming';
}
export function displayDate(value) {
    if (!value) return 'No date';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
export function errorText(error) {
    const flatten = (value, prefix = '') => {
        if (Array.isArray(value)) return value.map(item => flatten(item, prefix)).join(' ');
        if (value && typeof value === 'object') return Object.entries(value).map(([key, item]) => flatten(item, prefix ? `${prefix}.${key}` : key)).join(' ');
        return `${prefix ? `${prefix}: ` : ''}${String(value ?? '')}`;
    };
    return flatten(error?.data || error?.message || error?.error || 'Something went wrong. Please try again.');
}
export function reminderPayload(form) {
    return {
        title: form.title.trim(), reminder_type: form.reminder_type, description: form.description, animal: form.animal || null,
        due_date: form.due_date, active: form.active, recurring: form.recurring,
        recurrence_interval: form.recurring ? Number(form.recurrence_interval) : null,
        recurrence_unit: form.recurring ? form.recurrence_unit : null,
        medical: form.medical_enabled ? { record_type: form.record_type.trim(), create_record_on_completion: form.create_record_on_completion } : null,
    };
}

