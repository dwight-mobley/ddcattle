class HorsesController < InertiaController
  before_action :set_horse, only: %i[ show edit update destroy ]
  before_action :require_login, only: %i[ new create edit update destroy ]

  # GET /horses or /horses.json
  def index
    @horses = Horse.all.order(:name)
    render inertia: "Horses/Index",
    props: { horses: @horses.as_json }
  end

  # GET /horses/1 or /horses/1.json
  def show
    @horse = Horse.find(params[:id])
    render inertia: "Horses/Show",
    props: { horse: @horse.as_json   }
  end

  # GET /horses/new
  def new
    @horse = Horse.new
    render inertia: "Horses/NewEdit", props: { horse: @horse.as_json }
  end

  # GET /horses/1/edit
  def edit
    render inertia: "Horses/NewEdit", props: { horse: @horse.as_json }
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

  # PATCH/PUT /horses/1 or /horses/1.json
  def update
      if @horse.update(horse_params)
      redirect_to horses_path, notice: { message: "Horse was successfully updated.", id: Time.now.to_i }, status: :see_other
      else
        redirect_to edit_horse_path, alert: { message: @horse.errors.full_messages.join(", "), id: Time.now.to_i }
      end
  end

  # DELETE /horses/1 or /horses/1.json
  def destroy
    @horse.destroy!
    redirect_to horses_path, notice: { message: "Horse was successfully destroyed.", id: Time.now.to_i }, status: :see_other
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_horse
      @horse = Horse.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def horse_params
      permitted_fields = Horse.column_names - [ "id", "created_at", "updated_at" ]
      params.require(:horse).permit(*permitted_fields)
    end
end
