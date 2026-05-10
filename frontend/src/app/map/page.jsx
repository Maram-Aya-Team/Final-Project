"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { getMapCities, getMapItems } from "../../services/mapService";

const GOOGLE_MAPS_SRC = "https://maps.googleapis.com/maps/api/js";
const AMMAN_CENTER = { lat: 31.9539, lng: 35.9106 };

const loadGoogleMaps = (apiKey) =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve(null);
    if (window.google?.maps) return resolve(window.google.maps);

    const existing = document.querySelector("script[data-google-maps='true']");

    if (existing) {
      existing.addEventListener("load", () => resolve(window.google?.maps));
      existing.addEventListener("error", () => reject(new Error("تعذر تحميل الخريطة")));
      return;
    }

    const script = document.createElement("script");
    script.src = `${GOOGLE_MAPS_SRC}?key=${apiKey}&language=ar`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.onload = () => resolve(window.google?.maps);
    script.onerror = () => reject(new Error("تعذر تحميل الخريطة"));
    document.body.appendChild(script);
  });

export default function MapPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [cities, setCities] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: "all", city: "", radius: "50" });
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  const cityLookup = useMemo(() => {
    const map = {};
    cities.forEach((city) => {
      map[city.name] = city;
    });
    return map;
  }, [cities]);

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    clearMarkers();

    items.forEach((item) => {
      const coordinates = item?.location?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return;

      const lat = Number(coordinates[1]);
      const lng = Number(coordinates[0]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const marker = new window.google.maps.Marker({
        map: mapRef.current,
        position: { lat, lng },
        title: item.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillOpacity: 1,
          fillColor: item.type === "lost" ? "#DC2626" : "#22C55E",
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style=\"font-family:Cairo,sans-serif;min-width:180px\"><strong>${item.title}</strong><br/>${item.city || ""} - ${item.area || ""}</div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open({ anchor: marker, map: mapRef.current });
      });

      markersRef.current.push(marker);
    });
  }, [items]);

  useEffect(() => {
    let active = true;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      Promise.resolve().then(() => {
        if (active) setError("مفتاح Google Maps غير مضاف في إعدادات البيئة");
      });
      return () => {
        active = false;
      };
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!active || !mapContainerRef.current || mapRef.current) return;
        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center: AMMAN_CENTER,
          zoom: 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setMapReady(true);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "تعذر تهيئة الخريطة");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      getMapCities(),
      getMapItems({ type: filters.type, city: filters.city, radius: filters.radius }),
    ])
      .then(([citiesResponse, itemsResponse]) => {
        if (!active) return;
        setCities(citiesResponse || []);
        setItems(itemsResponse?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "تعذر تحميل بيانات الخريطة");
        setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters.city, filters.radius, filters.type, refreshIndex]);

  useEffect(() => {
    if (!mapReady) return;
    renderMarkers();
  }, [mapReady, renderMarkers]);

  useEffect(() => {
    if (!mapReady || !filters.city || !cityLookup[filters.city]) return;

    const city = cityLookup[filters.city];
    mapRef.current.panTo({ lat: city.lat, lng: city.lng });
    mapRef.current.setZoom(11);
  }, [cityLookup, filters.city, mapReady]);

  const updateFilter = (key, value) => {
    setLoading(true);
    setError("");
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    setRefreshIndex((prev) => prev + 1);
  };

  return (
    <MainLayout>
      <section className="pageHeader split">
        <div>
          <h1>الخريطة</h1>
          <p>عرض المنشورات على خريطة الأردن حسب النوع والمدينة.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          تحديث
        </Button>
      </section>

      {error && <div className="stateError">{error}</div>}

      <section className="mapLayout">
        <aside className="mapSidebar card">
          <h3>الفلاتر</h3>

          <Select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            options={[
              { label: "الكل", value: "all" },
              { label: "مفقود", value: "lost" },
              { label: "موجود", value: "found" },
            ]}
          />

          <Select
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
            options={[
              { label: "كل المدن", value: "" },
              ...cities.map((city) => ({ label: city.name, value: city.name })),
            ]}
          />

          <Select
            value={filters.radius}
            onChange={(e) => updateFilter("radius", e.target.value)}
            options={[
              { label: "10 كم", value: "10" },
              { label: "25 كم", value: "25" },
              { label: "50 كم", value: "50" },
              { label: "100 كم", value: "100" },
            ]}
          />

          <div className="mapStats">
            <span>إجمالي النتائج: {loading ? "..." : items.length}</span>
          </div>

          <div className="mapLegend">
            <Badge variant="danger">مفقود</Badge>
            <Badge variant="success">موجود</Badge>
          </div>

          <div className="mapItemsList">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeletonLine" />)
            ) : items.length === 0 ? (
              <div className="stateEmpty">لا توجد عناصر مطابقة</div>
            ) : (
              items.slice(0, 12).map((item) => (
                <div key={item._id} className="mapItemRow">
                  <strong>{item.title}</strong>
                  <span>
                    {item.city} - {item.area}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="mapCanvas card">
          <div ref={mapContainerRef} className="googleMapRoot" />
        </div>
      </section>
    </MainLayout>
  );
}
