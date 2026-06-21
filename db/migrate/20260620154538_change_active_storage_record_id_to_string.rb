class ChangeActiveStorageRecordIdToString < ActiveRecord::Migration[8.0]
  def up
    # Changes the column type to string to handle full UUID values safely
    change_column :active_storage_attachments, :record_id, :string
    change_column :active_storage_variant_records, :record_id, :string
  end

  def down
    change_column :active_storage_attachments, :record_id, :integer
    change_column :active_storage_variant_records, :record_id, :integer
  end
end
