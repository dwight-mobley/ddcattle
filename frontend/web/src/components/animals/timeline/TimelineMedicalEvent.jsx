import React from 'react';

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export default function TimelineMedicalEvent({ event }) {
  const { data } = event;

  const hasMeasurements =
    data.weight != null || data.height != null;

  const hasTreatmentDetails =
    data.veterinarian ||
    data.clinic ||
    data.medication ||
    data.dosage ||
    data.follow_up_date;

  return (
    <article className="bg-white rounded-xl border border-sage/20 shadow-sm p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-rust">
          Medical
        </span>

        {data.record_type_display && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-sage/10 text-saddle-brown font-semibold">
            {data.record_type_display}
          </span>
        )}
      </div>

      <h3 className="text-xl font-serif text-saddle-brown">
        {event.title}
      </h3>

      

      {event.description && (
        <p className="mt-3 text-charcoal/75 leading-relaxed">
          {event.description}
        </p>
      )}

      {hasMeasurements && (
        <div className="flex flex-wrap gap-x-10 gap-y-3 mt-4 pt-4 border-t border-sage/15">
          {data.weight != null && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-sage font-bold">
                Weight
              </p>

              <p className="font-semibold mt-0.5">
                {Number(data.weight).toLocaleString()} lbs
              </p>
            </div>
          )}

          {data.height != null && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-sage font-bold">
                Height
              </p>

              <p className="font-semibold mt-0.5">
                {data.height} hh
              </p>
            </div>
          )}
        </div>
      )}

      {hasTreatmentDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4 pt-4 border-t border-sage/15 text-sm text-charcoal/75">
          {data.veterinarian && (
            <p>
              <span className="font-semibold text-charcoal">
                Veterinarian:
              </span>{' '}
              {data.veterinarian}
            </p>
          )}

          {data.clinic && (
            <p>
              <span className="font-semibold text-charcoal">
                Clinic:
              </span>{' '}
              {data.clinic}
            </p>
          )}

          {data.medication && (
            <p>
              <span className="font-semibold text-charcoal">
                Medication:
              </span>{' '}
              {data.medication}
            </p>
          )}

          {data.dosage && (
            <p>
              <span className="font-semibold text-charcoal">
                Dosage:
              </span>{' '}
              {data.dosage}
            </p>
          )}

          {data.follow_up_date && (
            <p>
              <span className="font-semibold text-charcoal">
                Follow-up:
              </span>{' '}
              {new Date(
                `${data.follow_up_date}T00:00:00`
              ).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </article>
  );
}