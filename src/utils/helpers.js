export const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
};

export const getCategoryColor = (category) => {
  if (category === 'critical') return 'text-red-400 bg-red-400/10 border-red-400/30';
  if (category === 'standard') return 'text-green-400 bg-green-400/10 border-green-400/30';
  return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
};

export const getStatusColor = (status) => {
  const map = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    accepted: 'text-blue-400 bg-blue-400/10',
    in_transit: 'text-orange-400 bg-orange-400/10',
    delivered: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
  };
  return map[status] || 'text-gray-400 bg-gray-400/10';
};

export const getStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

export const ROLES = [
  { id: 'restaurant', label: 'Restaurant / Event Hall', icon: '🍽️', desc: 'Donate surplus food from events or daily operations' },
  { id: 'ngo', label: 'NGO / Shelter', icon: '🏠', desc: 'Receive food donations for communities in need' },
  { id: 'volunteer', label: 'Volunteer', icon: '🚴', desc: 'Help deliver food from donors to recipients' },
];

/**
 * Decodes a Google Maps encoded polyline string.
 * @param {string} encoded - Encoded polyline string
 * @returns {Array<{lat: number, lng: number}>} Array of coordinates
 */
export const decodePolyline = (encoded) => {
  if (!encoded) return [];
  const points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ lat: lat / 1E5, lng: lng / 1E5 });
  }
  return points;
};
