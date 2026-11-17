import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  MAP_SOURCES, 
  CAMERA_PRESETS, 
  GUIDED_TOUR_STOPS, 
  QUALITY_PRESETS, 
  type QualityMode 
} from '../config/mapConfig';
import type { MapStyleMode, ActiveLayersConfig } from './LayerSwitcher';
import type { EarthquakeFeature } from '../services/earthquakeService';
import type { StationLiveMetrics } from '../services/weatherService';
import type { DistrictInfo } from './DistrictSheet';
import type { PlaceItem } from './PlaceDetailModal';
import placesData from '../data/places.json';

interface Map3DProps {
  currentStyle: MapStyleMode;
  exaggeration: number;
  quality: QualityMode;
  is3D: boolean;
  activeLayers: ActiveLayersConfig;
  quakes: EarthquakeFeature[];
  weatherMetrics: Record<string, StationLiveMetrics>;
  selectedDistrictId: number | null;
  onSelectDistrict: (dist: DistrictInfo | null) => void;
  onSelectQuake: (quake: EarthquakeFeature | null) => void;
  onSelectPlace: (place: PlaceItem | null) => void;
  onSelectWeather: (metric: StationLiveMetrics | null) => void;
  onMapLoaded?: () => void;
  onAltitudeChange?: (altitude: number) => void;
  isIntroPlaying: boolean;
  onIntroEnd: () => void;
  isTouring: boolean;
  onTourEnd: () => void;
  currentTourStopIndex: number;
  onTourStopChange: (index: number) => void;
}

