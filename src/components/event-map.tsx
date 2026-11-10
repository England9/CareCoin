"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

export type MapEvent = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  city: string;
  isSponsored: boolean;
  sdg: number;
};

function MapInner({
  events,
  center,
  onSelect,
}: {
  events: MapEvent[];
  center: LatLngExpression;
  onSelect?: (id: string) => void;
}) {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [Comp, setComp] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const leaflet = await import("leaflet");
      const rl = await import("react-leaflet");
      // Fix default marker icons in bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      if (mounted) {
        setL(leaflet);
        setComp({
          MapContainer: rl.MapContainer,
          TileLayer: rl.TileLayer,
          Marker: rl.Marker,
          Popup: rl.Popup,
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!Comp || !L) {
    return (
      <div className="grid h-[320px] place-items-center rounded-2xl bg-teal-100/60 text-sm text-teal-800">
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = Comp;

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="h-[320px] w-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events.map((e) => (
        <Marker key={e.id} position={[e.lat, e.lng]}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{e.title}</p>
              <p className="text-xs text-slate-600">
                {e.city} · SDG {e.sdg}
                {e.isSponsored ? " · Sponsored" : ""}
              </p>
              {onSelect ? (
                <button
                  className="text-xs font-semibold text-teal-700 underline"
                  onClick={() => onSelect(e.id)}
                >
                  View event
                </button>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export const EventMap = dynamic(() => Promise.resolve(MapInner), { ssr: false });
