// components/InquiryModal.jsx
import React, { useState } from 'react';
import { useSendAnimalInquiryMutation } from '../features/api/animalApi';
import Loader from './Loader';

export default function InquiryModal({ isOpen, onClose, animal, slug }) {
  const [formData, setFormData] = useState({ sender_name: '', sender_email: '', message: '' });
  const [sendInquiry, { isLoading, isError }] = useSendAnimalInquiryMutation();
  const [isSuccessState, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.honeypot) {
        setIsSuccess(true);
        return;
      }
        console.log({ slug: slug, data: formData })
      await sendInquiry({ slug: slug, data: formData }).unwrap();
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ sender_name: '', sender_email: '', message: '' });
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to send inquiry: ", err);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4">
        
      <div className="bg-desert-sand w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-saddle-brown p-6 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-sage hover:text-desert-sand transition-colors"
          >
            &#x2715; {/* Close Icon */}
          </button>
          <h2 className="text-2xl font-serif text-desert-sand">
            Inquire About {animal.name}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-8">
            
          {isSuccessState ? (
            <div className="text-center py-8">
              <div className="text-sage text-5xl mb-4">&#10003;</div>
              <h3 className="text-xl font-serif text-saddle-brown mb-2">Inquiry Sent!</h3>
              <p className="text-charcoal/80">We will get back to you shortly.</p>
            </div>
          ) : isLoading ? (
            <div className="h-100 w-100 flex items-center justify-center ">
                <Loader fullScreen={false} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              <input type="hidden" name="honeypot" value="" />
              <div>
                <label className="block text-sage font-bold uppercase tracking-widest mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 rounded-lg border border-sage/30 bg-white text-charcoal focus:outline-none focus:border-rust"
                  value={formData.sender_name}
                  onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sage font-bold uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full p-3 rounded-lg border border-sage/30 bg-white text-charcoal focus:outline-none focus:border-rust"
                  value={formData.sender_email}
                  onChange={(e) => setFormData({...formData, sender_email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sage font-bold uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full p-3 rounded-lg border border-sage/30 bg-white text-charcoal focus:outline-none focus:border-rust resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder={`I'd love to learn more about ${animal.name}...`}
                ></textarea>
              </div>

              {isError && (
                <p className="text-rust text-sm font-semibold">Failed to send. Please try again.</p>
              )}

              <div className="pt-2 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-3 text-saddle-brown font-semibold uppercase tracking-widest hover:text-rust transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-3 bg-rust text-white font-semibold rounded-lg hover:bg-saddle-brown transition-all uppercase tracking-widest shadow-md disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}