import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MapUpdater from './MapUpdater';

// Remove default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Define a custom icon for the supplier
const supplierIcon = new L.Icon({
    iconUrl: '/img/supplier_3321752.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Define a default icon for the city
const cityIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const MapComponent = ({ markers = [], zoom = 2, selectedCity, selectedSupplier, selectedArticle, center }) => {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "80vh", width: "100%", marginTop: "20px" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater selectedCity={selectedCity} selectedSupplier={selectedSupplier} selectedArticle={selectedArticle} zoom={11} />
            <MarkerClusterGroup>
                {markers.map((marker) => {
                    const { id, lat, lng, type, title, details, url, radius } = marker;

                    return type === 'article' ? (
                        <Circle
                            key={id}
                            center={[lat, lng]}
                            radius={radius || 1000}
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
                        >
                            <Popup>
                                <div>
                                    <h3>{title}</h3>
                                    <p>{details}</p>
                                    {url && <a href={url} target="_blank" rel="noopener noreferrer">Read more</a>}
                                </div>
                            </Popup>
                        </Circle>
                    ) : type === 'supplier' ? (
                        <Marker
                            key={id}
                            position={[lat, lng]}
                            icon={supplierIcon}
                        >
                            <Popup>
                                <div>
                                    <h3>{title}</h3>
                                    <p>{details}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ) : type === 'city' ? (
                        <Marker
                            key={id}
                            position={[lat, lng]}
                            icon={cityIcon}
                        >
                            <Popup>
                                <div>
                                    <h3>{title}</h3>
                                    <p>{details}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null;
                })}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export default MapComponent;
