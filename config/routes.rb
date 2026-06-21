Rails.application.routes.draw do


  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end
  root 'pages#home'

  resources :horses do
      member do
      # Creates a custom endpoint: DELETE /horses/:id/delete_image
      delete :delete_image
    end
  end

  # Auth
  get "login" => "sessions#new", as: :login
  post "login" => "sessions#create"
  delete "logout" => "sessions#destroy", as: :logout

  get "up" => "rails/health#show", as: :rails_health_check
end
