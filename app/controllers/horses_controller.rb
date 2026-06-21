class HorsesController < InertiaController
  before_action :set_horse, only: %i[ show edit update destroy ]
  before_action :require_login, only: %i[ new create edit update destroy ]

  # GET /horses or /horses.json
  def index
    @horses = Horse.all.order(:name).with_attached_images
    horses_with_profile_image = @horses.map do |horse|
      horse.serializable_hash_for_grid
    end
    render inertia: "Horses/Index",
    props: { horses: horses_with_profile_image }
  end

  # GET /horses/1 or /horses/1.json
  def show
    render inertia: "Horses/Show",
     props: { horse: @horse.serializable_hash_for_view }
  end

  # GET /horses/new
  def new
    @horse = Horse.new
   render inertia: "Horses/NewEdit",
   props: { horse: @horse.serializable_hash_for_view }
  end

  # GET /horses/1/edit
  def edit
    render inertia: "Horses/NewEdit",
    props: { horse: @horse.serializable_hash_for_view }
  end

  # POST /horses or /horses.json
  def create
    @horse = Horse.new(horse_params)
    @horse.id = SecureRandom.uuid
    if @horse.save
      redirect_to horses_path, notice: { message: "Horse was successfully created.", id: Time.now.to_i }, status: :see_other
    else
      redirect_to new_horse_path, alert: { message: @horse.errors.full_messages.join(", "), id: Time.now.to_i }
    end
  end

  # PATCH/PUT /horses/1 or /horses.json
  def update
    @horse = Horse.find(params[:id])

    # 1. Extract files before mass-assignment so Rails doesn't auto-purge them
    uploaded_images = params[:images] || params.dig(:horse, :images)

    # 2. Update all flat form data fields safely
    if @horse.update(horse_params.except(:images))

      # 3. Manually append new files using .attach to preserve the existing gallery
      if uploaded_images.present?
        @horse.images.attach(uploaded_images)
      end

      redirect_to horse_path(@horse), notice:{ message: "Horse was successfully updated.", id: Time.now.to_i }, status: :see_other
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /horses/1 or /horses.json
  def destroy
    @horse.destroy!
    redirect_to horses_path, notice: { message: "Horse was successfully destroyed.", id: Time.now.to_i }, status: :see_other
  end

  def delete_image
    @horse = Horse.find(params[:id])

    # Locate the targeted photo by its specific attachment ID
    image =  ActiveStorage::Attachment.find_by(id: params[:image_id])

    if image && image.record_id == params[:id]
      begin
        image.purge # Safely wipes from DB tracking and Cloudflare R2
      rescue Aws::S3::Errors::NoSuchKey
        Rails.logger.warn "Attempted to delete non-existent image from S3: #{image.key}"
      end
      redirect_to horse_path(@horse),
      notice: { message: "Image was successfully deleted.", id: Time.now.to_i },
      status: :see_other
    else
      redirect_to horse_path(@horse), alert: { message: "Image not found.", id: Time.now.to_i }, status: :see_other
    end
  end

  private
    def set_horse
      @horse = Horse.with_attached_images.find(params.expect(:id))
    end

  def horse_params
    permitted_fields = Horse.column_names - [ "id", "created_at", "updated_at" ]

    # 1. Fall back to raw params if the :horse wrapper is missing
    safe_params = params.key?(:horse) ? params.require(:horse) : params

    # 2. Explicitly remove the routing :id parameter so it stops triggering the log warning
    safe_params = safe_params.except(:id) if safe_params.respond_to?(:except)

    safe_params.permit(permitted_fields, images: [])
  end
end
