import { useMemo, useState } from 'react';

import { useGetAnimalTimelineQuery } from '../../../features/api/animalApi';

import TimelineMedicalEvent from './TimelineMedicalEvent';
import TimelineReminderEvent from './TimelineReminderEvent';
import TimelineMediaGroup from './TimelineMediaGroup';
import TimelineActivityEvent from './TimelineActivityEvent';

function getMonthKey(date) {
  const value = new Date(date);

  return `${value.getFullYear()}-${String(
    value.getMonth() + 1
  ).padStart(2, '0')}`;
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function formatEventDate(event) {
  // Media represents an entire month rather than one specific day.
  if (event.type === 'media-group') {
    return event.label;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(event.date));
}

const filters = [
  { id: 'training', label: 'Training' },
  { id: 'ride', label: 'Rides' },
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'medical',
    label: 'Medical',
  },
  {
    id: 'reminder',
    label: 'Reminders',
  },
  {
    id: 'media-group',
    label: 'Media',
  },
];

export default function AnimalTimeline({
  slug,
  animalName,
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const {
    data: timeline = [],
    isLoading,
    error,
  } = useGetAnimalTimelineQuery(slug);

  const events = useMemo(() => {
    if (!timeline.length) {
      return [];
    }

    const regularEvents = [];
    const mediaGroups = new Map();

    timeline.forEach((event) => {
      if (event.type !== 'media') {
        regularEvents.push({
          ...event,
          sortDate: new Date(event.date),
        });

        return;
      }

      const key = getMonthKey(event.date);

      if (!mediaGroups.has(key)) {
        mediaGroups.set(key, {
          id: `media-group-${key}`,
          type: 'media-group',
          label: getMonthLabel(event.date),
          date: event.date,
          sortDate: new Date(event.date),
          items: [],
        });
      }

      const group = mediaGroups.get(key);

      group.items.push(event);

      if (new Date(event.date) > group.sortDate) {
        group.date = event.date;
        group.sortDate = new Date(event.date);
      }
    });

    return [
      ...regularEvents,
      ...Array.from(mediaGroups.values()),
    ].sort(
      (a, b) => b.sortDate - a.sortDate
    );
  }, [timeline]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') {
      return events;
    }

    return events.filter(
      (event) => event.type === activeFilter
    );
  }, [events, activeFilter]);

  if (isLoading) {
    return (
      <section>
        <h1 className="text-3xl font-serif text-saddle-brown mb-6">
          {animalName}'s Timeline
        </h1>

        <div className="bg-white rounded-xl border border-sage/20 p-8 text-center text-charcoal/50">
          Loading timeline...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 className="text-3xl font-serif text-saddle-brown mb-6">
          {animalName}'s Timeline
        </h1>

        <div className="bg-rust/10 border border-rust/20 rounded-xl p-6 text-rust">
          Unable to load this animal's timeline.
        </div>
      </section>
    );
  }

  if (!events.length) {
    return (
      <section>
        <h1 className="text-3xl font-serif text-saddle-brown mb-6">
          {animalName}'s Timeline
        </h1>

        <div className="bg-white rounded-xl border border-sage/20 p-8 text-center">
          <p className="text-charcoal/50 italic">
            No timeline history yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-sage font-bold mb-2">
          History
        </p>

        <h1 className="text-3xl md:text-4xl font-serif text-saddle-brown">
          {animalName}'s Timeline
        </h1>

        <p className="mt-2 text-charcoal/55 max-w-2xl">
          Medical history, completed reminders, rides, training, and media
          throughout {animalName}'s life.
        </p>
      </header>

      {/* Timeline Filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-4 py-2 rounded-full
                text-xs font-bold uppercase tracking-widest
                border transition-colors duration-200
                ${
                  isActive
                    ? 'bg-saddle-brown border-saddle-brown text-white'
                    : 'bg-white border-sage/30 text-charcoal/60 hover:border-rust hover:text-rust'
                }
              `}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-sage/20 p-8 text-center">
          <p className="text-charcoal/50 italic">
            No {filters
              .find((filter) => filter.id === activeFilter)
              ?.label.toLowerCase()} history yet.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline rail */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-sage/30" />

          <div className="space-y-7">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="relative pl-9 md:pl-11"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-[5px] w-[15px] h-[15px] rounded-full bg-desert-sand border-[3px] border-rust z-10" />

                {/* Date belongs to the timeline */}
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-sage font-bold">
                  {formatEventDate(event)}
                </p>

                {(event.type === 'ride' || event.type === 'training') && <TimelineActivityEvent event={event} slug={slug} />}

                {event.type === 'medical' && (
                  <TimelineMedicalEvent event={event} />
                )}

                {event.type === 'reminder' && (
                  <TimelineReminderEvent event={event} />
                )}

                {event.type === 'media-group' && (
                  <TimelineMediaGroup group={event} slug={slug} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}