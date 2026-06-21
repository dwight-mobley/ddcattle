class Horse < ApplicationRecord
    has_many_attached :images
    # Lazy scope to fetch featured horses for homepage
    scope :featured_for_homepage, -> { where(featured: true, deceased: false).limit(2).with_attached_images }

 def serializable_hash_for_view
    attributes
      .except("created_at", "updated_at")
      .merge(
        "images" => images.map { |img|
          {
            id: img.id,
            # 1. Full high-resolution URL for your main hero display view
            url: Rails.application.routes.url_helpers.rails_blob_path(img, only_path: true),

            # 2. Resized 150x150px thumbnail URL optimized for fast carousel rendering
            thumbnail_url: Rails.application.routes.url_helpers.rails_blob_path(
              img.variant(resize_to_limit: [150, 150]).processed,
              only_path: true
            )
          }
        }
      )
  end
end
