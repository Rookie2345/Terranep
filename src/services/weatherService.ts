export interface WeatherStation {
  id: string;
  name_en: string;
  name_ne: string;
  lat: number;
  lon: number;
  elevation: number;
  isMountain?: boolean;
}

export interface StationLiveMetrics {
  station: WeatherStation;
  temperature: number; // Celsius
  weatherCode: number;
  condition_en: string;
  condition_ne: string;
  windSpeed: number; // km/h
  humidity: number; // %
  aqi: number; // US AQI
  pm25: number; // ug/m3
  aqiCategory_en: string;
  aqiCategory_ne: string;
  aqiColor: string;
}

export const WEATHER_STATIONS: WeatherStation[] = [
  { id: 'ktm', name_en: 'Kathmandu', name_ne: 'काठमाडौं', lat: 27.7172, lon: 85.3240, elevation: 1400 },
  { id: 'pkr', name_en: 'Pokhara', name_ne: 'पोखरा', lat: 28.2096, lon: 83.9856, elevation: 822 },
  { id: 'brt', name_en: 'Biratnagar', name_ne: 'विराटनगर', lat: 26.4525, lon: 87.2718, elevation: 80 },
  { id: 'brj', name_en: 'Birgunj', name_ne: 'वीरगञ्ज', lat: 27.0135, lon: 84.8773, elevation: 91 },
  { id: 'btl', name_en: 'Butwal', name_ne: 'बुटवल', lat: 27.7006, lon: 83.4484, elevation: 200 },
  { id: 'npg', name_en: 'Nepalgunj', name_ne: 'नेपालगञ्ज', lat: 28.0500, lon: 81.6167, elevation: 150 },
  { id: 'dgd', name_en: 'Dhangadhi', name_ne: 'धनगढी', lat: 28.6833, lon: 80.6000, elevation: 180 },
  { id: 'jkp', name_en: 'Janakpur', name_ne: 'जनकपुर', lat: 26.7288, lon: 85.9244, elevation: 74 },
  { id: 'dhr', name_en: 'Dharan', name_ne: 'धरान', lat: 26.8124, lon: 87.2834, elevation: 349 },
  { id: 'bht', name_en: 'Bharatpur', name_ne: 'भरतपुर', lat: 27.6833, lon: 84.4333, elevation: 208 },
  { id: 'htd', name_en: 'Hetauda', name_ne: 'हेटौंडा', lat: 27.4287, lon: 85.0322, elevation: 460 },
  { id: 'lmb', name_en: 'Lumbini', name_ne: 'लुम्बिनी', lat: 27.4839, lon: 83.2760, elevation: 150 },
  { id: 'jms', name_en: 'Jomsom', name_ne: 'जोमसोम', lat: 28.7833, lon: 83.7333, elevation: 2743, isMountain: true },
  { id: 'ebc', name_en: 'Everest Base Camp', name_ne: 'सगरमाथा बेस क्याम्प', lat: 28.0044, lon: 86.8528, elevation: 5364, isMountain: true },
  { id: 'abc', name_en: 'Annapurna Base Camp', name_ne: 'अन्नपूर्ण बेस क्याम्प', lat: 28.5300, lon: 83.8780, elevation: 4130, isMountain: true },
];

/**
 * WMO Weather condition mappings
 */
export function getWeatherCondition(code: number): { en: string; ne: string } {
  if (code === 0) return { en: 'Clear sky', ne: 'सफा आकाश' };
  if (code === 1) return { en: 'Mainly clear', ne: 'प्रायः सफा' };
  if (code === 2) return { en: 'Partly cloudy', ne: 'आंशिक बदली' };
  if (code === 3) return { en: 'Overcast', ne: 'पूर्ण बदली' };
  if (code === 45 || code === 48) return { en: 'Foggy / Hazy', ne: 'कुहिरो / हुस्सु' };
  if (code >= 51 && code <= 55) return { en: 'Light drizzle', ne: 'हल्का सिमसिम पानी' };
  if (code >= 61 && code <= 65) return { en: 'Rain showers', ne: 'वर्षा' };
  if (code >= 71 && code <= 77) return { en: 'Snowfall', ne: 'हिमपात' };
  if (code >= 80 && code <= 82) return { en: 'Heavy showers', ne: 'भारी वर्षा' };
  if (code >= 95) return { en: 'Thunderstorm', ne: 'चट्याङसहित वर्षा' };
  return { en: 'Partly cloudy', ne: 'आंशिक बदली' };
}

