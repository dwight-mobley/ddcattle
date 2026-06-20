class SessionsController < InertiaController
  def new
    render inertia: "Auth/Login"
  end

  def create
    @user = User.find_by(username: params[:username])

    if @user&.authenticate(params[:password])
      session[:user_id] = @user.id
        redirect_to(root_path, notice: "Signed in successfully.")

    else
        redirect_to(login_path, alert: {message: "Invalid username or password", id: Time.now.to_i})
    end
  end

  def destroy
    reset_session
    redirect_to(root_path, notice: "Signed out successfully.")
  end
end
