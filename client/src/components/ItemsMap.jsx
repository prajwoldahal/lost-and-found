import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Component to handle map center changes
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

// Fix for default Leaflet markers not showing
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing blue icon for user location
const UserLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-25"></div>
            <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});


export default function ItemsMap({ items, center = [27.7172, 85.3240], userLocation }) {
    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={userLocation ? [userLocation.lat, userLocation.lng] : null} />
                <MarkerClusterGroup>
                    {items.map((item) => (
                        item.location && (
                            <Marker key={item.id} position={[item.location.lat, item.location.lng]}>
                                <Popup>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="font-bold">{item.title}</h3>
                                        <p className="text-sm">{item.description?.substring(0, 50)}...</p>
                                        <span className={`text-xs font-bold px-2 py-1 rounded text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                                            {item.type.toUpperCase()}
                                        </span>
                                        <Link to={`/post/${item.id}`} className="text-primary text-sm underline">View Details</Link>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MarkerClusterGroup>
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={UserLocationIcon}>
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold text-blue-600">📍 Your Location</h3>
                                <p className="text-sm text-gray-600">You are here</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
