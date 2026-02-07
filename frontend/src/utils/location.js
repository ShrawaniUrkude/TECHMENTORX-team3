// Get user's current location using browser Geolocation API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained:', position.coords);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your device location settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred getting location.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 10000, // Increased timeout
        maximumAge: 60000 // Accept cached location up to 1 minute old
      }
    );
  });
};

// Reverse geocode using OpenStreetMap Nominatim (free API)
export const reverseGeocode = async (latitude, longitude) => {
  try {
    console.log('Reverse geocoding:', latitude, longitude);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'SocialMentor/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    console.log('Geocoding response:', data);
    
    return {
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown',
      pincode: data.address?.postcode || '000000',
      state: data.address?.state || '',
      country: data.address?.country || '',
      fullAddress: data.display_name || ''
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    // Return default values instead of throwing
    return {
      city: 'Location Detected',
      pincode: '000000',
      state: '',
      country: '',
      fullAddress: `${latitude}, ${longitude}`
    };
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toFixed(2);
};

// Get location details (coordinates + address)
export const getLocationDetails = async () => {
  try {
    const coords = await getCurrentLocation();
    const address = await reverseGeocode(coords.latitude, coords.longitude);
    
    return {
      ...coords,
      ...address
    };
  } catch (error) {
    console.error('Failed to get location details:', error);
    throw error;
  }
};
