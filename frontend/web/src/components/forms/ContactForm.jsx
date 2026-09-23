import React, { useState, useEffect } from 'react';
import { useSendContactMessageMutation } from "../../features/api/contactApi";
import Loader from '../Loader';

function ContactFormSuccess() {
    return (
        <div className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-saddle-brown/10 sm:p-10">
            <div className="my-8 mx-auto text-center">
                <svg
                    className="h-26 w-26 text-rust mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rust">
                    Message Sent
                </p>
                <h2 className="mt-3 font-serif text-3xl text-saddle-brown">
                    Thank you for reaching out!
                </h2>
                <p className="mt-4 text-sm text-charcoal">
                    We have received your message and will get back to you shortly.
                </p>
            </div>
        </div>
    );
}

function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        topic: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(false);

    // 1. RTK Query hooks must be called at the top level of the component
    const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();

    // 2. Debounce example: Runs 500ms after the user stops typing (e.g., for auto-saving drafts)
    useEffect(() => {
        const timer = setTimeout(() => {
            // Currently, no background action is performed on form data changes.

        }, 500); // 500ms delay

        // Cleanup clears the timer if the user keeps typing before 500ms elapses
        return () => clearTimeout(timer);
    }, [formData]);

    useEffect(() => {
        if (isSubmitted) {
            const timer = setTimeout(() => {
                setIsSubmitted(false);
                setError(false);
            }, 10000); // Reset after 10 seconds
            return () => clearTimeout(timer);
        }
    }, [isSubmitted]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (e.target.honeypot.value) {
            return; // Stop submission if honeypot is filled
        }

        //Validate Data
        if (!formData.name || !formData.email || !formData.topic || !formData.message) {
            setError(true);
            return;
        }

        try {
            await sendContactMessage(formData).unwrap();
            // Clear form or draft storage here if desired
            setFormData({ name: '', email: '', topic: '', message: '' });
            setIsSubmitted(true);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };



    if (isSubmitted) {
        return <ContactFormSuccess />;
    }

    return (
        <div className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-saddle-brown/10 sm:p-10">
            {isLoading ?
                <div className="h-[100%] w-[100%]  flex items-center justify-center ">
                    <Loader fullScreen={false} />
                </div>
                : <>
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rust">
                            Send a Message
                        </p>
                        <h2 className="mt-3 font-serif text-3xl text-saddle-brown">
                            How can we help?
                        </h2>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>



                        {error && <p className='text-center text-sm font-bold text-red-500'>All Fields Are Required</p>}
                        <input hidden name="honeypot" defaultValue="" />

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-saddle-brown">
                                Your name
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                type="text"
                                placeholder="John Smith"
                                className="w-full rounded-lg border border-saddle-brown/15 bg-desert-sand/40 px-4 py-3.5 text-sm text-charcoal outline-none transition placeholder:text-charcoal/30 focus:border-rust focus:bg-white focus:ring-2 focus:ring-rust/10"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-saddle-brown">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                type="email"
                                placeholder="john@example.com"
                                className="w-full rounded-lg border border-saddle-brown/15 bg-desert-sand/40 px-4 py-3.5 text-sm text-charcoal outline-none transition placeholder:text-charcoal/30 focus:border-rust focus:bg-white focus:ring-2 focus:ring-rust/10"
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="mb-2 block text-sm font-medium text-saddle-brown">
                                What can we help with?
                            </label>
                            <select
                                id="topic"
                                name="topic"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                className="w-full rounded-lg border border-saddle-brown/15 bg-desert-sand/40 px-4 py-3.5 text-sm text-charcoal outline-none transition focus:border-rust focus:bg-white focus:ring-2 focus:ring-rust/10"
                            >
                                <option value="" disabled>
                                    Select a topic
                                </option>
                                <option value="animals">Question about an animal</option>
                                <option value="training">Question about training</option>
                                <option value="horses">Horses & mustangs</option>
                                <option value="trail-riding">Trail riding</option>
                                <option value="ranch">Ranch information</option>
                                <option value="other">Something else</option>
                            </select>
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="mb-2 block text-sm font-medium text-saddle-brown">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows="6"
                                placeholder="Tell us a little about what you're looking for..."
                                className="w-full resize-none rounded-lg border border-saddle-brown/15 bg-desert-sand/40 px-4 py-3.5 text-sm text-charcoal outline-none transition placeholder:text-charcoal/30 focus:border-rust focus:bg-white focus:ring-2 focus:ring-rust/10"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-saddle-brown px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rust focus:outline-none focus:ring-2 focus:ring-rust focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send Message'}
                        </button>

                        <p className="text-center text-xs leading-5 text-charcoal/40">
                            We will get back to you as soon as we can.
                        </p>
                    </form>
                </>
            }

        </div>
    );
}

export default ContactForm;