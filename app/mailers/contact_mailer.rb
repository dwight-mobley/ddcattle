class ContactMailer < ApplicationMailer
  # This should be a verified domain in your Resend account, or 'onboarding@resend.dev' for testing
  default from: 'notifications@holysmokesengraving.com'

  def new_contact_email
    @name = params[:name]
    @email = params[:email]
    @message = params[:message]

    mail(
      to: 'dwightscode@gmail.com',
      subject: "New Portfolio Contact from #{@name}",
      reply_to: @email
    )
  end

  def user_confirmation_email
    @name = params[:name]
    @email = params[:email]

    mail(
      to: @email,
      subject: "We've received your message - DD Cattle Company"
    )
  end
end