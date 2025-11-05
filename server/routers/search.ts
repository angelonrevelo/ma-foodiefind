import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getRoomLocations, getRoomCravings, getRoomSearchResults, saveSearchResult } from "../db";
import { calculateCentroid } from "../utils/location";
import { searchNearbyPlaces } from "../utils/googleMaps";

export const searchRouter = router({
  searchRestaurants: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        searchRadius: z.number().default(5000),
        maxResults: z.number().default(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const locations = await getRoomLocations(input.roomId);
        const cravings = await getRoomCravings(input.roomId);

        if (locations.length === 0) {
          throw new Error("No locations found in room");
        }

        const centroid = calculateCentroid(
          locations.map((loc) => ({
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude),
          }))
        );

        const restaurantTypes = ["restaurant", "cafe", "bar"];

        const results = await searchNearbyPlaces({
          includedTypes: restaurantTypes,
          maxResultCount: input.maxResults,
          locationRestriction: {
            circle: {
              center: {
                latitude: centroid.latitude,
                longitude: centroid.longitude,
              },
              radius: input.searchRadius,
            },
          },
          languageCode: "en",
        });

        for (const result of results) {
          await saveSearchResult({
            roomId: input.roomId,
            googlePlaceId: result.id,
            name: result.displayName,
            address: result.formattedAddress,
            latitude: result.location.latitude.toString(),
            longitude: result.location.longitude.toString(),
            rating: result.rating?.toString(),
            userRatingCount: result.userRatingCount,
            photoUrl: result.photoUrl,
            websiteUrl: result.websiteUri,
            hasDelivery: result.delivery ? 1 : 0,
            hasDineIn: result.dineIn ? 1 : 0,
          });
        }

        return results;
      } catch (error) {
        console.error("Search error:", error);
        throw new Error("Failed to search restaurants");
      }
    }),

  getSearchResults: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const results = await getRoomSearchResults(input.roomId);
      return results;
    }),

  filterByDelivery: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        deliveryType: z.enum(["all", "delivery", "dineIn"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = await getRoomSearchResults(input.roomId);

      if (input.deliveryType === "all") {
        return results;
      }

      if (input.deliveryType === "delivery") {
        return results.filter((r) => r.hasDelivery === 1);
      }

      if (input.deliveryType === "dineIn") {
        return results.filter((r) => r.hasDineIn === 1);
      }

      return results;
    }),
});