export const Map3D: React.FC<Map3DProps> = ({
  currentStyle,
  exaggeration,
  quality,
  is3D,
  activeLayers,
  quakes,
  weatherMetrics,
  selectedDistrictId,
  onSelectDistrict,
  onSelectQuake,
  onSelectPlace,
  onSelectWeather,
  onMapLoaded,
  onAltitudeChange,
  isIntroPlaying,
  onIntroEnd,
  isTouring,
  onTourEnd,
  currentTourStopIndex,
  onTourStopChange,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const weatherMarkersRef = useRef<maplibregl.Marker[]>([]);
  const placesMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const tourTimeoutRef = useRef<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Parse URL hash for camera position if available
    let initialCamera = CAMERA_PRESETS.nepalDefault;
    let hasHashLoc = false;
    if (window.location.hash.includes('loc=')) {
      try {
        const parts = window.location.hash.split('loc=')[1].split('&')[0].split(',');
        if (parts.length >= 4) {
          initialCamera = {
            center: [parseFloat(parts[0]), parseFloat(parts[1])],
            zoom: parseFloat(parts[2]),
            pitch: parseFloat(parts[3]),
            bearing: parseFloat(parts[4] || '0'),
          };
          hasHashLoc = true;
        }
      } catch {
        // Fallback
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startCamera = (hasHashLoc || prefersReducedMotion) 
      ? initialCamera 
      : CAMERA_PRESETS.southAsiaOrbit;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#0B1220' },
          },
        ],
      },
      center: startCamera.center,
      zoom: startCamera.zoom,
      pitch: startCamera.pitch,
      bearing: startCamera.bearing,
      maxPitch: QUALITY_PRESETS[quality].maxPitch,
      attributionControl: false,
      renderWorldCopies: false,
    });

    map.on('load', () => {
      // 1. AWS Terrarium DEM elevation source
      map.addSource('terrain-dem', {
        type: 'raster-dem',
        tiles: MAP_SOURCES.terrainDEM.tiles,
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15,
      });

      if (is3D) {
        map.setTerrain({
          source: 'terrain-dem',
          exaggeration: exaggeration,
        });
      }

      // 2. Hillshade Layer
      map.addLayer({
        id: 'hillshade-layer',
        type: 'hillshade',
        source: 'terrain-dem',
        layout: { visibility: 'visible' },
        paint: {
          'hillshade-exaggeration': 0.6,
          'hillshade-shadow-color': '#070B14',
          'hillshade-highlight-color': '#E2E8F0',
          'hillshade-accent-color': '#0B1220',
        },
      });

      // 3. Satellite Imagery
      map.addSource('satellite-source', {
        type: 'raster',
        tiles: MAP_SOURCES.satelliteEsri.tiles,
        tileSize: 256,
        maxzoom: 18,
      });

      map.addLayer({
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite-source',
        layout: { visibility: currentStyle === 'satellite' ? 'visible' : 'none' },
        paint: {
          'raster-opacity': 0.96,
          'raster-contrast': 0.08,
          'raster-saturation': 0.12,
        },
      });

      // 4. Dark Style Tiles
      map.addSource('dark-source', {
        type: 'raster',
        tiles: MAP_SOURCES.darkCarto.tiles,
        tileSize: 256,
        maxzoom: 19,
      });

      map.addLayer({
        id: 'dark-layer',
        type: 'raster',
        source: 'dark-source',
        layout: { visibility: currentStyle === 'dark' ? 'visible' : 'none' },
        paint: { 'raster-opacity': 0.9 },
      });

      // 5. Districts GeoJSON Boundary Layer
      map.addSource('districts-source', {
        type: 'geojson',
        data: '/nepal-districts.geojson',
      });

      map.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'districts-source',
        layout: { visibility: activeLayers.districts ? 'visible' : 'none' },
        paint: {
          'fill-color': '#3DD6F5',
          'fill-opacity': 0.04,
        },
      });

      map.addLayer({
        id: 'districts-line',
        type: 'line',
        source: 'districts-source',
        layout: { visibility: activeLayers.districts ? 'visible' : 'none' },
        paint: {
          'line-color': '#3DD6F5',
          'line-width': 1.2,
          'line-opacity': 0.35,
        },
      });

      map.addLayer({
        id: 'districts-highlight',
        type: 'line',
        source: 'districts-source',
        layout: { visibility: activeLayers.districts ? 'visible' : 'none' },
        paint: {
          'line-color': '#3DD6F5',
          'line-width': 3.2,
          'line-opacity': 0.95,
        },
        filter: ['==', ['get', 'id'], -1],
      });

      // District click handler
      map.on('click', 'districts-fill', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as any;
        onSelectDistrict({
          id: props.id,
          name_en: props.name_en,
          name_ne: props.name_ne,
          province_id: props.province_id,
          province_en: props.province_en,
          province_ne: props.province_ne,
        });
      });

      map.on('mouseenter', 'districts-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'districts-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      // 6. Earthquakes GeoJSON Source and Layers
      map.addSource('quakes-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Outer pulse halo
      map.addLayer({
        id: 'quakes-halo',
        type: 'circle',
        source: 'quakes-source',
        layout: { visibility: activeLayers.earthquakes ? 'visible' : 'none' },
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'magnitude'],
            2.0, 14,
            4.0, 24,
            6.0, 42,
            7.5, 65
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.28,
          'circle-blur': 0.7,
        },
      });

      // Inner glowing core
      map.addLayer({
        id: 'quakes-core',
        type: 'circle',
        source: 'quakes-source',
        layout: { visibility: activeLayers.earthquakes ? 'visible' : 'none' },
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'magnitude'],
            2.0, 5,
            4.0, 9,
            6.0, 16,
            7.5, 24
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.9,
        },
      });

      // Quake click handler
      map.on('click', 'quakes-core', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as any;
        const geom = e.features[0].geometry as any;
        onSelectQuake({
          id: props.id,
          magnitude: props.magnitude,
          place: props.place,
          time: props.time,
          depth: props.depth,
          coordinates: geom.coordinates as [number, number],
          title: props.title,
          url: props.url,
        });
      });

      // 7. Sky Atmosphere
      if (QUALITY_PRESETS[quality].enableSky) {
        try {
          (map as any).setSky?.({
            'sky-color': '#0B1220',
            'sky-horizon-blend': 0.6,
            'horizon-color': '#1E293B',
            'horizon-fog-blend': 0.8,
            'fog-color': '#0B1220',
            'fog-ground-blend': 0.4,
          });
        } catch {
          // Ignore
        }
      }

      setMapReady(true);
      onMapLoaded?.();

      // Opening fly-in
      if (!hasHashLoc && !prefersReducedMotion && isIntroPlaying) {
        setTimeout(() => {
          map.flyTo({
            center: CAMERA_PRESETS.nepalDefault.center,
            zoom: CAMERA_PRESETS.nepalDefault.zoom,
            pitch: CAMERA_PRESETS.nepalDefault.pitch,
            bearing: CAMERA_PRESETS.nepalDefault.bearing,
            duration: 6000,
            essential: true,
          });
          map.once('moveend', () => {
            onIntroEnd();
          });
        }, 300);
      } else {
        onIntroEnd();
      }
    });

    // Elevation under crosshair
    map.on('move', () => {
      if (onAltitudeChange) {
        try {
          const elev = map.queryTerrainElevation(map.getCenter()) || 0;
          onAltitudeChange(Math.round(elev));
        } catch {
          // Ignore
        }
      }
    });

    // Sync camera to URL hash
    let hashTimer: number | null = null;
    map.on('moveend', () => {
      if (hashTimer) window.clearTimeout(hashTimer);
      hashTimer = window.setTimeout(() => {
        const c = map.getCenter();
        const z = map.getZoom().toFixed(2);
        const p = map.getPitch().toFixed(1);
        const b = map.getBearing().toFixed(1);
        window.history.replaceState(null, '', `#loc=${c.lng.toFixed(4)},${c.lat.toFixed(4)},${z},${p},${b}`);
      }, 500);
    });

    map.on('dragstart', () => {
      if (isIntroPlaying) {
        onIntroEnd();
      }
    });

    mapInstance.current = map;

    return () => {
      weatherMarkersRef.current.forEach((m) => m.remove());
      placesMarkersRef.current.forEach((m) => m.remove());
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Quakes GeoJSON Data
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    const source = map.getSource('quakes-source') as GeoJSONSource;
    if (source) {
      const geojsonFeatures = quakes.map((q) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: q.coordinates,
        },
        properties: {
          id: q.id,
          magnitude: q.magnitude,
          place: q.place,
          time: q.time,
          depth: q.depth,
          title: q.title,
          url: q.url,
          color: q.magnitude < 3.5 ? '#FBBF24' : q.magnitude < 4.5 ? '#FB923C' : q.magnitude < 5.5 ? '#F97316' : '#EF4444',
        },
      }));
      source.setData({
        type: 'FeatureCollection',
        features: geojsonFeatures,
      });
    }
  }, [quakes, mapReady]);

  // Update District Highlight Filter
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;
    if (map.getLayer('districts-highlight')) {
      map.setFilter('districts-highlight', ['==', ['get', 'id'], selectedDistrictId || -1]);
    }
  }, [selectedDistrictId, mapReady]);

  // Update Layer Visibilities
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    // Basemaps
    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', currentStyle === 'satellite' ? 'visible' : 'none');
    }
    if (map.getLayer('dark-layer')) {
      map.setLayoutProperty('dark-layer', 'visibility', currentStyle === 'dark' ? 'visible' : 'none');
    }
    if (map.getLayer('hillshade-layer')) {
      map.setPaintProperty('hillshade-layer', 'hillshade-exaggeration', currentStyle === 'terrain' ? 0.9 : 0.5);
    }

    // Districts
    if (map.getLayer('districts-fill')) {
      map.setLayoutProperty('districts-fill', 'visibility', activeLayers.districts ? 'visible' : 'none');
    }
    if (map.getLayer('districts-line')) {
      map.setLayoutProperty('districts-line', 'visibility', activeLayers.districts ? 'visible' : 'none');
    }
    if (map.getLayer('districts-highlight')) {
      map.setLayoutProperty('districts-highlight', 'visibility', activeLayers.districts ? 'visible' : 'none');
    }

    // Earthquakes
    if (map.getLayer('quakes-halo')) {
      map.setLayoutProperty('quakes-halo', 'visibility', activeLayers.earthquakes ? 'visible' : 'none');
    }
    if (map.getLayer('quakes-core')) {
      map.setLayoutProperty('quakes-core', 'visibility', activeLayers.earthquakes ? 'visible' : 'none');
    }
  }, [currentStyle, activeLayers, mapReady]);

  // Mount 3D Places Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    placesMarkersRef.current.forEach((m) => m.remove());
    placesMarkersRef.current = [];

    if (!activeLayers.places) return;

    (placesData as PlaceItem[]).forEach((place) => {
      const el = document.createElement('div');
      el.className = 'place-marker-pin cursor-pointer group flex flex-col items-center pointer-events-auto';
      el.innerHTML = `
        <div class="px-2 py-1 rounded-lg bg-navy-900/90 text-[11px] font-bold text-white border border-cyan-glow/40 shadow-glow-cyan flex items-center gap-1 group-hover:scale-110 group-hover:bg-cyan-glow group-hover:text-navy-950 transition-all backdrop-blur-md">
          <span>${place.category === 'mountain' ? '🏔️' : place.category === 'temple' ? '🛕' : place.category === 'stupa' ? '☸️' : '🏞️'}</span>
          <span class="truncate max-w-[100px]">${place.name_en}</span>
        </div>
        <div class="w-1.5 h-1.5 bg-cyan-glow rounded-full -mt-0.5 shadow-sm"></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPlace(place);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .addTo(map);

      placesMarkersRef.current.push(marker);
    });
  }, [activeLayers.places, mapReady, onSelectPlace]);

  // Mount 3D Weather Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    weatherMarkersRef.current.forEach((m) => m.remove());
    weatherMarkersRef.current = [];

    if (!activeLayers.weather) return;

    Object.values(weatherMetrics).forEach((metric) => {
      const el = document.createElement('div');
      el.className = 'weather-marker cursor-pointer group flex flex-col items-center pointer-events-auto';
      el.innerHTML = `
        <div class="px-2 py-0.5 rounded-full bg-navy-950/85 text-[10px] font-extrabold text-white border border-amber-400/40 shadow-md flex items-center gap-1 group-hover:scale-110 group-hover:border-amber-400 transition-all backdrop-blur-md">
          <span class="text-amber-300">${metric.station.isMountain ? '❄️' : '☀️'}</span>
          <span>${metric.temperature}°</span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectWeather(metric);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([metric.station.lon, metric.station.lat])
        .addTo(map);

      weatherMarkersRef.current.push(marker);
    });
  }, [activeLayers.weather, weatherMetrics, mapReady, onSelectWeather]);

  // Update Exaggeration and 2D/3D
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    if (is3D) {
      map.setTerrain({
        source: 'terrain-dem',
        exaggeration: exaggeration,
      });
      if (map.getPitch() < 10) {
        map.easeTo({ pitch: 65, duration: 800 });
      }
    } else {
      map.setTerrain(null);
      map.easeTo({ pitch: 0, duration: 800 });
    }
  }, [is3D, exaggeration, mapReady]);

  // Skip Intro
  const skipIntro = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.stop();
    map.flyTo({
      center: CAMERA_PRESETS.nepalDefault.center,
      zoom: CAMERA_PRESETS.nepalDefault.zoom,
      pitch: CAMERA_PRESETS.nepalDefault.pitch,
      bearing: CAMERA_PRESETS.nepalDefault.bearing,
      duration: 1200,
    });
    onIntroEnd();
  }, [onIntroEnd]);

  // Reset Camera View
  const resetView = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.flyTo({
      center: CAMERA_PRESETS.nepalDefault.center,
      zoom: CAMERA_PRESETS.nepalDefault.zoom,
      pitch: is3D ? CAMERA_PRESETS.nepalDefault.pitch : 0,
      bearing: 0,
      duration: 1500,
    });
  }, [is3D]);

  // Guided Tour sequence
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady || !isTouring) {
      if (tourTimeoutRef.current) {
        clearTimeout(tourTimeoutRef.current);
        tourTimeoutRef.current = null;
      }
      return;
    }

    const currentStop = GUIDED_TOUR_STOPS[currentTourStopIndex];
    if (!currentStop) {
      onTourEnd();
      return;
    }

    map.flyTo({
      center: currentStop.camera.center,
      zoom: currentStop.camera.zoom,
      pitch: currentStop.camera.pitch,
      bearing: currentStop.camera.bearing,
      duration: 4000,
      essential: true,
    });

    tourTimeoutRef.current = window.setTimeout(() => {
      if (currentTourStopIndex < GUIDED_TOUR_STOPS.length - 1) {
        onTourStopChange(currentTourStopIndex + 1);
      } else {
        onTourEnd();
      }
    }, currentStop.duration);

    return () => {
      if (tourTimeoutRef.current) clearTimeout(tourTimeoutRef.current);
    };
  }, [isTouring, currentTourStopIndex, mapReady]);

  // Global map methods helper
  useEffect(() => {
    (window as any).__terranep_map = {
      skipIntro,
      resetView,
      flyToLocation: (center: [number, number], zoom = 12, pitch = 60) => {
        mapInstance.current?.flyTo({ center, zoom, pitch, duration: 2000, essential: true });
      },
    };
  }, [skipIntro, resetView]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
