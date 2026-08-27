import { useState } from "react";
import { MapView } from "@/components/Map";

type RouteLabels = { loading: string; unavailable: string; action: string; routeShown: string; routeUnavailable: string; propertyUnavailable: string; destinationUnavailable: string };

export default function HotelMapRoute({ hotelName, mapAddress, nearbySites, labels }: { hotelName: string; mapAddress: string; nearbySites: Array<{ name: string; address: string }>; labels: RouteLabels }) {
  const [status, setStatus] = useState(labels.loading);
  const [mapReady, setMapReady] = useState(false);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const destinationSite = nearbySites[0] ?? { name: "Al-Masjid an-Nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" };
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(mapAddress)}&destination=${encodeURIComponent(destinationSite.address)}&travelmode=walking`;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#173e35]/10 bg-white">
      <div className="relative h-[390px] bg-[#f4f0e6]">
        <MapView
          className="h-[390px] w-full"
          initialCenter={{ lat: 24.4686, lng: 39.6142 }}
          initialZoom={15}
          onMapError={() => {
            setMapUnavailable(true);
            setStatus(labels.unavailable);
          }}
          onMapReady={map => {
          setMapReady(true);
          const geocoder = new google.maps.Geocoder();
          const routeToDestination = (origin: google.maps.LatLng) => {
            geocoder.geocode({ address: destinationSite.address }, (destinationResults, destinationStatus) => {
              const destination = destinationResults?.[0]?.geometry.location;
              if (destinationStatus !== "OK" || !destination) {
                setStatus(labels.destinationUnavailable);
                return;
              }
              const renderer = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: false,
                polylineOptions: { strokeColor: "#a9853d", strokeWeight: 5 },
              });
              const service = new google.maps.DirectionsService();
              service.route({ origin, destination, travelMode: google.maps.TravelMode.WALKING }, (route, routeStatus) => {
                if (routeStatus === "OK" && route) {
                  renderer.setDirections(route);
                  const leg = route.routes[0]?.legs[0];
                  setStatus(leg?.distance?.text && leg?.duration?.text ? `${leg.distance.text} · ${leg.duration.text}` : labels.routeShown);
                } else {
                  new google.maps.Marker({ map, position: origin, title: hotelName });
                  new google.maps.Marker({ map, position: destination, title: destinationSite.name });
                  setStatus(labels.routeUnavailable);
                }
              });
            });
          };
          geocoder.geocode({ address: mapAddress }, (propertyResults, propertyStatus) => {
            const origin = propertyResults?.[0]?.geometry.location;
            if (propertyStatus !== "OK" || !origin) {
              setStatus(labels.propertyUnavailable);
              return;
            }
            map.setCenter(origin);
            new google.maps.Marker({ map, position: origin, title: hotelName });
            nearbySites.forEach(site => geocoder.geocode({ address: site.address }, (results, markerStatus) => {
              const position = results?.[0]?.geometry.location;
              if (markerStatus === "OK" && position) new google.maps.Marker({ map, position, title: site.name, label: { text: "•", color: "#ffffff" } });
            }));
            routeToDestination(origin);
          });
          }}
        />
        {!mapReady && <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(223,194,127,.28),transparent_48%),linear-gradient(135deg,#f8f5ed,#eef2eb)] p-6 text-center"><div className="max-w-sm"><p className="font-serif text-2xl text-[#173e35]">{mapUnavailable ? labels.unavailable : labels.loading}</p><a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-[#173e35] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-white transition hover:bg-[#285b4e]">{labels.action}</a></div></div>}
      </div>
      {!mapUnavailable && <p className="border-t border-[#173e35]/10 bg-[#f4f0e6] px-5 py-3 text-xs font-semibold text-[#48675e]">{status}</p>}
    </div>
  );
}
