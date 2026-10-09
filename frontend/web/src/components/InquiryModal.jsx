import { useEffect, useRef, useState } from 'react';
import { useSendAnimalInquiryMutation } from '../features/api/animalApi';
import { useSendListingInquiryMutation } from '../features/api/marketplaceApi';

function InquiryForm({ onClose, animal, slug, listingId }) {
  const [form, setForm] = useState({ sender_name: '', sender_email: '', phone: '', message: '', honeypot: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const submission = useRef(null);
  const inFlight = useRef(false);
  const dialog = useRef(null);
  const [sendAnimalInquiry, animalState] = useSendAnimalInquiryMutation();
  const [sendListingInquiry, listingState] = useSendListingInquiryMutation();
  const busy = animalState.isLoading || listingState.isLoading;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const element = dialog.current;
    element.showModal();
    element.querySelector('[name="sender_name"]')?.focus();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);

  useEffect(() => {
    if (result) dialog.current?.querySelector('[data-inquiry-done]')?.focus();
  }, [result]);

  function trapTab(event) {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled):not([tabindex="-1"]), textarea:not(:disabled)')];
    if (!controls.length) { event.preventDefault(); dialog.current.focus(); return; }
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function update(event) {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
    submission.current = null; // Edited message is a new intentional submission.
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (inFlight.current || result) return;
    inFlight.current = true;
    setError('');
    try {
      let response;
      if (listingId) {
        submission.current ??= crypto.randomUUID();
        response = await sendListingInquiry({ id: listingId, data: { ...form, submission_key: submission.current } }).unwrap();
      } else {
        response = await sendAnimalInquiry({ slug, data: form }).unwrap();
      }
      setResult(response.detail);
    } catch (failure) {
      if (failure.status === 429) setError('Too many inquiries. Please try again later.');
      else if (failure.status === 404) setError('This listing is no longer available. Please return to the storefront.');
      else if (failure.data?.detail) setError(failure.data.detail);
      else if (failure.status === 400) setError('Please check your name, email and message.');
      else setError('We couldn’t confirm your submission. Try again with the same message to avoid a duplicate inquiry.');
    } finally { inFlight.current = false; }
  }
  const input = 'mt-2 w-full rounded-lg border border-saddle-brown/25 bg-white p-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-rust';
  return (
    <dialog ref={dialog} tabIndex={-1} onKeyDown={trapTab} aria-labelledby="inquiry-heading" onCancel={event => { event.preventDefault(); if (!inFlight.current) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-xl bg-desert-sand p-6 text-charcoal shadow-2xl backdrop:bg-charcoal/70 sm:p-8">
      <div className="flex items-start justify-between gap-4"><h2 id="inquiry-heading" className="font-serif text-2xl text-saddle-brown">Inquire about {animal.name}</h2><button type="button" onClick={onClose} disabled={busy} aria-label="Close inquiry" className="rounded-lg px-3 py-1 text-xl text-saddle-brown disabled:opacity-40">×</button></div>
      {result ? <div className="mt-6"><p role="status">{result}</p><button data-inquiry-done onClick={onClose} className="mt-6 rounded-lg bg-rust px-6 py-3 font-semibold text-white">Done</button></div> : <form onSubmit={submit} className="mt-6 space-y-5">
        <fieldset disabled={busy} className="space-y-5">
          <div className="absolute -left-[10000px]" aria-hidden="true"><label>Leave this field empty<input name="honeypot" value={form.honeypot} onChange={update} tabIndex={-1} autoComplete="off" /></label></div>
          <label className="block text-sm font-semibold text-saddle-brown">Your name<input autoFocus name="sender_name" autoComplete="name" required maxLength={100} value={form.sender_name} onChange={update} className={input} /></label>
          <label className="block text-sm font-semibold text-saddle-brown">Email address<input name="sender_email" type="email" autoComplete="email" required maxLength={254} value={form.sender_email} onChange={update} className={input} /></label>
          {listingId && <label className="block text-sm font-semibold text-saddle-brown">Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={50} value={form.phone} onChange={update} className={input} /></label>}
          <label className="block text-sm font-semibold text-saddle-brown">Message<textarea name="message" required maxLength={1000} rows={4} value={form.message} onChange={update} className={input} /></label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-rust">{error}</p>}
        <div className="flex justify-end gap-4"><button type="button" onClick={onClose} disabled={busy} className="rounded-lg px-4 py-3 font-semibold text-saddle-brown disabled:opacity-40">Cancel</button><button type="submit" disabled={busy} className="rounded-lg bg-rust px-6 py-3 font-semibold text-white disabled:opacity-40">{busy ? 'Submitting…' : 'Send inquiry'}</button></div>
      </form>}
    </dialog>
  );
}

export default function InquiryModal({ isOpen, ...props }) {
  return isOpen ? <InquiryForm key={props.listingId || props.slug} {...props} /> : null;
}
