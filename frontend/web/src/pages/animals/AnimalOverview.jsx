import { useOutletContext } from 'react-router-dom'

function AnimalOverview() {
    const {animal} = useOutletContext();
  return (     
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

          {/* Left Column: Narrative (Takes up 7 cols) */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-3xl font-serif text-saddle-brown mb-6">About {animal.name}</h2>
              {animal.description ? (
                <p className="text-lg leading-relaxed text-charcoal/80 whitespace-pre-line">
                  {animal.description}
                </p>
              ) : (
                <p className="text-lg italic text-charcoal/50">No description provided.</p>
              )}
            </section>

            {(animal.sire || animal.dam) && (
              <section className="border-t border-sage/30 pt-10">
                <h3 className="text-2xl font-serif text-saddle-brown mb-6">Lineage</h3>
                <div className="grid grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-sm border border-sage/10">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-sage font-bold mb-1">Sire</p>
                    <p className="text-lg font-serif text-charcoal">{animal.sire || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-sage font-bold mb-1">Dam</p>
                    <p className="text-lg font-serif text-charcoal">{animal.dam || 'Unknown'}</p>
                  </div>
                </div>
              </section>
            )}

            {animal.notes && (
              <section className="bg-sage/10 p-8 rounded-xl border-l-4 border-rust">
                <h4 className="text-sm uppercase tracking-widest text-saddle-brown font-bold mb-3">Notes & Observations</h4>
                <p className="text-charcoal/80 leading-relaxed">
                  {animal.notes}
                </p>
              </section>
            )}
          </div>

          {/* Right Column: Specs Sidebar (Takes up 5 cols) */}
          <aside className="lg:col-span-5 relative">
            <div className="sticky top-10 bg-white rounded-2xl shadow-xl border border-sage/20 overflow-hidden">

              <div className="bg-saddle-brown p-6 text-center">
                <h3 className="text-2xl font-serif text-desert-sand">Specs & Details</h3>
              </div>

              <dl className="p-8 grid grid-cols-1 gap-y-6 text-sm">

                {/* Species Specific Sidebar Elements */}
                {animal.species === 'horse' && (
                  <>
                    {animal.herd_management_area && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">HMA Origin</dt>
                        <dd className="font-semibold text-charcoal text-right">{animal.herd_management_area}</dd>
                      </div>
                    )}
                    {animal.adoption_date && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">Adoption Date</dt>
                        <dd className="font-semibold text-charcoal">{new Date(animal.adoption_date).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {animal.height && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">Height</dt>
                        <dd className="font-semibold text-charcoal">{animal.height} hh</dd>
                      </div>
                    )}
                  </>
                )}

                {animal.species === 'dog' && (
                  <>
                    {animal.microchip_number && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">Microchip</dt>
                        <dd className="font-semibold text-charcoal">{animal.microchip_number}</dd>
                      </div>
                    )}
                    {animal.rabies_tag_number && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">Rabies Tag</dt>
                        <dd className="font-semibold text-charcoal">{animal.rabies_tag_number}</dd>
                      </div>
                    )}
                    {animal.spayed_neutered !== undefined && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">Fixed Status</dt>
                        <dd className="font-semibold text-charcoal">{animal.spayed_neutered ? 'Spayed / Neutered' : 'Intact'}</dd>
                      </div>
                    )}
                  </>
                )}

                {animal.species === 'cattle' && (
                  <>
                    {animal.ear_tag && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">Ear Tag</dt>
                        <dd className="font-semibold text-charcoal">{animal.ear_tag}</dd>
                      </div>
                    )}
                    {animal.brand && (
                      <div className="flex justify-between pb-4 border-b border-sage/20">
                        <dt className="text-sage font-bold uppercase tracking-widest">Brand</dt>
                        <dd className="font-semibold text-charcoal">{animal.brand}</dd>
                      </div>
                    )}
                  </>
                )}

                {/* Universal Specs */}
                {animal.breed && (
                  <div className="flex justify-between pb-4 border-b border-sage/20">
                    <dt className="text-sage font-bold uppercase tracking-widest">Breed</dt>
                    <dd className="font-semibold text-charcoal">{animal.breed}</dd>
                  </div>
                )}

                <div className="flex justify-between pb-4 border-b border-sage/20">
                  <dt className="text-sage font-bold uppercase tracking-widest">Sex</dt>
                  <dd className="font-semibold text-charcoal capitalize">{animal.sex}</dd>
                </div>

                <div className="flex justify-between pb-4 border-b border-sage/20">
                  <dt className="text-sage font-bold uppercase tracking-widest">Age</dt>
                  <dd className="font-semibold text-charcoal">{animal.age || '--'}</dd>
                </div>

                <div className="flex justify-between pb-4 border-b border-sage/20">
                  <dt className="text-sage font-bold uppercase tracking-widest">Weight</dt>
                  <dd className="font-semibold text-charcoal">{animal.weight ? `${Math.round(animal.weight)} lbs` : '--'}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-sage font-bold uppercase tracking-widest">Status</dt>
                  <dd className="font-semibold text-charcoal">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider ${animal.status === 'active' ? 'bg-sage/20 text-saddle-brown' : 'bg-rust/20 text-rust'}`}>
                      {animal.status}
                    </span>
                  </dd>
                </div>
              </dl>             
            </div>
          </aside>

        </div>    

      </main>
  )
}

export default AnimalOverview