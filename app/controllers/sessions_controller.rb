class SessionsController < ApplicationController
  def new
    render inertia: "Auth/Login"
  end

  def create
    @user = User.find_by(username: params[:username])

    if @user&.authenticate(params[:password])
      session[:user_id] = @user.id
        redirect_to "/", notice: "Signed in successfully."
    else
      flash.now[:alert] = "Invalid username or password"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    reset_session
    redirect_to(root_path, notice: "Signed out successfully.")
  end
end