/**
 * AQI category and color coding
 */
export function getAQIInfo(aqi: number): { category_en: string; category_ne: string; color: string } {
  if (aqi <= 50) return { category_en: 'Good (Healthy)', category_ne: 'राम्रो (स्वस्थ)', color: '#10B981' };
  if (aqi <= 100) return { category_en: 'Moderate', category_ne: 'मध्यम', color: '#FBBF24' };
  if (aqi <= 150) return { category_en: 'Unhealthy for Sensitive', category_ne: 'संवेदनशीलका लागि अस्वस्थ', color: '#F97316' };
  if (aqi <= 200) return { category_en: 'Unhealthy', category_ne: 'अस्वस्थ', color: '#EF4444' };
  if (aqi <= 300) return { category_en: 'Very Unhealthy', category_ne: 'धेरै अस्वस्थ', color: '#8B5CF6' };
  return { category_en: 'Hazardous', category_ne: 'घातक / खतरनाक', color: '#7E22CE' };
}

const WEATHER_CACHE_KEY = 'terranep_weather_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches batch weather and AQI for all Nepal stations
 */
export async function fetchAllStationsMetrics(): Promise<Record<string, StationLiveMetrics>> {
  // Check local cache
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch {
    // Ignore
  }

  const results: Record<string, StationLiveMetrics> = {};

  // Fetch parallel weather & air quality
  const lats = WEATHER_STATIONS.map((s) => s.lat).join(',');
  const lons = WEATHER_STATIONS.map((s) => s.lon).join(',');

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=us_aqi,pm2_5`),
    ]);

    const weatherData = await weatherRes.json();
    const aqiData = await aqiRes.json();

    const weatherList = Array.isArray(weatherData) ? weatherData : [weatherData];
    const aqiList = Array.isArray(aqiData) ? aqiData : [aqiData];

    WEATHER_STATIONS.forEach((station, index) => {
      const wCur = weatherList[index]?.current || {};
      const aCur = aqiList[index]?.current || {};

      const temp = Math.round(wCur.temperature_2m ?? 20);
      const wCode = wCur.weather_code ?? 0;
      const cond = getWeatherCondition(wCode);
      const wind = Math.round(wCur.wind_speed_10m ?? 8);
      const humidity = Math.round(wCur.relative_humidity_2m ?? 60);

      const usAqi = Math.round(aCur.us_aqi ?? 65);
      const pm25 = Math.round(aCur.pm2_5 ?? 22);
      const aqiInfo = getAQIInfo(usAqi);

      results[station.id] = {
        station,
        temperature: temp,
        weatherCode: wCode,
        condition_en: cond.en,
        condition_ne: cond.ne,
        windSpeed: wind,
        humidity,
        aqi: usAqi,
        pm25,
        aqiCategory_en: aqiInfo.category_en,
        aqiCategory_ne: aqiInfo.category_ne,
        aqiColor: aqiInfo.color,
      };
    });

    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: results }));
    } catch {
      // Ignore
    }

    return results;
  } catch (error) {
    console.warn('Weather fetch error, falling back:', error);
    // Provide sensible fallback if offline
    WEATHER_STATIONS.forEach((station) => {
      const cond = getWeatherCondition(1);
      const aqiInfo = getAQIInfo(70);
      results[station.id] = {
        station,
        temperature: station.isMountain ? -4 : 22,
        weatherCode: 1,
        condition_en: cond.en,
        condition_ne: cond.ne,
        windSpeed: 10,
        humidity: 60,
        aqi: 70,
        pm25: 25,
        aqiCategory_en: aqiInfo.category_en,
        aqiCategory_ne: aqiInfo.category_ne,
        aqiColor: aqiInfo.color,
      };
    });
    return results;
  }
}
