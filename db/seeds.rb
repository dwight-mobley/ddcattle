# db/seeds.rb

puts "Cruising the range... Seeding horse data..."

horses_data = [
  {
    id: "a95d70af-d5a8-35c5-e82b-838665c53654",
    name: "Reno",
    breed: "Mustang",
    color: "Palomino",
    sex: "GELDING",
    foal_year: 2000,
    brand: "00833823",
    herd_management_area: "Dads Reservoir, Wyoming",
    price: nil,
    featured: false,
    description: "Reno is a big boy. He is a smooth ride in the round pen, but a little unpredictable on the trail.",
    images: ["/uploads/Reno/20260525213054719621.jpeg"],
    deceased: false,
    weight: 949,
    height: 14.0
  },
  {
    id: "e132ab75-1d1b-8917-ac50-296e92769fbc",
    name: "Amigo",
    breed: "Paint Horse",
    color: "Brown/White",
    sex: "GELDING",
    foal_year: 2000,
    brand: nil,
    herd_management_area: nil,
    price: nil,
    featured: false,
    description: "Amigo was a sweet horse who was with David since he was a yearling. He had a long life of trail rides and love. He was laid to rest in July of 2024 after a long happy life. He will be missed.",
    images: [],
    deceased: true,
    weight: nil,
    height: nil
  },
  {
    id: "e744a2af-a4d1-a993-ee8e-d374babcc360",
    name: "Pedro",
    breed: "Burro",
    color: "Gray",
    sex: "GELDING",
    foal_year: 1992,
    brand: nil,
    herd_management_area: nil,
    price: nil,
    featured: false,
    description: "Pedro is our little burro. He is absolutely in love with his lady, Sioux.",
    images: ["/uploads/Pedro/20260525213030037595.jpg"],
    deceased: false,
    weight: nil,
    height: nil
  },
  {
    id: "64ba8953-f9bf-0d76-cd52-5285808ac305",
    name: "Ty",
    breed: "Mustang",
    color: "Red Dun",
    sex: "GELDING",
    foal_year: 2004,
    brand: "04591559",
    herd_management_area: "Antelope Valley, Nevada",
    price: nil,
    featured: false,
    description: "Ty is a shy and timid horse. He likes his space but once he is caught is a super sweet guy.",
    images: ["/uploads/Ty/20260525213258637091.jpeg"],
    deceased: false,
    weight: 769,
    height: 13.2
  },
  {
    id: "5ac7f789-f777-48a7-97a2-32f25221edf8",
    name: "Dancer",
    breed: "Mustang",
    color: "Bay",
    sex: "GELDING",
    foal_year: 2004,
    brand: nil,
    herd_management_area: nil,
    price: nil,
    featured: false,
    description: nil,
    images: ["/uploads/Dancer/20260525211814071342.jpeg"],
    deceased: false,
    weight: 881,
    height: 14.1
  },
  {
    id: "4d8df2dd-17dd-4ab3-8618-8d567b8ced6b",
    name: "Titus",
    breed: "Mustang",
    color: "Red Roan",
    sex: "GELDING",
    foal_year: 2021,
    brand: "21027061",
    herd_management_area: "Stinking Water, Oregon",
    price: nil,
    featured: false,
    description: "Titus is a confident, curious red roan mustang from the Stinking Water HMA in Oregon. He has a big personality—eager to please, always interested in what’s around him, and occasionally willing to test the boundaries just to see what he can get away with. On the trail, Titus is steady, brave, and reliable.",
    images: ["/uploads/Titus/20260525213213053083.jpeg"],
    deceased: false,
    weight: 1057,
    height: 15.2
  },
  {
    id: "bc0bf059-33b6-48ef-ba77-be4c9f975ccc",
    name: "Tidd Bit",
    breed: "Halflinger",
    color: "Chestnut",
    sex: "GELDING",
    foal_year: 2020,
    brand: nil,
    herd_management_area: nil,
    price: 500000, # $5,000.00 converted to integer cents
    featured: true,
    description: "Tidd Bit is a sharp little chestnut with a flaxen mane and tail, approx. 800 lbs, and current on Coggins. He was originally bought for my wife, but after a hip replacement she can’t ride... Perfect size for a confident youth or small adult wanting a project with potential.",
    images: ["/uploads/Tidd Bit/20260525213121634594.jpg"],
    deceased: false,
    weight: 816,
    height: 13.2
  },
  {
    id: "c8936d47-7b9f-dd1e-e1d7-ca4aa0c24d24",
    name: "Desiree",
    breed: "Mustang",
    color: "Bay Roan",
    sex: "MARE",
    foal_year: 1999,
    brand: "99834654",
    herd_management_area: "Sweet Water, Wyoming",
    price: nil,
    featured: false,
    description: "Desiree is one of our sweet girls. She is lead mare even though she is a little smaller than the others.",
    images: [],
    deceased: true,
    weight: nil,
    height: nil
  },
  {
    id: "e453bda8-7939-b388-3944-d50079279f61",
    name: "Siera",
    breed: "Mustang",
    color: "Gray",
    sex: "MARE",
    foal_year: 2001,
    brand: "1576769",
    herd_management_area: "Elko, Nevado",
    price: nil,
    featured: false,
    description: nil,
    images: [],
    deceased: true,
    weight: nil,
    height: nil
  },
  {
    id: "2db88c9c-f44b-ebb8-3aa8-8a1d494f68c0",
    name: "Sioux",
    breed: "Mustang",
    color: "Gray",
    sex: "MARE",
    foal_year: 2005,
    brand: "05839350",
    herd_management_area: "Sweet Water, Wyoming",
    price: nil,
    featured: false,
    description: nil,
    images: [],
    deceased: true,
    weight: nil,
    height: nil
  },
  {
    id: "97b96d99-d250-49fb-bf79-cf277ede3b36",
    name: "Henry",
    breed: "Mustang",
    color: "Dunn",
    sex: "GELDING",
    foal_year: 2021,
    brand: nil,
    herd_management_area: "Palimino Butte, Oregon",
    price: nil,
    featured: false,
    description: "Henry is a sweet‑natured, gentle gelding with a steady temperament and an easygoing personality. He has grown far beyond expectations since arriving on the ranch and has become a dependable, enjoyable trail partner.",
    images: ["/uploads/Henry/20260525212945485720.jpeg"],
    deceased: false,
    weight: 932,
    height: 15.1
  },
  {
    id: "bf6bcab9-23bc-4e71-ac8f-c5f65ecc214e",
    name: "Rook",
    breed: "Mustang",
    color: "Bay",
    sex: "GELDING",
    foal_year: 2021,
    brand: nil,
    herd_management_area: nil,
    price: nil,
    featured: true,
    description: "Rook is a thoughtful, sensitive five‑year‑old bay gelding with a quiet presence that stands out even among other mustangs. Rook responds best to patience, not pressure.",
    images: ["/uploads/Rook/20260525230643862413.jpg"],
    deceased: false,
    weight: nil,
    height: nil
  }
]
Horse. transaction do
  Horse.destroy_all
  horses_data.each do |data|
    # 1. Use .new instead of .create so Rails doesn't hit the DB prematurely
    horse = Horse.new

    # 2. Assign the ID explicitly along with core attributes
    horse.id = SecureRandom.uuid
    horse.name = data[:name]
    horse.breed = data[:breed]
    horse.brand = data[:brand]
    horse.herd_management_area = data[:herd_management_area]
    horse.price = data[:price]
    horse.featured = data[:featured]
    horse.description = data[:description]
    horse.deceased = data[:deceased] || false
    horse.weight = data[:weight]
    horse.height = data[:height]

    # Safely assign color and sex ONLY if the database columns actually exist
    horse.color = data[:color] if horse.respond_to?(:color=)
    horse.sex = data[:sex] if horse.respond_to?(:sex=)

    # Approximate birth year safely
    horse.birthdate = data[:foal_year] ? Date.new(data[:foal_year], 1, 1) : nil

    # 3. Save exactly once. This will throw an error if any validations fail.
    horse.save!
  end
end
puts "Successfully rounded up #{Horse.count} horses into the database!"

unless User.exists?(username: "admin")
  puts "Saddling up... Seeding user data..."
  User.create!(
    username: "admin",
    password: "password123",
  )
  puts "Successfully created #{User.count} user(s) in the database!"
end