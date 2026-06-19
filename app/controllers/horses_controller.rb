class HorsesController < InertiaController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_horse, only: %i[ show edit update destroy ]

  # GET /horses or /horses.json
  def index
    @horses = Horse.all.order(:name)
    render inertia: "Horses/Index",
    props: { horses: @horses.as_json }
  end

  # GET /horses/1 or /horses/1.json
  def show
  end

  # GET /horses/new
  def new
    @horse = Horse.new
  end

  # GET /horses/1/edit
  def edit
  end

  # POST /horses or /horses.json
  def create
    @horse = Horse.new(horse_params)

    respond_to do |format|
      if @horse.save
        format.html { redirect_to @horse, notice: "Horse was successfully created." }
        format.json { render :show, status: :created, location: @horse }
      else
        format.html { render :new, status: :unprocessable_content }
        format.json { render json: @horse.errors, status: :unprocessable_content }
      end
    end
  end

  # PATCH/PUT /horses/1 or /horses/1.json
  def update
    respond_to do |format|
      if @horse.update(horse_params)
        format.html { redirect_to @horse, notice: "Horse was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @horse }
      else
        format.html { render :edit, status: :unprocessable_content }
        format.json { render json: @horse.errors, status: :unprocessable_content }
      end
    end
  end

  # DELETE /horses/1 or /horses/1.json
  def destroy
    @horse.destroy!

    respond_to do |format|
      format.html { redirect_to horses_path, notice: "Horse was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_horse
      @horse = Horse.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def horse_params
      params.fetch(:horse, {})
    end
end
