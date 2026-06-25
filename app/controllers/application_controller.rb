class ApplicationController < ActionController::Base
  before_action :share_user
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

   helper_method :current_user

  def share_user
    inertia_share auth: -> {
      {
        user: current_user&.as_json(only: [:id, :username]),
        logged_in: logged_in?
      }
    }
  end

  def logged_in?
    current_user.present?
  end

  private

  def current_user
    return @current_user if defined?(@current_user)
    @current_user = session[:user_id] && User.find_by(id: session[:user_id])
  end


end
