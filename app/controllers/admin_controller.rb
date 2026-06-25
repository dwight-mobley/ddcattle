class AdminController < InertiaController
  include Pagy::Method
  before_action :require_login


  def dashboard
    @horses = Horse.all.order(:name).map { |horse| horse.serializable_hash_for_grid }
    storage_type = ActiveStorage::Blob.service.name.to_s
    db_version = ActiveRecord::Base.connection.select_value("SELECT version()")
    render inertia: "Admin/Dashboard",
    props: {
      horses: @horses,
      storage_type: storage_type,
      db_version: db_version
    }
  end

  def admin_horses
    @horses = Horse.all.order(:name).map { |horse| horse.serializable_hash_for_grid }
    render inertia: "Admin/Horses",
    props: {
       horses: @horses
    }
  end

  # GET admin/horses/new
  def new_horse
    @horse = Horse.new
    render inertia: "Admin/NewHorse",
    props: {
      horse: @horse_to_json
    }
  end

  #Get admin/horses/:id/edit
  def edit_horse
     @horse = Horse.find(params[:id])

    render inertia: "Admin/NewHorse",
    props: {
      horse: @horse.as_json(include: :images)
    }
  end

  #Put /admin/horses/:id
  def update_horse
    @horse = Horse.find(params[:id])

    # 1. Extract files before mass-assignment so Rails doesn't auto-purge them
    uploaded_images = params[:images] || params.dig(:horse, :images)

    # 2. Update all flat form data fields safely
    if @horse.update(horse_params.except(:images))

      # 3. Manually append new files using .attach to preserve the existing gallery
      if uploaded_images.present?
        @horse.images.attach(uploaded_images)
      end

      redirect_to admin_horses_path(@horse), notice:{ message: "Horse was successfully updated.", id: Time.now.to_i }, status: :see_other
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # POST admin/horses or admin/horses.json
  def create_horse
    @horse = Horse.new(horse_params)
    @horse.id = SecureRandom.uuid
    if @horse.save
      Rails.logger.info "Creating horse with params: #{horse_params.inspect}"
      redirect_to admin_horses_path, notice: { message: "Horse was successfully created.", id: Time.now.to_i }, status: :see_other
    else
      redirect_to admin_new_horse_path, alert: { message: @horse.errors.full_messages.join(", "), id: Time.now.to_i }
    end
  end

  # Delete Horse Image
  def delete_horse_image
    @horse = Horse.find(params[:id])

    # Locate the targeted photo by its specific attachment ID
    image =  ActiveStorage::Attachment.find_by(id: params[:image_id])

    if image && image.record_id == params[:id]
      begin
        image.purge # Safely wipes from DB tracking and Cloudflare R2
      rescue Aws::S3::Errors::NoSuchKey
        Rails.logger.warn "Attempted to delete non-existent image from S3: #{image.key}"
      end
      render json: { success: true, status: ok }
    else
      render json: { success: false, status: 404 }
    end
  end

  private
   def set_horse
      @horse = Horse.with_attached_images.find(params.expect(:id))
    end

  def require_admin
    unless current_user.admin?
      redirect_to root_path, alert: "You are not authorized to access this page."
    end
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
