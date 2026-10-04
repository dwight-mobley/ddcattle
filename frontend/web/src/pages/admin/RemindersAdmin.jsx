import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGetRemindersQuery } from '../../features/api/reminderApi';
import ReminderCompleteButton from '../../components/admin/ReminderCompleteButton';
import { displayDate, errorText, groupOf, rowsOf } from '../../components/admin/reminderUtils';
import { ErrorMessage, inputClasses, primaryClasses, secondaryClasses } from '../../components/admin/ReminderFields';

const groups = ['Overdue', 'Upcoming', 'Completed / inactive', 'Unscheduled'];
export default function RemindersAdmin() {
    const location = useLocation();
    const [page, setPage] = useState(1);
    const { currentData: data, isLoading, isFetching, error, refetch } = useGetRemindersQuery({ page });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    
    const [notice, setNotice] = useState(location.state?.reminderNotice || '');
    const reminders = rowsOf(data);
    const visible = reminders.filter(item => `${item.title} ${item.animal_name || 'General'} ${item.description || ''}`.toLowerCase().includes(search.toLowerCase()));
    return <div className="min-w-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4"><div><h2 className="font-serif text-2xl font-bold text-saddle-brown">Reminders</h2><p className="mt-1 break-words text-sm text-charcoal/70">Keep track of daily tasks and animal care.</p></div><Link to="/admin/reminders/new" className={primaryClasses}>+ Add Reminder</Link></div>
        {notice && <p role="status" className="rounded-lg bg-sage/20 p-4 text-saddle-brown">{notice}</p>}
        <ErrorMessage>{error ? errorText(error) : ''}</ErrorMessage>
        {error && <button className={secondaryClasses} onClick={refetch}>Retry</button>}
        {data && <>
            <div className="grid gap-3 sm:grid-cols-3">{groups.slice(0, 3).map(group => <button key={group} onClick={() => setFilter(group)} aria-pressed={filter === group} className={`rounded-[var(--radius-xl)] border p-4 text-left ${filter === group ? 'border-saddle-brown bg-desert-sand' : 'border-saddle-brown/10 bg-white'}`}><span className="block text-sm text-charcoal/70">{group}</span><span className={`font-serif text-2xl font-bold ${group === 'Overdue' ? 'text-rust' : 'text-saddle-brown'}`}>{reminders.filter(item => groupOf(item) === group).length}</span></button>)}</div>
            <div className="flex flex-col sm:flex-row gap-3"><label className="min-w-0 flex-1"><span className="sr-only">Search reminders</span><input type="search" placeholder="Search reminders or animals…" value={search} onChange={event => setSearch(event.target.value)} className={inputClasses} /></label><label><span className="sr-only">Status</span><select value={filter} onChange={event => setFilter(event.target.value)} className={inputClasses}>{['All', ...groups].map(group => <option key={group}>{group}</option>)}</select></label><button className={secondaryClasses} onClick={refetch} disabled={isFetching}>Refresh</button></div>
            {!reminders.length && <div className="rounded-[var(--radius-xl)] bg-white border border-saddle-brown/10 p-8 text-center"><h3 className="font-serif font-bold text-saddle-brown">No reminders yet</h3><p className="text-sm text-charcoal/70 mt-2">Add your first reminder to get started.</p></div>}
            {reminders.length > 0 && !visible.some(item => filter === 'All' || groupOf(item) === filter) && <p className="text-charcoal/70">No reminders match your filters.</p>}
            {groups.filter(group => filter === 'All' || filter === group).map(group => {
                const items = visible.filter(item => groupOf(item) === group).sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
                if (!items.length) return null;
                return <section key={group} className="overflow-hidden rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white shadow-sm"><h3 className={`bg-sage/10 px-4 sm:px-6 py-4 text-sm font-semibold uppercase tracking-wider ${group === 'Overdue' ? 'text-rust' : 'text-saddle-brown'}`}>{group}</h3><ul className="divide-y divide-saddle-brown/10">{items.map(item => <li key={item.id} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-desert-sand/30"><div className="min-w-0 flex-1"><h4 className="font-medium text-charcoal break-words">{item.title}</h4><p className="mt-1 break-words text-sm text-charcoal/70">{item.animal_name || (item.animal ? `Animal #${item.animal}` : 'General')} · {displayDate(item.due_date)}</p><p className="mt-1 break-words text-xs text-saddle-brown">{item.medical ? 'Medical' : item.reminder_type || 'General'}{item.recurring ? ` · Every ${item.recurrence_interval} ${item.recurrence_unit}` : ' · One-time'}</p></div><div className="flex w-full sm:w-auto items-center gap-3 sm:gap-4"><Link to={`/admin/reminders/${item.id}/edit`} className="inline-flex min-h-11 sm:min-h-0 flex-1 sm:flex-none items-center justify-center px-3 sm:px-0 text-sm text-saddle-brown underline" aria-label={`Edit ${item.title}`}>Edit</Link>
                {item.active !== false && <ReminderCompleteButton reminder={item} onCompleted={() => { setNotice('Reminder completed. The schedule has been refreshed.'); }} className={primaryClasses} />}</div></li>)}</ul></section>;
            })}
            {!Array.isArray(data) && (data.next || data.previous || page > 1) && <div className="space-y-3"><p className="text-sm text-charcoal/70">Counts and search apply to this page. {data.count != null ? `${data.count} reminders total.` : ''}</p><div className="flex flex-wrap sm:flex-nowrap gap-3 items-center"><button disabled={!data.previous || isFetching} onClick={() => setPage(value => value - 1)} className={secondaryClasses}>Previous</button><span>Page {page}</span><button disabled={!data.next || isFetching} onClick={() => setPage(value => value + 1)} className={secondaryClasses}>Next</button></div></div>}
        </>}
        {(isLoading || isFetching) && <p role="status" className="text-saddle-brown">Loading reminders…</p>}
       
    </div>;
}
