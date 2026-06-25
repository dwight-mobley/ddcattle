class AdminController < InertiaController
  before_action :require_login


  def dashboard
    storage_type = ActiveStorage::Blob.service.name.to_s
    db_version = ActiveRecord::Base.connection.select_value("SELECT version()")
    render inertia: "Admin/Dashboard",
    props: {
      horses: Horse.all.order(:name).map { |horse| horse.serializable_hash_for_grid },
      storage_type: storage_type,
      db_version: db_version
    }
  end

  private

  def require_admin
    unless current_user.admin?
      redirect_to root_path, alert: 'You are not authorized to access this page.'
    end
  end
end