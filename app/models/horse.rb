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

 #Serialization for horses grid. Only includes attributes and one image URL for performance. Excludes timestamps simplicity.
 def serializable_hash_for_grid
    attributes
      .except("created_at", "updated_at")
      .merge(
        "age" => age,
        "profile_image_url" => profile_image_url
      )
  end

 #
end
