export interface MapSourceConfig {
  id: string;
  name: string;
  name_ne: string;
  tiles: string[];
  attribution: string;
  maxzoom: number;
  tileSize?: number;
}

export interface CameraPreset {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface TourStop {
  id: string;
  name_en: string;
  name_ne: string;
  camera: CameraPreset;
  duration: number; // in milliseconds
  description_en: string;
  description_ne: string;
}

/**
 * Swappable terrain and imagery sources in ONE file.
 * Free, public, no API keys required.
 */
export const MAP_SOURCES = {
  // 3D Terrain DEM (AWS Open Data Terrarium encoding)
  terrainDEM: {
    id: 'aws-terrain-dem',
    tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
    encoding: 'terrarium' as const,
    tileSize: 256,
    maxzoom: 15,
    attribution: 'Elevation tiles &copy; AWS Open Data Terrain Tiles',
  },

  // Satellite Imagery Options
  satelliteEOX: {
    id: 'sentinel-satellite',
    name: 'Sentinel-2 Cloudless',
    name_ne: 'सेन्टिनेल-२ उपग्रह',
    tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg'],
    attribution: '&copy; Sentinel-2 cloudless by EOX IT Services GmbH',
    maxzoom: 14,
    tileSize: 256,
  },

  satelliteEsri: {
    id: 'esri-satellite',
    name: 'Esri World Imagery',
    name_ne: 'विश्व उपग्रह तस्विर',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxzoom: 18,
    tileSize: 256,
  },

  // Cinematic Dark Style Tiles
  darkCarto: {
    id: 'carto-dark',
    name: 'Cinematic Dark',
    name_ne: 'सिनेम्याटिक डार्क',
    tiles: ['https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'],
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxzoom: 19,
    tileSize: 256,
  },

  // Standard OpenStreetMap for Terrain Base
  osmBase: {
    id: 'osm-base',
    name: 'Standard Terrain',
    name_ne: 'भू-भाग शैली',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '&copy; OpenStreetMap contributors',
    maxzoom: 18,
    tileSize: 256,
  },
};

/**
 * Camera View Presets
 */
export const CAMERA_PRESETS = {
  // High orbit overview of South Asia for cinematic fly-in
  southAsiaOrbit: {
    center: [84.1, 23.5] as [number, number],
    zoom: 4.8,
    pitch: 20,
    bearing: 0,
  },

  // Primary Nepal 3D overview looking towards Himalayas
  nepalDefault: {
    center: [84.3, 27.8] as [number, number],
    zoom: 7.2,
    pitch: 65,
    bearing: -12,
  },

  // 2D flat map mode
  nepal2D: {
    center: [84.124, 28.394] as [number, number],
    zoom: 7.0,
    pitch: 0,
    bearing: 0,
  },
};

/**
 * Guided Tour Stops through Nepal
 * Smooth camera sequence: Everest -> Annapurna -> Pokhara -> Kathmandu -> Lumbini -> Terai
 */
export const GUIDED_TOUR_STOPS: TourStop[] = [
  {
    id: 'everest',
    name_en: 'Mount Everest (Sagarmatha)',
    name_ne: 'सगरमाथा (८,८४८.८६ मिटर)',
    camera: {
      center: [86.9250, 27.9400],
      zoom: 11.8,
      pitch: 74,
      bearing: 30,
    },
    duration: 8000,
    description_en: 'The highest point on Earth (8,848.86 m), towering above the Khumbu Icefall.',
    description_ne: 'पृथ्वीको सर्वोच्च शिखर (८,८४८.८६ मिटर), खुम्बु हिमनदी माथि रहेको सुन्दर दृश्य।',
  },
  {
    id: 'annapurna',
    name_en: 'Annapurna Massif & Machapuchare',
    name_ne: 'अन्नपूर्ण हिमश्रृंखला र माछापुच्छ्रे',
    camera: {
      center: [83.8500, 28.5200],
      zoom: 11.5,
      pitch: 72,
      bearing: 15,
    },
    duration: 8000,
    description_en: 'Breathtaking 8,000m peaks and the sacred fishtail peak of Machapuchare.',
    description_ne: '८,००० मिटर अग्ला हिमालहरू र पवित्र माछापुच्छ्रे चुचुरोको मनमोहक दृश्य।',
  },
  {
    id: 'pokhara',
    name_en: 'Pokhara & Phewa Lake',
    name_ne: 'पोखरा र फेवा ताल',
    camera: {
      center: [83.9600, 28.2100],
      zoom: 12.0,
      pitch: 62,
      bearing: 345,
    },
    duration: 7000,
    description_en: 'The jewel valley of Nepal with serene lakes reflecting the Himalayas.',
    description_ne: 'हिमालको छायाँ देखिने नेपालको सुन्दर पर्यटकीय राजधानी र फेवा ताल।',
  },
  {
    id: 'kathmandu',
    name_en: 'Kathmandu Valley',
    name_ne: 'काठमाडौं उपत्यका',
    camera: {
      center: [85.3240, 27.7172],
      zoom: 11.8,
      pitch: 58,
      bearing: 20,
    },
    duration: 7500,
    description_en: 'The cultural epicenter of Nepal, surrounded by emerald hills and sacred temples.',
    description_ne: 'नेपालको ऐतिहासिक र सांस्कृतिक मुटु, चारैतिर हरिया डाँडाहरूले घेरिएको उपत्यका।',
  },
  {
    id: 'lumbini',
    name_en: 'Lumbini (Birthplace of Lord Buddha)',
    name_ne: 'लुम्बिनी (भगवान बुद्धको जन्मस्थल)',
    camera: {
      center: [83.2760, 27.4839],
      zoom: 12.5,
      pitch: 48,
      bearing: 5,
    },
    duration: 7000,
    description_en: 'World peace sanctuary and UNESCO World Heritage birthplace of Gautama Buddha.',
    description_ne: 'विश्व शान्तिको मुहान र भगवान गौतम बुद्धको जन्मस्थल।',
  },
  {
    id: 'terai',
    name_en: 'Chitwan & Terai Plains',
    name_ne: 'चितवन र तराईको समथर भू-भाग',
    camera: {
      center: [84.4500, 27.5300],
      zoom: 11.0,
      pitch: 52,
      bearing: 320,
    },
    duration: 7000,
    description_en: 'Lush tropical forests, one-horned rhinos, and the fertile plains of southern Nepal.',
    description_ne: 'एकसिङ्गे गैँडा, घना सालका वनहरू र नेपालको अन्नको भण्डार तराई।',
  },
];

/**
 * Device capability and performance quality settings
 */
export type QualityMode = 'high' | 'balanced' | 'low-power';

export interface QualityConfig {
  maxPitch: number;
  terrainExaggeration: number;
  tileCacheSize: number;
  enableFog: boolean;
  enableSky: boolean;
}

export const QUALITY_PRESETS: Record<QualityMode, QualityConfig> = {
  'high': {
    maxPitch: 85,
    terrainExaggeration: 1.35,
    tileCacheSize: 60,
    enableFog: true,
    enableSky: true,
  },
  'balanced': {
    maxPitch: 75,
    terrainExaggeration: 1.25,
    tileCacheSize: 35,
    enableFog: true,
    enableSky: true,
  },
  'low-power': {
    maxPitch: 60,
    terrainExaggeration: 1.0,
    tileCacheSize: 20,
    enableFog: false,
    enableSky: false,
  },
};
