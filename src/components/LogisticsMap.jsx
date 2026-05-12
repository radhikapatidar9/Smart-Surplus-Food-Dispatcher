import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from '@react-google-maps/api';

import { useSocket } from '../context/SocketContext';
import { decodePolyline } from '../utils/helpers';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',

  styles: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#212121' }],
    },

    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },

    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },

    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#212121' }],
    },

    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: '#757575' }],
    },

    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#181818' }],
    },

    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: '#2c2c2c' }],
    },

    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8a8a8a' }],
    },

    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }],
    },
  ],
};

const LogisticsMap = ({
  donation,
  volunteerLocation:
    initialVolunteerLocation,
}) => {
  const { isLoaded } =
    useJsApiLoader({
      id: 'google-map-script',

      googleMapsApiKey:
        process.env
          .REACT_APP_GOOGLE_MAPS_API_KEY ||
        '',
    });

  const { socket } = useSocket();

  const [volunteerPos, setVolunteerPos] =
    useState(
      initialVolunteerLocation
    );

  const [map, setMap] =
    useState(null);

  const [
    polylinePath,
    setPolylinePath,
  ] = useState([]);

  // 1. Initialize Polyline from Donation Data
  useEffect(() => {
    if (
      donation?.delivery?.polyline
    ) {
      const decoded =
        decodePolyline(
          donation.delivery
            .polyline
        );

      setPolylinePath(decoded);
    }
  }, [donation]);

  // 2. Listen for Live Telemetry
  useEffect(() => {
    if (
      !socket ||
      !donation?._id
    )
      return;

    const handleLocationUpdate = (
      data
    ) => {
      // data: { userId, location: { coordinates: [lng, lat] }, timestamp }

      if (
        data.userId ===
        donation.volunteerId
      ) {
        setVolunteerPos({
          lat:
            data.location
              .coordinates[1],

          lng:
            data.location
              .coordinates[0],
        });
      }
    };

    socket.on(
      'delivery_location',
      handleLocationUpdate
    );

    return () =>
      socket.off(
        'delivery_location',
        handleLocationUpdate
      );
  }, [socket, donation]);

  const onLoad = useCallback(
    (map) => {
      setMap(map);

      // Fit bounds to markers
      if (donation) {
        const bounds =
          new window.google.maps.LatLngBounds();

        if (
          donation.pickupPoint
        ) {
          bounds.extend({
            lat: donation.lat,
            lng: donation.lng,
          });
        }

        if (volunteerPos) {
          bounds.extend(
            volunteerPos
          );
        }

        if (
          donation?.dropoffPoint
        ) {
          bounds.extend({
            lat:
              donation
                .dropoffPoint
                .coordinates[1],

            lng:
              donation
                .dropoffPoint
                .coordinates[0],
          });
        }

        map.fitBounds(bounds);

        // Better mobile padding
        map.fitBounds(bounds, {
          top: 60,
          right: 40,
          bottom: 60,
          left: 40,
        });
      }
    },
    [donation, volunteerPos]
  );

  if (!isLoaded)
    return (
      <div className="w-full min-h-[300px] h-full bg-neutral-900 animate-pulse rounded-2xl" />
    );

  return (
    <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={
          mapContainerStyle
        }
        center={
          volunteerPos || {
            lat:
              donation?.lat || 0,

            lng:
              donation?.lng || 0,
          }
        }
        zoom={14}
        options={mapOptions}
        onLoad={onLoad}
      >
        {/* Pickup Marker */}
        {donation?.pickupPoint && (
          <Marker
            position={{
              lat: donation.lat,
              lng: donation.lng,
            }}
            label="📦"
            title="Pickup Location"
          />
        )}

        {/* Dropoff Marker */}
        {donation?.dropoffPoint && (
          <Marker
            position={{
              lat:
                donation
                  .dropoffPoint
                  .coordinates[1],

              lng:
                donation
                  .dropoffPoint
                  .coordinates[0],
            }}
            label="🏠"
            title="NGO Destination"
          />
        )}

        {/* Volunteer Marker */}
        {volunteerPos && (
          <Marker
            position={volunteerPos}
            icon={{
              path: window.google
                .maps.SymbolPath
                .CIRCLE,

              fillColor:
                '#22c55e',

              fillOpacity: 1,

              strokeColor: '#000',

              strokeWeight: 2,

              scale: 8,
            }}
            label="🚴"
            title="Volunteer Live Location"
          />
        )}

        {/* Polyline Route */}
        {polylinePath.length >
          0 && (
          <Polyline
            path={polylinePath}
            options={{
              strokeColor:
                '#22c55e',

              strokeOpacity: 0.8,

              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default LogisticsMap;
