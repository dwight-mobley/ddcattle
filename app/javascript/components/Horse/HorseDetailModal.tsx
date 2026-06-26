import React, { useState } from 'react';
import { Horse } from '@/types';
import { X, Scale, Ruler, Award, Heart, Shield, Landmark, Mail, User, Send, CheckCircle2 } from 'lucide-react';

interface HorseDetailModalProps {
  horse: Horse | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleCompare: (horse: Horse) => void;
  isCompared: boolean;
}

export const HorseDetailModal: React.FC<HorseDetailModalProps> = ({
  horse,
  isOpen,
  onClose,
  onToggleCompare,
  isCompared,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquiryMessageSent] = useState(false);

  if (!isOpen || !horse) return null;

  const currentImage = horse.images[activeImageIndex]?.url || horse.images[0]?.url || 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=600';

  // Compute a beautiful mockup pedigree based on the horse's name
  const generatePedigree = (name: string) => {
    const keywords = name.split(' ');
    const firstWord = keywords[0] || 'Royal';
    const lastWord = keywords[keywords.length - 1] || 'Legacy';

    return {
      sire: `${firstWord} Sovereign`,
      sireSire: `${firstWord} Majestic Sr.`,
      sireDam: `Lady of ${firstWord}`,
      dam: `Sweet ${lastWord}`,
      damSire: `${lastWord} Commander`,
      damDam: `Desert Whisper`
    };
  };

  const pedigree = generatePedigree(horse.name);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) {
      alert("Please fill in your name and email.");
      return;
    }
    setInquiryMessageSent(true);
    setTimeout(() => {
      // Clear form after a delay
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMessage('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${horse.deceased ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <h3 className="font-bold text-base uppercase tracking-wide">
              {horse.deceased ? '[IN MEMORIAM] ' : ''}{horse.name} Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Image Carousel & Thumbs (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group">
                <img
                  src={currentImage}
                  alt={horse.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {horse.featured && (
                  <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Award className="w-3.5 h-3.5" /> Featured Champion
                  </div>
                )}

                {horse.deceased && (
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    In Memoriam
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {horse.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {horse.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-14 w-18 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        idx === activeImageIndex ? 'border-amber-600 ring-2 ring-amber-100' : 'border-slate-200'
                      }`}
                    >
                      <img src={img.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons below image */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => onToggleCompare(horse)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCompared
                      ? 'bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200'
                      : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isCompared ? 'fill-amber-600 text-amber-600' : ''}`} />
                  {isCompared ? 'Remove from Comparison' : 'Add to Comparison Board'}
                </button>
              </div>
            </div>

            {/* Right: Key Info & Description (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-black text-amber-700 tracking-widest">{horse.breed}</span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{horse.name}</h2>
                <p className="text-xs text-slate-500 mt-1">Color Spec: <span className="font-semibold text-slate-800">{horse.color}</span></p>
              </div>

              {/* Price / Status Alert */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Current Valuation</span>
                  <div className="text-2xl font-black text-slate-900">
                    {horse.price !== null ? (
                      <span className="text-emerald-800">${horse.price.toLocaleString()} USD</span>
                    ) : (
                      <span className="text-rose-700 text-lg">In Memoriam Legacy</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    horse.deceased
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {horse.deceased ? 'Historical Legend' : 'Active Ranch Stud'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50/50 p-2.5 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Sex / Gender</span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block">{horse.sex}</span>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Age</span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block">
                    {horse.age !== null ? `${horse.age} Years` : 'Unknown'}
                  </span>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase flex items-center justify-center gap-0.5">
                    <Ruler className="w-3 h-3 text-slate-400" /> Height
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block">
                    {horse.height ? `${horse.height} hh` : 'Unknown'}
                  </span>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase flex items-center justify-center gap-0.5">
                    <Scale className="w-3 h-3 text-slate-400" /> Weight
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block">
                    {horse.weight ? `${horse.weight} lbs` : 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Lineage Brand & HMA badges */}
              {(horse.brand || horse.herd_management_area) && (
                <div className="flex flex-wrap gap-2">
                  {horse.brand && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-100 font-mono text-[10px] rounded-md font-bold">
                      Ranch Brand: {horse.brand}
                    </span>
                  )}
                  {horse.herd_management_area && (
                    <span className="px-2.5 py-1 bg-amber-900 text-amber-50 text-[10px] rounded-md font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Wild HMA: {horse.herd_management_area}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ranch Hand Narrative</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/20 p-3 rounded-lg border border-amber-900/5">
                  {horse.description || `${horse.name} is an exceptional representative of the ${horse.breed} breed. Showing premium physical capabilities, calm mind under pressure, and flawless ground manners. Ready for trail or show duties.`}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Pedigree Lineage (3-Generation Chart) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-700" /> Registered 3-Generation Pedigree Tree
              </h4>
              <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-sm">Verified Lineage</span>
            </div>

            {/* Tree Chart */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-800">
              {/* Generation 1: Subject (implied) */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/60 shadow-2xs flex flex-col justify-center">
                <span className="text-[9px] uppercase text-slate-400 block font-bold">Subject Stud/Mare</span>
                <span className="font-extrabold text-slate-900 mt-1">{horse.name}</span>
                <span className="text-[8px] text-amber-700 font-mono mt-0.5">ID: {horse.id}</span>
              </div>

              {/* Generation 2: Parents */}
              <div className="space-y-2 flex flex-col justify-between">
                {/* Sire */}
                <div className="bg-blue-50/50 rounded-lg p-2 border border-blue-100/60 shadow-2xs flex-1 flex flex-col justify-center">
                  <span className="text-[8px] uppercase text-blue-500 block font-bold">Sire (Father)</span>
                  <span className="text-slate-800 font-bold">{pedigree.sire}</span>
                  <span className="text-[7px] text-slate-400 font-mono">Premium Stud</span>
                </div>
                {/* Dam */}
                <div className="bg-pink-50/50 rounded-lg p-2 border border-pink-100/60 shadow-2xs flex-1 flex flex-col justify-center">
                  <span className="text-[8px] uppercase text-pink-500 block font-bold">Dam (Mother)</span>
                  <span className="text-slate-800 font-bold">{pedigree.dam}</span>
                  <span className="text-[7px] text-slate-400 font-mono">Elite Broodmare</span>
                </div>
              </div>

              {/* Generation 3: Grandparents */}
              <div className="space-y-1.5 flex flex-col justify-between">
                {/* Sire's Sire */}
                <div className="bg-slate-100/50 rounded-md p-1.5 border border-slate-200/50 text-[10px] flex-1 flex flex-col justify-center">
                  <span className="text-[7px] uppercase text-slate-400 block">Sire's Sire</span>
                  <span className="text-slate-700 truncate">{pedigree.sireSire}</span>
                </div>
                {/* Sire's Dam */}
                <div className="bg-slate-100/50 rounded-md p-1.5 border border-slate-200/50 text-[10px] flex-1 flex flex-col justify-center">
                  <span className="text-[7px] uppercase text-slate-400 block">Sire's Dam</span>
                  <span className="text-slate-700 truncate">{pedigree.sireDam}</span>
                </div>
                {/* Dam's Sire */}
                <div className="bg-slate-100/50 rounded-md p-1.5 border border-slate-200/50 text-[10px] flex-1 flex flex-col justify-center">
                  <span className="text-[7px] uppercase text-slate-400 block">Dam's Sire</span>
                  <span className="text-slate-700 truncate">{pedigree.damSire}</span>
                </div>
                {/* Dam's Dam */}
                <div className="bg-slate-100/50 rounded-md p-1.5 border border-slate-200/50 text-[10px] flex-1 flex flex-col justify-center">
                  <span className="text-[7px] uppercase text-slate-400 block">Dam's Dam</span>
                  <span className="text-slate-700 truncate">{pedigree.damDam}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Inquire Form */}
          <div className="border border-slate-100 rounded-2xl p-5 bg-white space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-700" /> Ranch Inquiry & Viewing Schedule
            </h4>

            {inquirySent ? (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm">Viewing Inquiry Submitted Successfully!</h5>
                  <p className="text-xs text-emerald-700 mt-1">
                    Thank you. We have logged your request for <strong>{horse.name}</strong>. Our Lead Ranch Trainer will reach out to you within 24 hours to schedule an inspection or answer pedigree questions.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Your Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Message / Questions for Rancher</label>
                  <textarea
                    rows={2}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder={`e.g. I am interested in scheduling a pre-purchase exam (PPE) for ${horse.name} next Tuesday...`}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" /> Send Roster Inquiry
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium shrink-0">
          <span>Ranch ID Code: {horse.id}</span>
          <span>Pedigree Registry Association Certified</span>
        </div>
      </div>
    </div>
  );
};
