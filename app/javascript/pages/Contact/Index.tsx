import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Layout from '@/components/layout/Layout';

// 1. Define the interface for the form fields
interface ContactFormData {
    name: string;
    email: string;
    message: string;
    hp_company_name: string;
}

// 2. Define the interface for Inertia shared props (like flash notifications)
interface CustomPageProps {
    flash: {
        notice?: string;
        alert?: string;
    };
    [key: string]: any; // Fallback for standard Inertia props
}

export default function ContactPage() {
    // Use the custom page props interface as a generic
    const { flash } = usePage().props;

    // Pass the form data interface as a generic to useForm
    const { data, setData, post, processing, errors, reset } = useForm<ContactFormData>({
        name: '',
        email: '',
        message: '',
        hp_company_name: ''
    });

    // Explicitly type the form submission event
    const submit = (e: React.SubmitEvent<HTMLFormElement>): void => {
        e.preventDefault();

        // Post the data nested under the 'contact' key to match Rails strong params
        post('/contact');
        reset()
    }

    return (
        <div className="min-h-screen bg-brand-cream text-brand-dark font-sans py-20 px-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-display text-4xl mb-4">Get in Touch</h1>
                <p className="text-brand-sage mb-8">
                    Whether you're looking for premium stock, training, or just want to talk horses, drop us a line below.
                </p>

                {/* Success Flash Message */}
                {flash?.notice && (
                    <div className="mb-6 p-4 bg-brand-sage/10 border border-brand-sage text-brand-sage rounded-xs text-sm">
                        {flash.notice.message}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-brand-dark">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full border-brand-tan bg-white rounded-xs shadow-sm focus:border-brand-clay focus:ring focus:ring-brand-clay/20 text-sm p-2.5"
                            required
                        />
                        {errors.name && <span className="text-xs text-brand-clay mt-1 block">{errors.name}</span>}
                    </div>
                    <div className="absolute opacity-0 -z-10 absolute top-0 left-0 w-0 h-0 overflow-hidden" aria-hidden="true">
                        <label htmlFor="hp_company_name">Company Name</label>
                        <input
                            type="text"
                            id="hp_company_name"
                            autoComplete="off"
                            value={data.hp_company_name}
                            onChange={e => setData('hp_company_name', e.target.value)}
                            tabIndex={-1} // Prevents keyboard users from accidentally tabbing into it
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-dark">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="mt-1 block w-full border-brand-tan bg-white rounded-xs shadow-sm focus:border-brand-clay focus:ring focus:ring-brand-clay/20 text-sm p-2.5"
                            required
                        />
                        {errors.email && <span className="text-xs text-brand-clay mt-1 block">{errors.email}</span>}
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-brand-dark">Message</label>
                        <textarea
                            id="message"
                            rows={4}
                            value={data.message}
                            onChange={e => setData('message', e.target.value)}
                            className="mt-1 block w-full border-brand-tan bg-white rounded-xs shadow-sm focus:border-brand-clay focus:ring focus:ring-brand-clay/20 text-sm p-2.5"
                            required
                        />
                        {errors.message && <span className="text-xs text-brand-clay mt-1 block">{errors.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-brand-clay hover:bg-brand-clay/90 text-brand-cream font-semibold py-3 px-4 rounded-xs transition-colors duration-200 disabled:opacity-50 text-sm tracking-wider uppercase"
                    >
                        {processing ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
}

ContactPage.layout = (page: React.ReactNode) => <Layout>{page}</Layout>