

export default function TimelineReminderEvent({ event }) {
  const { data } = event;

  return (
    <article className="bg-white/70 rounded-lg border border-sage/15 px-5 py-4">
      <div className="">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-sage">
              Reminder Completed
            </span>

            {data.reminder_type_display && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sage/10 text-saddle-brown font-semibold">
                {data.reminder_type_display}
              </span>
            )}
          </div>

          <h3 className="text-lg font-serif text-saddle-brown">
            {event.title}
          </h3>
        </div>

       
      </div>

      {event.description && (
        <p className="mt-2 text-sm text-charcoal/70">
          {event.description}
        </p>
      )}

      {data.notes && (
        <p className="mt-2 text-sm text-charcoal/60">
          <span className="font-semibold">Note:</span>{' '}
          {data.notes}
        </p>
      )}

      {data.recurring && (
        <span className="inline-block mt-2 text-[10px] uppercase tracking-widest text-charcoal/40 font-semibold">
          Recurring
        </span>
      )}
    </article>
  );
}