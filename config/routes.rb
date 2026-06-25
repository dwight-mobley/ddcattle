Rails.application.routes.draw do
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end
  root "pages#home"

  # Static pages
  inertia "about" => "About/Index"

  resources :horses do
      member do
      # Creates a custom endpoint: DELETE /horses/:id/delete_image
      delete :delete_image
    end
  end

  # Contact
  get "contact", to: "contacts#index"
  post "contact", to: "contacts#create"

  # Auth
  get "login" => "sessions#new", as: :login
  post "login" => "sessions#create"
  delete "logout" => "sessions#destroy", as: :logout

  # Admin
  get "admin" => "admin#dashboard", as: :admin_dashboard
  get "admin/horses" => "admin#admin_horses", as: :admin_horses
  get "admin/horses/new" => "admin#new_horse", as: :admin_new_horse
  get "admin/horses/:id/edit" => "admin#edit_horse", as: :admin_edit_horse
  post "admin/horses" => "admin#create_horse", as: :admin_horses_post
  patch "admin/horses/:id" => "admin#update_horse", as: :admin_horse_patch
  delete "admin/horses/:id" => "admin#destroy_horse", as: :admin_horse_delete
  delete "admin/horses/:id/delete_image" => "admin#delete_horse_image", as: :admin_delete_horse_image

  get "up" => "rails/health#show", as: :rails_health_check
end
