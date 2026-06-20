# frozen_string_literal: true

class InertiaController < ApplicationController
 inertia_share flash: -> {
    flash.to_hash
  }

  inertia_share auth: -> {
    {
      user: current_user&.as_json(only: [:id, :username]),
      logged_in: logged_in?
    }
  }
  private
  
  def logged_in?
    current_user.present?
  end

  def require_login
    return if logged_in?

    # store where they were trying to go (good for admin deep links)
    session[:return_to] = request.fullpath if request.get?
    redirect_to login_path
  end
end
