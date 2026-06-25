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
  # Custom method for serializing images - renamed to avoid conflict
  def image_data
    return [] unless images.attached?
    images.map do |img|
      {
        id: img.id,
        url: Rails.application.routes.url_helpers.rails_blob_path(img, only_path: true)
      }
    end
  end
  # Lazy scope to fetch featured horses for homepage
  scope :featured_for_homepage, -> { where(featured: true, deceased: false).limit(2).with_attached_images }

    # Override serializable_hash to control JSON output
  def serializable_hash(options = nil)
    super(options).tap do |hash|
      # Replace raw attachments with custom image data
      if hash.key?("images")
        hash["images"] = image_data
      end
    end
  end

  # Serialization for horses grid
  def serializable_hash_for_grid
    attributes
      .except("created_at", "updated_at")
      .merge(
        "age" => age,
        "profile_image_url" => profile_image_url,
        "images" => image_data
      )
  end
end