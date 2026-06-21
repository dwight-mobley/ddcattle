import Layout from '@/components/layout/Layout';
import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-brand-dark font-sans">

      {/* ===========================
          1. HERO HEADER WITH PATTERN
      ============================ */}
      <header className="relative bg-brand-dark text-brand-cream overflow-hidden pt-24 pb-32 px-6 sm:px-12">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-tan rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-sage rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-block text-xs uppercase tracking-widest text-brand-tan font-bold px-4 py-2 bg-brand-tan/10 rounded-full mb-8">
            Heritage & Excellence
          </span>

          <h1 className="font-display text-5xl md:text-7xl leading-tight mb-6 font-light">
            About <span className="text-brand-tan font-semibold">DD Cattle</span>
          </h1>

          <p className="text-xl text-brand-cream/80 max-w-2xl mx-auto leading-relaxed">
            Where tradition meets excellence in ranching
          </p>
        </div>
      </header>

      {/* ===========================
          2. MISSION STATEMENT
      ============================ */}
      <section className="bg-gradient-to-r from-brand-clay to-brand-clay/90 text-brand-cream py-16 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-2xl font-light leading-relaxed">
            Founded on principles of <span className="font-semibold text-brand-tan">quality</span>,
            <span className="font-semibold text-brand-tan"> integrity</span>, and
            <span className="font-semibold text-brand-tan"> sustainable</span> ranching practices
          </p>
        </div>
      </section>

      {/* ===========================
          3. FOUNDERS SHOWCASE
      ============================ */}
      <section className="py-32 px-6 sm:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-5xl font-light mb-3">Our Founders</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-1 w-12 bg-brand-tan"></div>
              <p className="text-brand-dark/60">Driven by passion for ranching</p>
              <div className="h-1 w-12 bg-brand-tan"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Founder 1 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-tan to-brand-clay rounded-2xl blur-xl opacity-30 -z-10 w-full h-full"></div>
                <div className="w-64 h-80 rounded-2xl overflow-hidden border-4 border-brand-tan/20 shadow-2xl">
                  <img src="/images/david-x0WirGjp.jpeg" alt="David Jones" className="w-full h-full object-cover" />
                </div>
              </div>
              <h3 className="font-display text-3xl font-medium mb-2">David Jones</h3>
              <p className="text-brand-tan font-bold tracking-wide mb-4">CO-FOUNDER</p>
              <p className="text-center text-brand-dark/70 max-w-sm leading-relaxed">
                A lifelong advocate for preserving the heritage and spirit of the American Mustang. David brings decades of experience and an unwavering commitment to ethical ranching practices.
              </p>
            </div>

            {/* Founder 2 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-sage to-brand-sage/50 rounded-2xl blur-xl opacity-30 -z-10 w-full h-full"></div>
                <div className="w-64 h-80 rounded-2xl overflow-hidden border-4 border-brand-sage/20 shadow-2xl">
                  <img src="/images/about-feature.jpg" alt="Dwight Mobley" className="w-full h-full object-cover" />
                </div>
              </div>
              <h3 className="font-display text-3xl font-medium mb-2">Dwight Mobley</h3>
              <p className="text-brand-clay font-bold tracking-wide mb-4">CO-FOUNDER</p>
              <p className="text-center text-brand-dark/70 max-w-sm leading-relaxed">
                A visionary in sustainable livestock practices, Dwight is dedicated to raising premium Lowline cattle with environmental stewardship at the forefront of every decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          4. THREE PILLARS
      ============================ */}
      <section className="py-32 px-6 sm:px-12 bg-brand-cream/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-5xl font-light mb-3">Our Foundation</h2>
            <p className="text-brand-dark/60">Three principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Pillar 1 */}
            <div className="bg-white rounded-xl p-10 border border-brand-tan/10 shadow-sm hover:shadow-lg hover:border-brand-tan/30 transition-all duration-300">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-tan to-brand-tan/70 flex items-center justify-center mb-8 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-medium mb-4">Our Story</h3>
              <p className="text-brand-dark/75 leading-relaxed">
                Founded by friends who share a deep passion for horses and cattle, DD Cattle Company is built on generations of ranching tradition and respect for the land.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-xl p-10 border border-brand-sage/10 shadow-sm hover:shadow-lg hover:border-brand-sage/30 transition-all duration-300">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-sage to-brand-sage/70 flex items-center justify-center mb-8 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m9 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-medium mb-4">Our Mission</h3>
              <p className="text-brand-dark/75 leading-relaxed">
                We specialize in Mustang training and provide exceptional animals raised with care, quality, and integrity. Every horse receives individualized attention.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-xl p-10 border border-brand-clay/10 shadow-sm hover:shadow-lg hover:border-brand-clay/30 transition-all duration-300">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-clay to-brand-clay/70 flex items-center justify-center mb-8 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6V3m0 0V0m0 3h-6m0 0H0" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-medium mb-4">Our Values</h3>
              <p className="text-brand-dark/75 leading-relaxed">
                Sustainability, transparency, and respect for every animal guide our practices. We believe in building lasting relationships with our community and partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          5. WHAT SETS US APART
      ============================ */}
      <section className="py-32 px-6 sm:px-12 bg-gradient-to-br from-brand-clay to-brand-clay/95 text-brand-cream">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-light mb-4">What Sets Us Apart</h2>
            <p className="text-brand-cream/80">Decades of excellence in every detail</p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Generations of Experience",
                desc: "Combined decades of ranching expertise and commitment to the craft"
              },
              {
                icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Specialized Mustang Training",
                desc: "Customized programs designed for all skill levels and horse temperaments"
              },
              {
                icon: "M9 12l2 2 4-4m7.773-4.227A10 10 0 1110 3.899v5.5",
                title: "Personalized Care & Attention",
                desc: "Every animal receives individualized training to bring out their best qualities"
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start p-8 bg-brand-cream/5 border border-brand-cream/20 rounded-lg backdrop-blur-sm hover:bg-brand-cream/10 transition-colors duration-300">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-tan text-brand-clay">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-brand-cream/85">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===========================
          6. CTA SECTION
      ============================ */}
      <section className="py-32 px-6 sm:px-12 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-5xl font-light mb-6">Experience Excellence</h2>
          <p className="text-xl text-brand-dark/70 mb-12 leading-relaxed">
            Join us in discovering the tradition, quality, and care that defines DD Cattle Company. Let's start a conversation about your ranching journey.
          </p>
          <button className="inline-flex items-center gap-2 bg-brand-clay hover:bg-brand-clay/90 text-brand-cream px-10 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Get In Touch
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* ===========================
          7. STATS/TRUST SECTION
      ============================ */}
      <section className="py-20 px-6 sm:px-12 bg-brand-dark text-brand-cream">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="font-display text-4xl font-bold text-brand-tan mb-2">30+</div>
            <p className="text-brand-cream/80">Years Combined Experience</p>
          </div>
          <div>
            <div className="font-display text-4xl font-bold text-brand-tan mb-2">500+</div>
            <p className="text-brand-cream/80">Horses & Cattle Trained</p>
          </div>
          <div>
            <div className="font-display text-4xl font-bold text-brand-tan mb-2">100%</div>
            <p className="text-brand-cream/80">Commitment to Quality</p>
          </div>
        </div>
      </section>

    </div>
  );
}

AboutPage.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;