export default function EngravingShop() {
  return (
    <section aria-labelledby="engraving-heading" className="rounded-xl bg-saddle-brown p-8 text-desert-sand sm:p-12">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-desert-sand/75">From our workshop</p>
          <h2 id="engraving-heading" className="mt-3 font-serif text-3xl sm:text-4xl">Holy Smokes Engraving</h2>
          <p className="mt-4 max-w-xl leading-7 text-desert-sand/85">Explore our laser-engraved products and shop online at Holy Smokes Engraving.</p>
        </div>
        <div>
          <a href="https://holysmokesengraving.com/" target="_blank" className="inline-flex rounded-xl bg-desert-sand px-6 py-4 font-semibold text-saddle-brown hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-desert-sand">Shop engraved products ↗</a>
          <p className="mt-3 text-xs text-desert-sand/75">Continue to holysmokesengraving.com</p>
        </div>
      </div>
    </section>
  );
}
