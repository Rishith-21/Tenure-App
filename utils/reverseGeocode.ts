/**
 * Reverse geocode lat/lng to a short place label (neighbourhood + city).
 * Uses OpenStreetMap Nominatim — no API key required.
 */
export async function reverseGeocodePlace(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}` +
    `&lon=${longitude}&zoom=14&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'TenureApp/1.0',
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    address?: {
      suburb?: string;
      neighbourhood?: string;
      quarter?: string;
      city_district?: string;
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
    };
    display_name?: string;
  };

  const a = data.address;
  if (!a) {
    const short = data.display_name?.split(',').slice(0, 2).join(', ').trim();
    return short || null;
  }

  const area =
    a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? null;
  const city = a.city ?? a.town ?? a.village ?? a.state ?? null;

  if (area && city && area !== city) {
    return `${area}, ${city}`;
  }
  if (city) {
    return city;
  }
  if (area) {
    return area;
  }

  const short = data.display_name?.split(',').slice(0, 2).join(', ').trim();
  return short || null;
}
