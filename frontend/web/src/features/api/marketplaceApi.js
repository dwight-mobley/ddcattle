import { baseApi } from './baseApi';

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getManagedListings: builder.query({
      query: (params = {}) => ({ url: 'marketplace/manage/listings/', params }),
      providesTags: ['ManagedSaleListing', 'Animal', 'Media'],
    }),
    getManagedListing: builder.query({
      query: id => `marketplace/manage/listings/${id}/`,
      providesTags: (result, error, id) => [{ type: 'ManagedSaleListing', id }, 'Animal', 'Media'],
    }),
    getListingAnimals: builder.query({
      query: params => ({ url: 'marketplace/manage/animals/', params }),
      providesTags: ['ListingAnimals', 'Animal'],
    }),
    getListingMedia: builder.query({
      query: params => ({ url: 'marketplace/manage/media/', params }),
      providesTags: ['Media'],
    }),
    createListing: builder.mutation({
      query: data => ({ url: 'marketplace/manage/listings/', method: 'POST', body: data }),
      invalidatesTags: (result, error) => error ? [] : ['SaleListing', 'ManagedSaleListing', 'ListingAnimals'],
    }),
    updateListing: builder.mutation({
      query: ({ id, data }) => ({ url: `marketplace/manage/listings/${id}/`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error) => error ? [] : ['SaleListing', 'ManagedSaleListing', 'ListingAnimals'],
    }),
    getListings: builder.query({
      query: (params = {}) => ({ url: 'marketplace/listings/', params }),
      providesTags: ['SaleListing', 'Animal', 'Media'],
    }),
    sendListingInquiry: builder.mutation({
      query: ({ id, data }) => ({ url: `marketplace/listings/${id}/inquire/`, method: 'POST', body: data }),
    }),
    getListing: builder.query({
      query: id => `marketplace/listings/${id}/`,
      providesTags: (result, error, id) => [{ type: 'SaleListing', id }, 'Animal', 'Media'],
    }),
  }),
});

export const { useGetListingsQuery, useGetListingQuery, useSendListingInquiryMutation, useGetManagedListingsQuery, useGetManagedListingQuery, useGetListingAnimalsQuery, useGetListingMediaQuery, useCreateListingMutation, useUpdateListingMutation } = marketplaceApi;
