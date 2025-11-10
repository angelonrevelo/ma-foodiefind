export interface GooglePlacesSearchParams {
  includedTypes: string[];
  maxResultCount?: number;
  locationRestriction: {
    circle: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: number;
    };
  };
  languageCode?: string;
}

export interface PlaceResult {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  photoUrl?: string;
  websiteUri?: string;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function ensureApiKey(): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    const error = new Error(
      "Google Maps API key is not configured. Set GOOGLE_MAPS_API_KEY in your environment."
    );
    console.error(error.message);
    throw error;
  }

  return GOOGLE_MAPS_API_KEY;
}

export async function searchNearbyPlaces(
  params: GooglePlacesSearchParams
): Promise<PlaceResult[]> {
  try {
    const apiKey = await ensureApiKey();
    const fieldMask = [
      "places.displayName",
      "places.formattedAddress",
      "places.location",
      "places.photos",
      "places.rating",
      "places.userRatingCount",
      "places.websiteUri",
      "places.delivery",
      "places.dineIn",
      "places.takeout",
    ].join(",");

    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": fieldMask,
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error("Google Places API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.places) {
      return [];
    }

    return data.places.map((place: any) => {
      const photoName = place.photos?.[0]?.name;
      const photoUrl = photoName
        ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`
        : undefined;

      return {
        id: place.name?.split("/").pop() || "",
        displayName: place.displayName?.text || "",
        formattedAddress: place.formattedAddress || "",
        location: {
          latitude: place.location?.latitude || 0,
          longitude: place.location?.longitude || 0,
        },
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        photoUrl,
        websiteUri: place.websiteUri,
        delivery: place.delivery || false,
        dineIn: place.dineIn || false,
        takeout: place.takeout || false,
      } satisfies PlaceResult;
    });
  } catch (error) {
    console.error("Error searching nearby places:", error);
    return [];
  }
}

export function parseKeywordsFromCravings(cravings: string[]): string {
  return cravings.join(" ");
}
