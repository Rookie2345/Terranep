import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { HeaderHUD } from './components/HeaderHUD';
import { BottomDock } from './components/BottomDock';
import { AboutModal } from './components/AboutModal';
import { LayerSwitcher, type MapStyleMode, type ActiveLayersConfig } from './components/LayerSwitcher';
import { IntroOverlay } from './components/IntroOverlay';
import { DistrictSheet, type DistrictInfo } from './components/DistrictSheet';
import { PlaceDetailModal, type PlaceItem } from './components/PlaceDetailModal';
import { QuakeDetailModal } from './components/QuakeDetailModal';
import { WeatherModal } from './components/WeatherModal';
import { Map3D } from './components/Map3D';
import { type QualityMode, GUIDED_TOUR_STOPS } from './config/mapConfig';
import { 
  fetchNepalEarthquakes, 
  filterQuakesByTime, 
  type EarthquakeFeature, 
  type QuakeTimeFilter 
} from './services/earthquakeService';
import { 
  fetchAllStationsMetrics, 
  type StationLiveMetrics 
} from './services/weatherService';

const MainShell: React.FC = () => {
  const { language } = useTranslation();
  
  // Modals & Sheets
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [selectedQuake, setSelectedQuake] = useState<EarthquakeFeature | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);

  // Map settings
  const [currentStyle, setCurrentStyle] = useState<MapStyleMode>('satellite');
  const [exaggeration, setExaggeration] = useState<number>(1.3);
  const [quality, setQuality] = useState<QualityMode>('high');
  const [is3D, setIs3D] = useState(true);
  const [currentAltitude, setCurrentAltitude] = useState<number>(1400);

  // Live Layers Config
  const [activeLayers, setActiveLayers] = useState<ActiveLayersConfig>({
    earthquakes: true,
    weather: true,
    districts: true,
    places: true,
  });
  const [quakeFilter, setQuakeFilter] = useState<QuakeTimeFilter>('30d');

  // Live Data
  const [allQuakes, setAllQuakes] = useState<EarthquakeFeature[]>([]);
  const [weatherMetrics, setWeatherMetrics] = useState<Record<string, StationLiveMetrics>>({});

  // Intro & Tour states
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [isTouring, setIsTouring] = useState(false);
  const [currentTourStopIndex, setCurrentTourStopIndex] = useState(0);

  // Fetch Earthquakes
  useEffect(() => {
    const loadQuakes = async () => {
      const data = await fetchNepalEarthquakes(30);
      setAllQuakes(data);
    };
    loadQuakes();
    const interval = setInterval(loadQuakes, 5 * 60 * 1000); // 5m refresh
    return () => clearInterval(interval);
  }, []);

  // Fetch Weather & AQI
  useEffect(() => {
    const loadWeather = async () => {
      const metrics = await fetchAllStationsMetrics();
      setWeatherMetrics(metrics);
    };
    loadWeather();
    const interval = setInterval(loadWeather, 10 * 60 * 1000); // 10m refresh
    return () => clearInterval(interval);
  }, []);

  // Filtered quakes for map display
  const displayedQuakes = filterQuakesByTime(allQuakes, quakeFilter);

  // Dismiss splash screen once map loads
  const handleMapLoaded = useCallback(() => {
    if (typeof (window as any).dismissSplash === 'function') {
      (window as any).dismissSplash();
    }
  }, []);

  const handleSkipIntro = useCallback(() => {
    (window as any).__terranep_map?.skipIntro();
    setIsIntroPlaying(false);
  }, []);

  const handleResetView = useCallback(() => {
    (window as any).__terranep_map?.resetView();
    setSelectedDistrict(null);
    setSelectedQuake(null);
    setSelectedPlace(null);
  }, []);

  const handleStartTour = useCallback(() => {
    if (isTouring) {
      setIsTouring(false);
    } else {
      setIsIntroPlaying(false);
      setCurrentTourStopIndex(0);
      setIsTouring(true);
      setSelectedDistrict(null);
      setSelectedQuake(null);
      setSelectedPlace(null);
    }
  }, [isTouring]);

  const handleStopTour = useCallback(() => {
    setIsTouring(false);
  }, []);

  const handleToggleLayer = (key: keyof ActiveLayersConfig) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFlyTo = (center: [number, number], zoom = 12, pitch = 65) => {
    (window as any).__terranep_map?.flyToLocation(center, zoom, pitch);
  };

  const currentTourStop = GUIDED_TOUR_STOPS[currentTourStopIndex];
  const tourStopName = currentTourStop 
    ? (language === 'ne' ? currentTourStop.name_ne : currentTourStop.name_en)
    : undefined;

  // Find nearest weather station for selected district
  const districtWeather = selectedDistrict 
    ? Object.values(weatherMetrics)[selectedDistrict.id % Object.keys(weatherMetrics).length]
    : undefined;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-navy-950 select-none">
      {/* 3D Map Engine */}
      <Map3D 
        currentStyle={currentStyle}
        exaggeration={exaggeration}
        quality={quality}
        is3D={is3D}
        activeLayers={activeLayers}
        quakes={displayedQuakes}
        weatherMetrics={weatherMetrics}
        selectedDistrictId={selectedDistrict?.id || null}
        onSelectDistrict={setSelectedDistrict}
        onSelectQuake={setSelectedQuake}
        onSelectPlace={setSelectedPlace}
        onSelectWeather={() => setIsWeatherModalOpen(true)}
        onMapLoaded={handleMapLoaded}
        onAltitudeChange={setCurrentAltitude}
        isIntroPlaying={isIntroPlaying}
        onIntroEnd={() => setIsIntroPlaying(false)}
        isTouring={isTouring}
        onTourEnd={() => setIsTouring(false)}
        currentTourStopIndex={currentTourStopIndex}
        onTourStopChange={setCurrentTourStopIndex}
      />

      {/* Intro Skip & Active Tour Overlay */}
      <IntroOverlay 
        isIntroPlaying={isIntroPlaying}
        onSkipIntro={handleSkipIntro}
        isTouring={isTouring}
        tourStopName={tourStopName}
        onStopTour={handleStopTour}
      />

      {/* Top HUD Header */}
      <HeaderHUD 
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenWeather={() => setIsWeatherModalOpen(true)}
        quakeCount={displayedQuakes.length}
        currentAltitude={currentAltitude}
        onQuakePillClick={() => setIsLayersOpen(true)}
      />

      {/* Bottom Floating Control Dock */}
      <BottomDock 
        is3D={is3D}
        onToggle3D={() => setIs3D((prev) => !prev)}
        onResetView={handleResetView}
        onOpenLayers={() => setIsLayersOpen(true)}
        onStartTour={handleStartTour}
        onMyLocation={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                handleFlyTo([pos.coords.longitude, pos.coords.latitude], 12);
              },
              () => {},
              { enableHighAccuracy: true }
            );
          }
        }}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}
        isTouring={isTouring}
      />

      {/* Layer Switcher & Overlays Drawer */}
      <LayerSwitcher 
        isOpen={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
        currentStyle={currentStyle}
        onSelectStyle={setCurrentStyle}
        exaggeration={exaggeration}
        onChangeExaggeration={setExaggeration}
        quality={quality}
        onChangeQuality={setQuality}
        activeLayers={activeLayers}
        onToggleLayer={handleToggleLayer}
        quakeFilter={quakeFilter}
        onChangeQuakeFilter={setQuakeFilter}
      />

      {/* District Info Sheet */}
      <DistrictSheet 
        district={selectedDistrict}
        onClose={() => setSelectedDistrict(null)}
        weather={districtWeather}
        quakeCount={displayedQuakes.filter((q) => selectedDistrict && Math.abs(q.coordinates[0] - 84.5) < 1.5).length}
        onFlyTo={() => {
          if (selectedDistrict) {
            // Focus camera slightly closer
            handleFlyTo([84.1, 28.2], 9, 50);
          }
        }}
      />

      {/* Heritage Place Detail Modal */}
      <PlaceDetailModal 
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        onFlyTo={(p) => handleFlyTo([p.lon, p.lat], 13.5, 70)}
      />

      {/* Earthquake Detail Popup */}
      <QuakeDetailModal 
        quake={selectedQuake}
        onClose={() => setSelectedQuake(null)}
        onFlyTo={(coords) => handleFlyTo(coords, 10, 55)}
      />

      {/* Weather Stations Modal */}
      <WeatherModal 
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        stationsMetrics={weatherMetrics}
        onFlyToStation={(lat, lon) => handleFlyTo([lon, lat], 12, 60)}
      />

      {/* About & License Modal */}
      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <MainShell />
    </LanguageProvider>
  );
}

export default App;
