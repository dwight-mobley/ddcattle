class PagesController < InertiaController
  def home
    horses = Horse.featured_for_homepage
    featured_horses = horses.map do |horse|
      horse.serializable_hash_for_grid
    end

    render inertia: 'Home/Index', props: {
      featuredHorses: featured_horses
    }
  end
end
