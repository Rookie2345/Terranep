import * as maplibregl from 'maplibre-gl';
import type { CustomLayerInterface, Map as MapLibreMap } from 'maplibre-gl';

/**
 * Three.js Custom Layer Foundation for MapLibre GL
 * 
 * Prepares the coordinate transformation pipeline to render 3D glTF models
 * (such as 3D temples, stupas, or monuments) directly anchored to Nepal's terrain elevation.
 */

export interface Model3DConfig {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  elevation: number; // in meters
  scale?: number;
  rotation?: [number, number, number]; // [x, y, z] in degrees
  modelUrl?: string; // glTF / GLB asset URL
}

export function createThreeJsTerrainLayer(
  layerId = 'three-temple-models',
  _models: Model3DConfig[] = []
): CustomLayerInterface {
  return {
    id: layerId,
    type: 'custom',
    renderingMode: '3d',

    onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext) {
      // MapLibre gives us the WebGL context
      // When adding Three.js (e.g. import * as THREE from 'three'):
      // this.camera = new THREE.Camera();
      // this.scene = new THREE.Scene();
      // this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
      // this.renderer.autoClear = false;
      console.log(`[ThreeCustomLayer] Ready on MapLibre map. Canvas size: ${map.getCanvas().width}x${map.getCanvas().height}, GL context:`, gl);
    },

    render(_gl: WebGLRenderingContext | WebGL2RenderingContext, options: any) {
      // Coordinate transform matrix projection:
      // MapLibre's projection matrix aligns Mercator coordinates with the camera view.
      // E.g.:
      // const modelCoord = maplibregl.MercatorCoordinate.fromLngLat([85.3487, 27.7105], 1330);
      // const scale = modelCoord.meterInMercatorCoordinateUnits();
      //
      // In Three.js:
      // const matrix = options.defaultProjectionData?.mainMatrix || options;
      // this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
      // this.renderer.resetState();
      // this.renderer.render(this.scene, this.camera);
      if (options) {
        // Ready for Three.js render cycle
      }
    },
  };
}

/**
 * Utility helper to convert GPS coordinate + elevation to MapLibre MercatorCoordinate
 */
export function getMercatorModelTransform(lng: number, lat: number, altitude = 0) {
  const coord = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], altitude);
  return {
    translateX: coord.x,
    translateY: coord.y,
    translateZ: coord.z,
    scale: coord.meterInMercatorCoordinateUnits(),
  };
}
