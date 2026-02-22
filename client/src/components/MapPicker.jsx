import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Crosshair } from 'lucide-react';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
    const markerRef = useRef(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [setPosition],
    );

    return position === null ? null : (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

// Component to handle map center changes
function MapController({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function MapPicker({ location, onLocationSelect }) {
    const [center, setCenter] = useState({ lat: 27.7172, lng: 85.3240 }); // Default: Kathmandu
    const [loadingLocation, setLoadingLocation] = useState(false);

    const handleLocateMe = (e) => {
        e.preventDefault(); // Prevent form submission if inside a form
        setLoadingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(newLocation);
                    onLocationSelect(newLocation);
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not get your location. Please check browser permissions.");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setLoadingLocation(false);
        }
    };

    return (
        <div className="relative" style={{ height: '300px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={location} setPosition={onLocationSelect} />
                <MapController center={location || center} />
            </MapContainer>

            <button
                onClick={handleLocateMe}
                disabled={loadingLocation}
                className="absolute top-4 right-4 z-[400] bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
                title="Locate Me"
                type="button"
            >
                <Crosshair className={`h-6 w-6 ${loadingLocation ? 'animate-spin text-primary' : ''}`} />
            </button>
        </div>
    );
}
