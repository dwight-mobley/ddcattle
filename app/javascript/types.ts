type HorseImage = {
  id:number;
  url: string;
  thumbnail_url: string;
};

export type HorseBreed =
  | 'Mustang'
  | 'Quarter Horse'
  | 'Paint Horse'
  | 'Burro'
  | 'Halflinger';



export interface Horse {
  id: string; // Switched to string to handle your native UUIDs
  name: string;
  breed: HorseBreed;
  color: string;
  sex: 'GELDING' | 'MARE';
  foal_year: number;
  brand: string | null;
  herd_management_area: string | null; // Unified parameter name
  price: number | null;               // Stored in cents. null = Not for sale
  featured: boolean;
  description: string | null;
  images: HorseImage[];
  deceased: boolean;
  weight: number | null;
  height: number | null;
}

export type HorseFormPayload = Omit<Horse, 'id' | 'images'> & { images: File[] };