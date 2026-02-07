import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { getCurrentLocation } from '../utils/location';
import { volunteerAPI } from '../services/api';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const volunteerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#3B82F6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#10B981" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Component to update map center
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const LiveTracking = ({ donationId, pickupLocation, isVolunteer = false }) => {
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const defaultCenter = pickupLocation 
    ? [pickupLocation.latitude, pickupLocation.longitude]
    : [20.5937, 78.9629]; // India center as fallback

  useEffect(() => {
    if (isVolunteer && isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isTracking, isVolunteer]);

  const startTracking = () => {
    // Update location immediately
    updateLocation();
    
    // Then update every 10 seconds
    intervalRef.current = setInterval(() => {
      updateLocation();
    }, 10000);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setVolunteerLocation({
        latitude: location.latitude,
        longitude: location.longitude
      });
      setLastUpdate(new Date());

      // Send location to backend
      if (donationId) {
        await volunteerAPI.updateLocation(donationId, location.latitude, location.longitude);
      }
    } catch (err) {
      setError('Failed to get location. Please enable location access.');
      console.error('Location error:', err);
    }
  };

  const handleToggleTracking = () => {
    setIsTracking(!isTracking);
    setError('');
  };

  const mapCenter = volunteerLocation 
    ? [volunteerLocation.latitude, volunteerLocation.longitude]
    : defaultCenter;

  return (
    <div className="space-y-4">
      {/* Controls (only for volunteers) */}
      {isVolunteer && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
              {lastUpdate && (
                <p className="text-sm text-gray-500">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={handleToggleTracking}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isTracking
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          {isTracking && (
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <svg className="animate-pulse w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              Live tracking active
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Pickup Location Marker */}
          {pickupLocation && (
            <Marker
              position={[pickupLocation.latitude, pickupLocation.longitude]}
              icon={pickupIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Pickup Location</strong>
                  <br />
                  Donation pickup point
                </div>
              </Popup>
            </Marker>
          )}

          {/* Volunteer Location Marker */}
          {volunteerLocation && (
            <Marker
              position={[volunteerLocation.latitude, volunteerLocation.longitude]}
              icon={volunteerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Volunteer Location</strong>
                  <br />
                  Current position
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {pickupLocation && volunteerLocation && (
            <Polyline
              positions={[
                [volunteerLocation.latitude, volunteerLocation.longitude],
                [pickupLocation.latitude, pickupLocation.longitude]
              ]}
              color="#3B82F6"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white p-3 rounded-lg shadow">
        <div className="flex items-center justify-around text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Pickup Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Volunteer Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
