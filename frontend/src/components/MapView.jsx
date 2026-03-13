import Map, { Marker } from "react-map-gl";
import { useEffect, useState } from "react";

export default function MapView({ entries }) {

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: 144.9631,
        latitude: -37.8136,
        zoom: 12
      }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="mapbox://styles/mapbox/light-v10"
    >

      {entries.map((entry) => (
        <Marker
          key={entry.id}
          longitude={entry.longitude}
          latitude={entry.latitude}
        >
          <div className="bubble"></div>
        </Marker>
      ))}

    </Map>
  );
}