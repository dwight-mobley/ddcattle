class Horse < ApplicationRecord
    has_many_attached :images
    # Age
    def age
        return nil if birthdate.nil?
        now = Time.now.utc.to_date
        now.year - birthdate.year
    end

    def profile_image_url
        return nil unless images.attached?
        Rails.application.routes.url_helpers.rails_blob_path(images.first, only_path: true)
    end

    # Lazy scope to fetch featured horses for homepage
    scope :featured_for_homepage, -> { where(featured: true, deceased: false).limit(2).with_attached_images }

 #Serialization for horses grid. Only includes attributes and one image URL for performance. Excludes timestamps and age for simplicity.
 def serializable_hash_for_grid
    attributes
      .except("created_at", "updated_at")
      .merge(
        "age" => age,
        "profile_image_url" => profile_image_url
      )
  end

 # Full serialization method for Inertia views, excluding timestamps and including age and image URLs
 def serializable_hash_for_view
    attributes
      .except("created_at", "updated_at")
      .merge(
        "age" => age,
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
