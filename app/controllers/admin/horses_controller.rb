module Admin
  class HorsesController < InertiaController
    include Pagy::Method

    before_action :require_login
    before_action :set_horse, only: %i[edit update destroy delete_image]

    def index
      horses = Horse.order(:name).map { |horse| horse.serializable_hash_for_grid }
      render inertia: "Admin/Horses",
             props: { horses: horses }
    end

    def new
      @horse = Horse.new
      render inertia: "Admin/NewHorse",
             props: { horse: @horse.as_json }
    end

    def edit
      render inertia: "Admin/EditHorse",
             props: { horse: @horse.as_json(include: :images) }
    end

    def create
      @horse = Horse.new(horse_params)
      @horse.id = SecureRandom.uuid

      if @horse.save
        redirect_to admin_horses_path,
                    notice: { message: "Horse was successfully created.", id: Time.now.to_i },
                    status: :see_other
      else
        redirect_to new_admin_horse_path,
                    alert: { message: @horse.errors.full_messages.join(", "), id: Time.now.to_i }
      end
    end

    def update
      uploaded_images = params[:images] || params.dig(:horse, :images)

      if @horse.update(horse_params.except(:images))
        @horse.images.attach(uploaded_images) if uploaded_images.present?

        redirect_to admin_horses_path,
                    notice: { message: "Horse was successfully updated.", id: Time.now.to_i },
                    status: :see_other
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @horse.destroy!
      redirect_to admin_horses_path,
                  notice: { message: "Horse was successfully destroyed.", id: Time.now.to_i },
                  status: :see_other
    end

    def delete_image
      image = ActiveStorage::Attachment.find_by(id: params[:image_id])
      if image && image.record == @horse
        begin
          image.purge
        rescue Aws::S3::Errors::NoSuchKey
          Rails.logger.warn "Attempted to delete non-existent image from S3: #{image.key}"
          image.destroy
          image.blob.destroy if image.blob&.attachments&.empty?
        end
        render json: { success: true,status: :ok }
      else
        render json: { success: false, status: :not_found }
      end
    end

    private

    def set_horse
      @horse = Horse.with_attached_images.find(params[:id])
    end

    def horse_params
      permitted_fields = Horse.column_names - %w[id created_at updated_at]

      safe_params = params.key?(:horse) ? params.require(:horse) : params
      safe_params = safe_params.except(:id) if safe_params.respond_to?(:except)

      safe_params.permit(permitted_fields, images: [])
    end

    def require_admin
      redirect_to root_path, alert: "You are not authorized to access this page." unless current_user&.admin?
    end
  end
end
