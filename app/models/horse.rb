class Horse < ApplicationRecord
    has_many_attached :images
    # Lazy scope to fetch featured horses for homepage
    scope :featured_for_homepage, -> { where(featured: true, deceased: false).limit(2).with_attached_images }

  def serializable_hash_for_view
    attributes
      .except("created_at", "updated_at")
      .merge(
        # Explicitly targets rails_blob_path via global url_helpers to clear the NoMethodError completely
        "images" => images.map { |img|
          {
            id: img.id,
            url: Rails.application.routes.url_helpers.rails_blob_path(img, only_path: true)
          }
        }
      )
  end
end
