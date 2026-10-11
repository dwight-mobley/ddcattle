import { baseApi } from './baseApi';

export const privateTracksApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPrivateTracks: builder.query({
      query: ({ page }) => ({ url: `training/recorded-tracks/?page=${page}`, cache: 'no-store' }),
      keepUnusedDataFor: 0,
    }),
    getPrivateTrack: builder.query({
      async queryFn({ id, ownerId }, api, extraOptions, baseQuery) {
        const detail = await baseQuery({ url: `training/recorded-tracks/${id}/`, cache: 'no-store' });
        if (detail.error) return detail;
        const track = detail.data;
        if (track.owner_id !== String(ownerId)) return { error: { status: 'CUSTOM_ERROR', error: 'Account changed or backend update required. Refresh and sign in again.' } };
        if (track.state !== 'COMPLETE') return { data: { track, points: [] } };
        const points = [];
        const count = track.manifest.batch_digests.length;
        if (count > 40) return { error: { status: 'CUSTOM_ERROR', error: 'Unsupported track size.' } };
        for (let batch = 0; batch < count; batch++) {
          if (api.signal.aborted) return { error: { status: 'CUSTOM_ERROR', error: 'Request cancelled.' } };
          const response = await baseQuery({ url: `training/recorded-tracks/${id}/samples/?batch=${batch}`, cache: 'no-store' });
          if (response.error) return response;
          if (response.data.owner_id !== String(ownerId) || response.data.track_id !== Number(id) || response.data.index !== batch || response.data.total_batches !== count || !Array.isArray(response.data.samples)) {
            return { error: { status: 'CUSTOM_ERROR', error: 'Unexpected private track response. Refresh before viewing.' } };
          }
          points.push(...response.data.samples);
        }
        if (points.length !== track.manifest.expected_samples) return { error: { status: 'CUSTOM_ERROR', error: 'Incomplete track data. Ask the administrator to review.' } };
        return { data: { track, points } };
      },
      keepUnusedDataFor: 0,
    }),
  }),
});
export const { useGetPrivateTracksQuery, useGetPrivateTrackQuery } = privateTracksApi;
