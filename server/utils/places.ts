export interface NearbySearchParams {
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

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

function buildOverpassQuery(params: NearbySearchParams) {
  const { circle } = params.locationRestriction;
  const radius = Math.min(Math.max(circle.radius, 100), 50000);
  const { latitude, longitude } = circle.center;
  const amenities = params.includedTypes.length
    ? params.includedTypes.join("|")
    : "restaurant|cafe|bar|fast_food";

  return `
[out:json][timeout:25];
(
  node["amenity"~"${amenities}"](around:${radius},${latitude},${longitude});
  way["amenity"~"${amenities}"](around:${radius},${latitude},${longitude});
  relation["amenity"~"${amenities}"](around:${radius},${latitude},${longitude});
);
out center tags;
`;
}

function formatAddress(tags: Record<string, string> = {}) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"],
    tags["addr:country"],
  ].filter(Boolean);

  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  if (parts.length === 0) {
    return tags["description"] || "";
  }

  return parts.join(", ");
}

function extractCoordinates(element: OverpassElement) {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { latitude: element.lat, longitude: element.lon };
  }

  if (element.center) {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }

  return null;
}

function haversineDistance(
  origin: { latitude: number; longitude: number },
  target: { latitude: number; longitude: number }
) {
  const R = 6371e3; // metres
  const φ1 = (origin.latitude * Math.PI) / 180;
  const φ2 = (target.latitude * Math.PI) / 180;
  const Δφ = ((target.latitude - origin.latitude) * Math.PI) / 180;
  const Δλ = ((target.longitude - origin.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function searchNearbyPlaces(
  params: NearbySearchParams
): Promise<PlaceResult[]> {
  try {
    const query = buildOverpassQuery(params);
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "FoodieFindApp/1.0 (https://foodiefind.local)",
      },
      body: new URLSearchParams({ data: query }).toString(),
    });

    if (!response.ok) {
      console.error("Overpass API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    const elements: OverpassElement[] = data.elements ?? [];
    const { latitude, longitude } = params.locationRestriction.circle.center;

    const unique = new Map<string, PlaceResult & { distance: number }>();

    for (const element of elements) {
      const coords = extractCoordinates(element);
      if (!coords) continue;

      const tags = element.tags ?? {};
      const name = tags.name || "Unnamed Location";
      const address = formatAddress(tags);
      const key = `${name}|${address}|${coords.latitude.toFixed(6)}|${coords.longitude.toFixed(6)}`;

      if (unique.has(key)) continue;

      const distance = haversineDistance(
        { latitude, longitude },
        coords
      );

      const place: PlaceResult & { distance: number } = {
        id: `osm:${element.type}/${element.id}`,
        displayName: name,
        formattedAddress: address,
        location: coords,
        photoUrl: tags.image,
        websiteUri:
          tags.website ||
          tags["contact:website"] ||
          tags.url ||
          tags["contact:url"],
        delivery:
          tags.delivery === "yes" ||
          tags["delivery:takeaway"] === "yes" ||
          tags["delivery:food"] === "yes",
        dineIn: tags.takeaway === "only" ? false : true,
        takeout: tags.takeaway === "yes" || tags.takeaway === "only",
        distance,
      };

      unique.set(key, place);
    }

    const sorted = Array.from(unique.values()).sort(
      (a, b) => a.distance - b.distance
    );

    const maxResults = params.maxResultCount ?? 20;
    return sorted.slice(0, maxResults).map(({ distance: _distance, ...place }) => place);
  } catch (error) {
    console.error("Error searching nearby places:", error);
    return [];
  }
}

export function parseKeywordsFromCravings(cravings: string[]): string {
  return cravings.join(" ");
}

