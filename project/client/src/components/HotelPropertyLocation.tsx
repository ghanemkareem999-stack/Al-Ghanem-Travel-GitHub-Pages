import { MapView } from "@/components/Map";
import { useState } from "react";

type LocationLabels = {
  loading: string;
  unavailable: string;
  action: string;
};

export default function HotelPropertyLocation({
  hotelName,
  mapAddress,
  locationUrl,
  labels,
}: {
  hotelName: string;
  mapAddress: string;
  locationUrl?: string;
  labels: LocationLabels;
}) {
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const mapsUrl = locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#173e35]/10 bg-white">
      <div className="relative h-[340px] bg-[#f4f0e6]">
        {unavailable ? (
          <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(223,194,127,.34),transparent_52%),linear-gradient(135deg,#f8f5ed,#eef2eb)] p-6 text-center" role="status" aria-live="polite">
            <div className="max-w-md rounded-[1.25rem] border border-[#173e35]/10 bg-white/85 px-7 py-6 shadow-[0_20px_60px_rgba(23,62,53,.08)]">
              <p className="font-serif text-2xl text-[#173e35]">{hotelName}</p>
              <p className="mt-3 text-sm leading-6 text-[#48675e]">{mapAddress}</p>
              <p className="mt-4 text-xs leading-5 text-[#607771]">{labels.unavailable}</p>
            </div>
          </div>
        ) : (
          <MapView
            className="h-[340px] w-full"
            initialCenter={{ lat: 24.4686, lng: 39.6142 }}
            initialZoom={15}
            onMapError={() => setUnavailable(true)}
            onMapReady={map => {
              setReady(true);
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ address: mapAddress }, (results, status) => {
                const location = results?.[0]?.geometry.location;
                if (status !== "OK" || !location) {
                  setUnavailable(true);
                  return;
                }
                map.setCenter(location);
                new google.maps.Marker({ map, position: location, title: hotelName });
              });
            }}
          />
        )}

        {!ready && !unavailable && (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(223,194,127,.28),transparent_48%),linear-gradient(135deg,#f8f5ed,#eef2eb)] p-6 text-center">
            <div className="max-w-sm">
              <p className="font-serif text-2xl text-[#173e35]">{labels.loading}</p>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-[#173e35]/10 bg-[#f8f5ed] px-5 py-4">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#173e35] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-white transition hover:bg-[#285b4e]">
          {labels.action}
        </a>
      </div>
    </div>
  );
}
