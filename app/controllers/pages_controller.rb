class PagesController < ApplicationController
  def home
    # Fetches your newly seeded database partners perfectly
    @featured_horses = Horse.where(featured: true, deceased: false).limit(2)

    render inertia: 'Home/Index', props: {
      featuredHorses: @featured_horses.as_json
    }
  end
end