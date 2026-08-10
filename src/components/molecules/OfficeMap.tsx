"use client";

import { useMemo } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { SITE_CONFIG } from "@/utils/consts";
import "leaflet/dist/leaflet.css";

type Props = {
  className?: string;
  ariaLabel: string;
};

/** SITE_CONFIG.map.center is [lng, lat] (GeoJSON). Leaflet wants [lat, lng]. */
function toLatLng(center: [number, number]): [number, number] {
  const [lng, lat] = center;
  return [lat, lng];
}

function createBrandMarker() {
  return L.divIcon({
    className: "office-map__marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function OfficeMap({ className = "", ariaLabel }: Props) {
  const { center, zoom } = SITE_CONFIG.map;
  const position = useMemo(() => toLatLng(center), [center]);
  const icon = useMemo(() => createBrandMarker(), []);
  const openUrl = `https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=${zoom}/${position[0]}/${position[1]}`;

  return (
    <div
      data-map-frame
      className={`office-map ${className}`.trim()}
      role="region"
      aria-label={ariaLabel}
    >
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        className="office-map__canvas"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <Marker position={position} icon={icon} />
      </MapContainer>
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="office-map__open"
      >
        {ariaLabel}
      </a>
    </div>
  );
}
