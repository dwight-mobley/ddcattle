Rails.application.routes.draw do
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  root "pages#home"
  inertia "about" => "About/Index"

  resources :horses do
    delete :delete_image, on: :member
  end

  get "contact", to: "contacts#index"
  post "contact", to: "contacts#create"

  resource :session, only: %i[new create destroy], path: "" do
    get  :new,     path: "login",  as: :login
    post :create,  path: "login"
    delete :destroy, path: "logout", as: :logout
  end

 namespace :admin do
  root to: "dashboard#index", as: :dashboard
  resources :horses, except: :show do
    delete :delete_image, on: :member
  end
end

  get "up", to: "rails/health#show", as: :rails_health_check
end
