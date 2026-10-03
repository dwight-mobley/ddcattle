import React from 'react';

export const inputClasses = 'w-full min-w-0 max-w-full min-h-11 sm:min-h-0 text-base rounded-lg border border-saddle-brown/20 bg-white px-4 py-2 text-charcoal focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-colors';
export const primaryClasses = 'inline-flex w-full sm:w-auto min-h-11 sm:min-h-0 items-center justify-center text-center rounded-lg bg-saddle-brown px-5 py-2 text-sm font-medium text-desert-sand hover:bg-saddle-brown/90 disabled:opacity-50';
export const secondaryClasses = 'inline-flex w-full sm:w-auto min-h-11 sm:min-h-0 items-center justify-center text-center rounded-lg border border-saddle-brown/20 bg-white px-5 py-2 text-sm font-medium text-charcoal hover:bg-sage/10 disabled:opacity-50';
export function Field({ label, children }) {
    return <label className="block min-w-0 space-y-1"><span className="block text-sm font-medium text-saddle-brown">{label}</span>{children}</label>;
}
export function ErrorMessage({ children }) {
    return children ? <div role="alert" className="rounded-lg border border-rust/20 bg-rust/10 p-4 text-sm text-rust whitespace-pre-wrap break-words">{children}</div> : null;
}
