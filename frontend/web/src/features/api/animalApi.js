import { baseApi } from "../api/baseApi";

export const animalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnimals: builder.query({
      query: () => "animals/",
      providesTags: ['Animal'],
    }),
    getFeaturedAnimals: builder.query({
      query: () => "animals/?featured=True",
      providesTags: ['Animal'],
    }),
    getAnimalBySlug: builder.query({
      query: (slug) => `animals/${slug}/`,
      providesTags: (result, error, slug) => [{ type: 'Animal', id: slug }],
    }),
    // --- NEW BREED ENDPOINTS ---
    getHorseBreeds: builder.query({
      query: () => "horse-breeds/", // Adjust to match your Django URL route
      providesTags: ['HorseBreed'],
    }),
    getDogBreeds: builder.query({
      query: () => "dog-breeds/", // Adjust to match your Django URL route
      providesTags: ['DogBreed'],
    }),
    sendAnimalInquiry: builder.mutation({
      query: ({ slug, data }) => ({
        url: `animals/${slug}/inquire/`,
        method: 'POST',
        body: data,
      }),
    }),
    // ---------------------------
    addAnimal: builder.mutation({
      query: (newAnimal) => ({
        url: 'animals/',
        method: 'POST',
        body: newAnimal,
      }),
      invalidatesTags: ['Animal'],
    }),
    updateAnimal: builder.mutation({
      query: ({ slug, ...updates }) => ({
        url: `animals/${slug}/`,
        method: 'PUT', 
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => ['Animal', { type: 'Animal', id: id }],
    }),
    deleteAnimal: builder.mutation({
      query: (id) => ({
        url: `animals/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Animal'],
    }),
  }),
});

export const { 
    useGetAnimalsQuery, 
    useGetAnimalBySlugQuery,
    useGetFeaturedAnimalsQuery, 
    useGetHorseBreedsQuery, 
    useGetDogBreedsQuery, 
    useSendAnimalInquiryMutation,
    useAddAnimalMutation,
    useUpdateAnimalMutation,
    useDeleteAnimalMutation 
} = animalApi;