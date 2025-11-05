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

export async function searchNearbyPlaces(
  params: GooglePlacesSearchParams
): Promise<PlaceResult[]> {
  try {
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

    return data.places.map((place: any) => ({
      id: place.name?.split("/").pop() || "",
      displayName: place.displayName?.text || "",
      formattedAddress: place.formattedAddress || "",
      location: {
        latitude: place.location?.latitude || 0,
        longitude: place.location?.longitude || 0,
      },
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      photoUrl: place.photos?.[0]?.name || "",
      websiteUri: place.websiteUri,
      delivery: place.delivery || false,
      dineIn: place.dineIn || false,
      takeout: place.takeout || false,
    }));
  } catch (error) {
    console.error("Error searching nearby places:", error);
    return [];
  }
}

export function parseKeywordsFromCravings(cravings: string[]): string {
  return cravings.join(" ");
}
