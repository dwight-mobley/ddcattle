class HorsesController < InertiaController
  include Pagy::Method
  before_action :set_horse, only: %i[ show  ]
 

  # GET /horses or /horses.json
  def index
    @pagy, @horses = pagy( :offset, Horse.where(deceased: false).order(:name, :id), limit:6)

    horses_with_profile_image = @horses.map do |horse|
      horse.serializable_hash_for_grid
    end
    render inertia: "Horses/Index",
    props: {
      horses: horses_with_profile_image,
      pagination: {current: @pagy.page,next: @pagy.next, prev: @pagy.previous, count: @pagy.count, pages: @pagy.pages}
    }
  end

  # GET /horses/1 or /horses/1.json
  def show
    horse_data = @horse.attributes
    @pagy, @images = pagy(:offset, @horse.images.order(created_at: :asc), limit: 4)
    render inertia: "Horses/Show",
     props: {
      horse: horse_data,
      images: @images.map {|img| { id: img.id, url: url_for(img)}},
      imagesPagination: {next: @pagy.next, prev: @pagy.previous, count: @pagy.count}
     }
  end

  private
    def set_horse
      @horse = Horse.with_attached_images.find(params.expect(:id))
    end
end
