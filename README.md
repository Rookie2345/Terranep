# TerraNep (टेरानेप)

> **Realistic, interactive 3D living map of Nepal**

TerraNep is a mobile-first web app showing Nepal as a high-definition 3D terrain draped with Sentinel-2 cloudless satellite imagery, AWS Terrarium DEM hillshading, and real-time live environmental data (USGS earthquakes, Open-Meteo weather and air quality).

## Features
- **Cinematic 3D Terrain**: Real elevation from AWS Terrarium DEM tiles + Sentinel-2 cloudless satellite imagery.
- **Pure Static Frontend**: Zero server sleep, zero cold start, Vite + React + TypeScript + Tailwind CSS.
- **Live Environmental Data**:
  - USGS Earthquakes (Nepal bounding box, 30 days, interactive pulse rings)
  - Open-Meteo live weather for cities & mountain base camps
  - Open-Meteo Air Quality (AQI & PM2.5)
- **77 Districts**: Boundary interaction, bilingual district names, regional data.
- **Cultural & Natural Places**: 3D markers and heritage tour.
- **Bilingual**: Nepali (default) and English with instant toggle.
- **Bikram Sambat (BS) & AD Dual Calendar**: Live Nepal Time (UTC+5:45) with Devanagari numerals.
- **Instant Branded Splash Screen**: Inline HTML/CSS inside `index.html` for sub-second first paint.

## Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

## Data Sources & Licenses
- **Terrain DEM**: AWS Elevation Tiles (Terrarium encoding, Open Data)
- **Satellite Imagery**: Sentinel-2 cloudless by EOX IT Services GmbH (CC BY 4.0)
- **Earthquakes**: USGS Earthquake Hazards Program API
- **Weather & AQI**: Open-Meteo Public APIs
