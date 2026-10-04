import { errorText } from './trainingUtils';
import { cloneElement, useId } from 'react';

export function Field({ label, children }) {
  const id = useId();
  return <div className="text-sm font-semibold text-charcoal/80"><label className="mb-2 block" htmlFor={id}>{label}</label>{cloneElement(children, { id })}</div>;
}
export function ErrorNotice({ error }) {
  return error ? <p role="alert" className="rounded-lg bg-rust/10 p-4 text-sm text-rust whitespace-pre-wrap">{errorText(error)}</p> : null;
}
export function Empty({ children }) {
  return <p className="rounded-xl border border-sage/20 bg-white p-8 text-center text-charcoal/65">{children}</p>;
}
