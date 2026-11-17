import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  MAP_SOURCES, 
  CAMERA_PRESETS, 
  GUIDED_TOUR_STOPS, 
  QUALITY_PRESETS, 
  type QualityMode 
} from '../config/mapConfig';
import type { MapStyleMode } from './LayerSwitcher';

interface Map3DProps {
  currentStyle: MapStyleMode;
  exaggeration: number;
  quality: QualityMode;
  is3D: boolean;
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
  const [mapReady, setMapReady] = useState(false);
  const tourTimeoutRef = useRef<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Detect user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const initialCamera = prefersReducedMotion ? CAMERA_PRESETS.nepalDefault : CAMERA_PRESETS.southAsiaOrbit;

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
      center: initialCamera.center,
      zoom: initialCamera.zoom,
      pitch: initialCamera.pitch,
      bearing: initialCamera.bearing,
      maxPitch: QUALITY_PRESETS[quality].maxPitch,
      attributionControl: false,
      renderWorldCopies: false,
    });

    map.on('load', () => {
      // 1. Add AWS Terrarium DEM elevation source
      map.addSource('terrain-dem', {
        type: 'raster-dem',
        tiles: MAP_SOURCES.terrainDEM.tiles,
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15,
      });

      // Enable 3D terrain
      if (is3D) {
        map.setTerrain({
          source: 'terrain-dem',
          exaggeration: exaggeration,
        });
      }

      // 2. Add Hillshade Layer under imagery
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

      // 3. Add Satellite imagery source (Sentinel-2 + Esri fallback)
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

      // 4. Add Dark style source
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
        paint: {
          'raster-opacity': 0.9,
        },
      });

      // 5. Atmosphere Sky & Fog
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
          // Fallback if sky is not supported in current environment
        }
      }

      setMapReady(true);
      onMapLoaded?.();

      // Start cinematic fly-in if not reduced motion
      if (!prefersReducedMotion && isIntroPlaying) {
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

    // Track altitude / elevation under center
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

    // User interaction cancels intro
    map.on('dragstart', () => {
      if (isIntroPlaying) {
        onIntroEnd();
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Style Layer Visibility
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty(
        'satellite-layer',
        'visibility',
        currentStyle === 'satellite' ? 'visible' : 'none'
      );
    }

    if (map.getLayer('dark-layer')) {
      map.setLayoutProperty(
        'dark-layer',
        'visibility',
        currentStyle === 'dark' ? 'visible' : 'none'
      );
    }

    // In 'terrain' mode, both satellite and dark are hidden so the bare hillshade + contours pop
    if (map.getLayer('hillshade-layer')) {
      map.setPaintProperty(
        'hillshade-layer',
        'hillshade-exaggeration',
        currentStyle === 'terrain' ? 0.9 : 0.5
      );
    }
  }, [currentStyle, mapReady]);

  // Update Terrain Exaggeration & 2D/3D Mode
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

  // Skip Intro Handler
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

  // Guided Tour Sequence
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
      if (tourTimeoutRef.current) {
        clearTimeout(tourTimeoutRef.current);
      }
    };
  }, [isTouring, currentTourStopIndex, mapReady]);

  // Export methods via DOM or refs for outside triggers
  useEffect(() => {
    (window as any).__terranep_map = {
      skipIntro,
      resetView,
      flyToLocation: (center: [number, number], zoom = 12) => {
        mapInstance.current?.flyTo({ center, zoom, duration: 1800 });
      },
    };
  }, [skipIntro, resetView]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
