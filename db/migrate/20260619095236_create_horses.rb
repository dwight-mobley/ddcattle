class CreateHorses < ActiveRecord::Migration[8.0]
  def change
    create_table :horses, id: :string do |t|
      t.string :name, null: false
      t.string :breed, null: false, default: 'Mustang'

      # Make sure these two lines are definitely here!
      t.string :color
      t.string :sex

      t.string :brand
      t.date :birthdate
      t.string :herd_management_area
      t.integer :price
      t.boolean :featured, default: false, null: false
      t.text :description
      t.json :images, default: []
      t.boolean :deceased, default: false, null: false
      t.integer :weight
      t.decimal :height, precision: 3, scale: 1

      t.timestamps
    end
  end
end