class ContactsController < InertiaController

  def index
    render inertia: 'Contact/Index'
  end
  
  def create
    # 1. Grab the parameters
    contact_params = params.require(:contact).permit(:name, :email, :message)

    # Check if the honeypot trap was sprung
    if contact_params[:hp_company_name].present?
      # Silently pretend it worked so the bot thinks it succeeded, but send NO emails.
      return redirect_to contact_path, notice: {message: "Thanks for reaching out!", id: Time.now.to_i }
    end

    # 2. Tell the mailer to send the emails
    ContactMailer.with(
      name: contact_params[:name],
      email: contact_params[:email],
      message: contact_params[:message]
    ).new_contact_email.deliver_later

    ContactMailer.with(
      name: contact_params[:name],
      email: contact_params[:email]
    ).user_confirmation_email.deliver_later


    # 3. Redirect back to the Inertia page with a success flash message
    redirect_to "/contact", notice: {
      message: "Thanks for reaching out! We've sent a confirmation email to your inbox.",
      id: Time.now.to_i
    }
  end
end