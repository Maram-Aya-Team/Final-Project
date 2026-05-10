"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { getMapCities, getMapItems } from "../../services/mapService";

const AMMAN_CENTER = { lat: 31.9539, lng: 35.9106 };

const createPopupNode = (item) => {
  const wrapper = document.createElement("div");
  wrapper.style.fontFamily = "Cairo, sans-serif";
  wrapper.style.minWidth = "180px";

  const title = document.createElement("strong");
  title.textContent = item?.title || "بدون عنوان";
  wrapper.appendChild(title);

  const details = document.createElement("div");
  details.textContent = `${item?.city || ""} - ${item?.area || ""}`;
  wrapper.appendChild(details);

  return wrapper;
};

export default function MapPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const leafletRef = useRef(null);

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
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !leafletRef.current) return;

    clearMarkers();
    const L = leafletRef.current;

    items.forEach((item) => {
      const coordinates = item?.location?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return;

      const lat = Number(coordinates[1]);
      const lng = Number(coordinates[0]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const markerElement = document.createElement("div");
      markerElement.style.width = "14px";
      markerElement.style.height = "14px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor = item.type === "lost" ? "#DC2626" : "#22C55E";
      markerElement.style.border = "2px solid #ffffff";
      markerElement.style.boxShadow = "0 0 0 1px rgba(15,23,42,0.12)";

      const popupContent = createPopupNode(item);
      const popup = L.popup({ offset: [0, -12] }).setContent(popupContent);

      const icon = L.divIcon({
        className: "mapMarkerIcon",
        html: markerElement.outerHTML,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([lat, lng], { icon }).bindPopup(popup).addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [items]);

  useEffect(() => {
    let active = true;

    if (!mapContainerRef.current || mapRef.current) return undefined;

    import("leaflet")
      .then((leafletModule) => {
        if (!active) return;
        const L = leafletModule.default || leafletModule;
        leafletRef.current = L;

        mapRef.current = L.map(mapContainerRef.current, {
          center: [AMMAN_CENTER.lat, AMMAN_CENTER.lng],
          zoom: 8,
          zoomControl: true,
        });

        const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        });
        tiles.addTo(mapRef.current);

        tiles.on("load", () => {
          if (!active) return;
          setMapReady(true);
        });

        tiles.on("tileerror", () => {
          if (!active) return;
          setError("تعذر تهيئة الخريطة");
        });
      })
      .catch(() => {
        if (!active) return;
        setError("تعذر تحميل مكتبة الخريطة");
      });

    return () => {
      active = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      leafletRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
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
    mapRef.current.flyTo([city.lat, city.lng], 11, { duration: 1.2 });
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
          <div ref={mapContainerRef} className="mapRoot" />
        </div>
      </section>
    </MainLayout>
  );
}
