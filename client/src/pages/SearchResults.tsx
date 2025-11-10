import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, Star, Globe } from "lucide-react";
import type { SearchResult } from "@shared/types";

declare global {
  interface Window {
    maplibregl?: any;
  }
}

const MAPLIBRE_SCRIPT_ID = "maplibre-gl-script";
const MAPLIBRE_STYLE_ID = "maplibre-gl-style";
const MAPLIBRE_JS_URL = "https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.js";
const MAPLIBRE_CSS_URL = "https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.css";
const MAP_STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function loadStylesheet(href: string, id: string) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.id = id;
  document.head.appendChild(link);
}

function loadScript(src: string, id: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true" || window.maplibregl) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load script: ${src}`)),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.id = id;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => {
      reject(new Error(`Failed to load script: ${src}`));
    });

    document.head.appendChild(script);
  });
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPopupHtml(result: SearchResult): string {
  const name = result.name ? `<strong>${escapeHtml(result.name)}</strong>` : "";
  const address = result.address
    ? `<div class="mt-1">${escapeHtml(result.address)}</div>`
    : "";
  const rating = result.rating
    ? `<div class="mt-2">⭐ ${escapeHtml(result.rating)}${
        result.userRatingCount ? ` (${result.userRatingCount})` : ""
      }</div>`
    : "";
  const website = result.websiteUrl
    ? `<div class="mt-2"><a href="${encodeURI(result.websiteUrl)}" target="_blank" rel="noopener noreferrer">Visit website</a></div>`
    : "";

  return `<div class="text-sm">${name}${address}${rating}${website}</div>`;
}

function ResultsMap({ results }: { results: SearchResult[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const points = useMemo(() => {
    return results
      .map((result) => {
        const lat = parseFloat(result.latitude);
        const lng = parseFloat(result.longitude);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          return null;
        }

        return { lat, lng, result };
      })
      .filter((point): point is { lat: number; lng: number; result: SearchResult } => point !== null);
  }, [results]);

  const center = useMemo(() => {
    if (points.length === 0) {
      return { lat: 0, lng: 0 };
    }

    const total = points.reduce(
      (acc, point) => {
        acc.lat += point.lat;
        acc.lng += point.lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: total.lat / points.length,
      lng: total.lng / points.length,
    };
  }, [points]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapContainerRef.current) return;
    if (points.length === 0) return;

    let cancelled = false;

    const initializeMap = async () => {
      try {
        loadStylesheet(MAPLIBRE_CSS_URL, MAPLIBRE_STYLE_ID);
        await loadScript(MAPLIBRE_JS_URL, MAPLIBRE_SCRIPT_ID);

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const maplibregl = window.maplibregl;
        if (!maplibregl) {
          throw new Error("MapLibre failed to load");
        }

        if (!mapRef.current) {
          mapRef.current = new maplibregl.Map({
            container: mapContainerRef.current,
            style: MAP_STYLE_URL,
            center: [center.lng, center.lat],
            zoom: 13,
          });
          mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
        } else {
          mapRef.current.setCenter([center.lng, center.lat]);
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        const bounds = new maplibregl.LngLatBounds();

        points.forEach(({ lat, lng, result }) => {
          const marker = new maplibregl.Marker({ color: "#f97316" }).setLngLat([lng, lat]);

          if (result.name || result.address || result.rating) {
            marker.setPopup(
              new maplibregl.Popup({ offset: 12 }).setHTML(createPopupHtml(result))
            );
          }

          marker.addTo(mapRef.current);
          markersRef.current.push(marker);
          bounds.extend([lng, lat]);
        });

        if (markersRef.current.length > 1) {
          mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
        } else if (markersRef.current.length === 1) {
          mapRef.current.setZoom(14);
        }
      } catch (error) {
        console.error("Failed to initialise map", error);
      }
    };

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, [points, center]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div ref={mapContainerRef} className="h-[400px] w-full" />
    </div>
  );
}

export default function SearchResults() {
  useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/room/:id/results");
  const roomId = params?.id ? parseInt(params.id) : null;

  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "delivery" | "dineIn">("all");

  const searchResultsQuery = trpc.search.getSearchResults.useQuery(
    { roomId: roomId! },
    { enabled: !!roomId }
  );

  const filteredResultsQuery = trpc.search.filterByDelivery.useQuery(
    { roomId: roomId!, deliveryType: deliveryFilter },
    { enabled: !!roomId }
  );

  if (!match || !roomId) {
    return <div>Invalid room</div>;
  }

  if (searchResultsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const results = filteredResultsQuery.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
          </div>
          <Button
            onClick={() => setLocation(`/room/${roomId}`)}
            variant="outline"
            size="sm"
          >
            Back to Room
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {results.length > 0 && (
          <div className="mb-8 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Map Overview</h2>
              <p className="text-sm text-muted-foreground">
                Explore the restaurants found near your group.
              </p>
            </div>
            <ResultsMap results={results} />
          </div>
        )}

        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={deliveryFilter === "all" ? "default" : "outline"}
            onClick={() => setDeliveryFilter("all")}
            className={deliveryFilter === "all" ? "btn-pastel" : ""}
          >
            All Options
          </Button>
          <Button
            variant={deliveryFilter === "delivery" ? "default" : "outline"}
            onClick={() => setDeliveryFilter("delivery")}
            className={deliveryFilter === "delivery" ? "btn-pastel" : ""}
          >
            Delivery Only
          </Button>
          <Button
            variant={deliveryFilter === "dineIn" ? "default" : "outline"}
            onClick={() => setDeliveryFilter("dineIn")}
            className={deliveryFilter === "dineIn" ? "btn-pastel" : ""}
          >
            Dine-In Only
          </Button>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={result.id} className="card-pastel overflow-hidden hover:shadow-lg transition-shadow">
                {result.photoUrl && (
                  <div className="h-48 bg-muted overflow-hidden">
                    <img
                      src={result.photoUrl}
                      alt={result.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {result.name}
                  </h3>

                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      {result.address}
                    </p>
                  </div>

                  {result.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-foreground">
                        {result.rating}
                      </span>
                      {result.userRatingCount && (
                        <span className="text-sm text-muted-foreground">
                          ({result.userRatingCount})
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {result.hasDineIn === 1 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Dine-In
                      </span>
                    )}
                    {result.hasDelivery === 1 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Delivery
                      </span>
                    )}
                  </div>

                  {result.websiteUrl && (
                    <Button
                      onClick={() => {
                        if (result.websiteUrl) {
                          window.open(result.websiteUrl, "_blank");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-pastel p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Results Found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search radius or cravings
            </p>
            <Button
              onClick={() => setLocation(`/room/${roomId}`)}
              className="btn-pastel"
            >
              Back to Room
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
