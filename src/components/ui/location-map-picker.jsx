/* eslint-disable react/prop-types */

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    }
  });
  return null;
};

const MapUpdater = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
      map.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
};

const LocationMapPicker = ({ lat, lng, onChange, height = "200px", width = "100%" }) => {
  const mapRef = useRef(null);
  const defaultLat = lat !== undefined && lat !== null ? lat : -6.2088;
  const defaultLng = lng !== undefined && lng !== null ? lng : 106.8456;
  const [position, setPosition] = useState([defaultLat, defaultLng]);

  useEffect(() => {
    if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  useEffect(() => {
    const handleScroll = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    const newPos = marker.getLatLng();
    setPosition([newPos.lat, newPos.lng]);
    if (onChange) onChange(newPos.lat, newPos.lng);
  };

  const handleMapClick = (latlng) => {
    if (latlng && latlng.lat && latlng.lng) {
      setPosition([latlng.lat, latlng.lng]);
      if (onChange) onChange(latlng.lat, latlng.lng);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        Klik di peta atau seret marker untuk menentukan lokasi toko
      </div>
      <div
        className="border border-border rounded-lg overflow-hidden relative z-0"
        style={{ height, width }}>
        <style>{`
          .leaflet-pane { z-index: 1; }
          .leaflet-top, .leaflet-bottom { z-index: 2; }
        `}</style>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => {
            mapRef.current = map;
            setTimeout(() => map.invalidateSize(), 100);
          }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: handleMarkerDragEnd
            }}>
            <Popup>
              <div className="text-sm">
                <p>📍 Koordinat toko</p>
                <p>Lat: {position[0]?.toFixed(6) || "0.000000"}</p>
                <p>Lng: {position[1]?.toFixed(6) || "0.000000"}</p>
                <p className="text-xs text-muted-foreground mt-1">Seret untuk mengubah posisi</p>
              </div>
            </Popup>
          </Marker>
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapUpdater lat={lat} lng={lng} />
        </MapContainer>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Latitude:</span> {position[0]?.toFixed(6) || "0.000000"}
        </div>
        <div>
          <span className="font-medium">Longitude:</span> {position[1]?.toFixed(6) || "0.000000"}
        </div>
      </div>
    </div>
  );
};

export default LocationMapPicker;
