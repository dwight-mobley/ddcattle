export type HorseImage = {
  id: number;
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
  id: string;
  age: number | null;
  name: string;
  breed: HorseBreed;
  color: string;
  sex: 'GELDING' | 'MARE';
  birthdate: Date | null;
  brand: string | null;
  herd_management_area: string | null;
  price: number | null;
  featured: boolean;
  description: string | null;
  images: HorseImage[];
  deceased: boolean;
  weight: number | null;
  height: number | null;
}

export type HorseFormPayload = Omit<Horse, 'id' | 'images'> & { images: File[] };

export type HorseFormErrors = Partial<Record<keyof HorseFormPayload, string>>;

export const HORSE_BREEDS: HorseBreed[] = [
  'Mustang',
  'Quarter Horse',
  'Paint Horse',
  'Burro',
  'Halflinger',
];

export const HORSE_SEX_OPTIONS = [
  { value: 'GELDING' as const, label: 'Gelding' },
  { value: 'MARE' as const, label: 'Mare' },
];

export function getDefaultFormData(): HorseFormPayload {
  return {
    name: '',
    breed: 'Mustang',
    color: '',
    sex: 'GELDING',
    age: null,
    birthdate: null,
    brand: null,
    herd_management_area: null,
    price: null,
    featured: false,
    description: null,
    images: [],
    deceased: false,
    weight: null,
    height: null,
  };
}

export function horseToFormData(horse: Horse): HorseFormPayload {
  return {
    name: horse.name,
    breed: horse.breed,
    color: horse.color,
    sex: horse.sex,
    age: horse.age,
    birthdate: horse.birthdate,
    brand: horse.brand,
    herd_management_area: horse.herd_management_area,
    price: horse.price,
    featured: horse.featured,
    description: horse.description,
    images: [],
    deceased: horse.deceased,
    weight: horse.weight,
    height: horse.height,
  };
}

export function validateHorseForm(data: HorseFormPayload): HorseFormErrors {
  const errors: HorseFormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.color.trim()) {
    errors.color = 'Color is required';
  }

  if (data.age !== null && data.age < 0) {
    errors.age = 'Age cannot be negative';
  }

  if (data.price !== null && data.price < 0) {
    errors.price = 'Price cannot be negative';
  }

  if (data.weight !== null && data.weight < 0) {
    errors.weight = 'Weight cannot be negative';
  }

  if (data.height !== null && data.height < 0) {
    errors.height = 'Height cannot be negative';
  }

  return errors;
}
