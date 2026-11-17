export interface EarthquakeFeature {
  id: string;
  magnitude: number;
  place: string;
  time: number; // UTC timestamp ms
  depth: number; // km
  coordinates: [number, number]; // [lng, lat]
  title: string;
  url: string;
}

export type QuakeTimeFilter = '24h' | '7d' | '30d';

const CACHE_KEY = 'terranep_quakes_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches earthquakes from USGS GeoJSON API within Nepal bounding box (lat 26.3-30.6, lon 79.9-88.3)
 */
export async function fetchNepalEarthquakes(days = 30): Promise<EarthquakeFeature[]> {
  const now = new Date();
  const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  // Try cached data first if offline
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY && data && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Ignore cache parse error
  }

  // Nepal Bounding Box
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=26.3&maxlatitude=30.6&minlongitude=79.9&maxlongitude=88.3&starttime=${startTime}&minmagnitude=2.0&orderby=time`;

  try {
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) throw new Error(`USGS HTTP error: ${response.status}`);
    const geojson = await response.json();

    const quakes: EarthquakeFeature[] = (geojson.features || []).map((f: any) => ({
      id: f.id,
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      depth: f.geometry.coordinates[2],
      coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]],
      title: f.properties.title,
      url: f.properties.url,
    }));

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: quakes }));
    } catch {
      // Storage quota exceeded
    }

    return quakes;
  } catch (error) {
    console.warn('Earthquake fetch error, returning fallback cache:', error);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached).data || [];
    } catch {
      // Ignore
    }
    return [];
  }
}

/**
 * Filter earthquakes by time duration
 */
export function filterQuakesByTime(quakes: EarthquakeFeature[], filter: QuakeTimeFilter): EarthquakeFeature[] {
  const now = Date.now();
  const msMap: Record<QuakeTimeFilter, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  const cutoff = now - msMap[filter];
  return quakes.filter((q) => q.time >= cutoff);
}

/**
 * Color coding by magnitude
 */
export function getQuakeColor(mag: number): string {
  if (mag < 3.5) return '#FBBF24'; // Light yellow
  if (mag < 4.5) return '#FB923C'; // Warm orange
  if (mag < 5.5) return '#F97316'; // Deep orange
  if (mag < 6.5) return '#EF4444'; // Red
  return '#DC2626'; // Severe crimson
}
