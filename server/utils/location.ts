export interface Location {
  latitude: number;
  longitude: number;
}

export function calculateCentroid(locations: Location[]): Location {
  if (locations.length === 0) {
    throw new Error("No locations provided");
  }

  if (locations.length === 1) {
    return locations[0];
  }

  let sumLat = 0;
  let sumLng = 0;

  for (const loc of locations) {
    sumLat += loc.latitude;
    sumLng += loc.longitude;
  }

  return {
    latitude: sumLat / locations.length,
    longitude: sumLng / locations.length,
  };
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
