"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import { getMapCities, getMapItems } from "../../services/mapService";

import {
  RefreshCw,
  AlertTriangle,
  MapPinned,
  Search,
  Filter,
  MapPin,
} from "lucide-react";

const AMMAN_CENTER = { lat: 31.9539, lng: 35.9106 };

const createPopupNode = (item) => {
  const wrapper = document.createElement("div");

  wrapper.style.cssText = `
    font-family: Cairo, sans-serif;
    min-width: 180px;
    direction: rtl;
    padding: 2px 0;
  `;

  const badge = document.createElement("span");

  badge.textContent =
    item.type === "lost" ? "مفقود" : "موجود";

  badge.style.cssText = `
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: ${
      item.type === "lost" ? "#fee2e2" : "#dcfce7"
    };
    color: ${
      item.type === "lost" ? "#dc2626" : "#16a34a"
    };
    margin-bottom: 6px;
  `;

  wrapper.appendChild(badge);

  const title = document.createElement("div");

  title.textContent = item?.title || "بدون عنوان";

  title.style.cssText = `
    font-weight: 800;
    font-size: 14px;
    color: #152b5b;
    margin-bottom: 4px;
  `;

  wrapper.appendChild(title);

  const loc = document.createElement("div");

  loc.textContent = `${item?.city || ""} ${
    item?.area ? `- ${item.area}` : ""
  }`;

  loc.style.cssText = `
    font-size: 12px;
    color: #64748b;
  `;

  wrapper.appendChild(loc);

  return wrapper;
};

export default function MapPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const leafletRef = useRef(null);

  const [cities, setCities] = useState([]);
  const [items, setItems] = useState([]);

  const [filters, setFilters] = useState({
    type: "all",
    city: "",
    radius: "50",
  });

  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  const cityLookup = useMemo(() => {
    const map = {};

    cities.forEach((c) => {
      map[c.name] = c;
    });

    return map;
  }, [cities]);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !leafletRef.current) return;

    clearMarkers();

    const L = leafletRef.current;

    items.forEach((item) => {
      const coords = item?.location?.coordinates;

      if (!Array.isArray(coords) || coords.length < 2)
        return;

      const lat = Number(coords[1]);
      const lng = Number(coords[0]);

      if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return;

      const el = document.createElement("div");

      el.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${
          item.type === "lost" ? "#dc2626" : "#22c55e"
        };
        border: 2.5px solid white;
        box-shadow:
          0 0 0 1.5px ${
            item.type === "lost"
              ? "#dc262666"
              : "#22c55e66"
          },
          0 2px 6px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: transform 0.15s;
      `;

      const icon = L.divIcon({
        className: "mapMarkerIcon",
        html: el.outerHTML,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const popup = L.popup({
        offset: [0, -10],
        closeButton: false,
        className: "foundit-popup",
      }).setContent(createPopupNode(item));

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(popup)
        .addTo(mapRef.current);

      marker.on("click", () => {
        setSelectedItem(item);
      });

      markersRef.current.push(marker);
    });
  }, [items]);

  useEffect(() => {
    let active = true;

    if (!mapContainerRef.current || mapRef.current)
      return undefined;

    import("leaflet")
      .then((mod) => {
        if (!active) return;

        const L = mod.default || mod;

        leafletRef.current = L;

        mapRef.current = L.map(mapContainerRef.current, {
          center: [AMMAN_CENTER.lat, AMMAN_CENTER.lng],
          zoom: 8,
          zoomControl: true,
          attributionControl: false,
        });

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
          }
        ).addTo(mapRef.current);

        L.control
          .attribution({ prefix: false })
          .addAttribution("© OpenStreetMap")
          .addTo(mapRef.current);

        setMapReady(true);
      })
      .catch(() => {
        if (active)
          setError("تعذر تحميل مكتبة الخريطة");
      });

    return () => {
      active = false;

      markersRef.current.forEach((m) => m.remove());

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
      getMapItems({
        type: filters.type,
        city: filters.city,
        radius: filters.radius,
      }),
    ])
      .then(([citiesRes, itemsRes]) => {
        if (!active) return;

        setCities(citiesRes || []);
        setItems(itemsRes?.items || []);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err.message || "تعذر تحميل بيانات الخريطة"
        );

        setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    filters.city,
    filters.radius,
    filters.type,
    refreshIndex,
  ]);

  useEffect(() => {
    if (!mapReady) return;

    renderMarkers();
  }, [mapReady, renderMarkers]);

  useEffect(() => {
    if (
      !mapReady ||
      !filters.city ||
      !cityLookup[filters.city]
    )
      return;

    const city = cityLookup[filters.city];

    mapRef.current.flyTo(
      [city.lat, city.lng],
      11,
      { duration: 1.2 }
    );
  }, [cityLookup, filters.city, mapReady]);

  const updateFilter = (key, value) => {
    setLoading(true);
    setError("");

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const lostCount = items.filter(
    (i) => i.type === "lost"
  ).length;

  const foundCount = items.filter(
    (i) => i.type === "found"
  ).length;

  return (
    <MainLayout>
      {/* Header */}
      <div className="pageHeader">
        <div>
          <h1>الخريطة</h1>
          <p>
            تصفح المنشورات على خريطة الأردن حسب
            المنطقة والنوع.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setLoading(true);
            setError("");
            setRefreshIndex((p) => p + 1);
          }}
        >
          <RefreshCw size={16} />
          تحديث
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="stateError">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="mapLayout">
        {/* Sidebar */}
        <div className="mapSidebar">
          {/* Filters */}
          <div className="mapSidebarCard">
            <h3>الفلاتر</h3>

            <div className="mapFilters">
              <div className="inputGroup">
                <label className="inputLabel">
                  <Filter size={14} />
                  النوع
                </label>

                <select
                  className="selectField"
                  value={filters.type}
                  onChange={(e) =>
                    updateFilter(
                      "type",
                      e.target.value
                    )
                  }
                >
                  <option value="all">الكل</option>
                  <option value="lost">مفقود</option>
                  <option value="found">موجود</option>
                </select>
              </div>

              <div className="inputGroup">
                <label className="inputLabel">
                  <MapPin size={14} />
                  المدينة
                </label>

                <select
                  className="selectField"
                  value={filters.city}
                  onChange={(e) =>
                    updateFilter(
                      "city",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    كل المدن
                  </option>

                  {cities.map((c) => (
                    <option
                      key={c.name}
                      value={c.name}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inputGroup">
                <label className="inputLabel">
                  <Search size={14} />
                  نطاق البحث
                </label>

                <select
                  className="selectField"
                  value={filters.radius}
                  onChange={(e) =>
                    updateFilter(
                      "radius",
                      e.target.value
                    )
                  }
                >
                  <option value="10">
                    10 كم
                  </option>

                  <option value="25">
                    25 كم
                  </option>

                  <option value="50">
                    50 كم
                  </option>

                  <option value="100">
                    100 كم
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mapSidebarCard">
            <div className="mapStats">
              <span>إجمالي النتائج</span>

              <span
                style={{
                  fontWeight: 800,
                  color: "var(--navy)",
                }}
              >
                {loading ? "..." : items.length}
              </span>
            </div>

            <div
              style={{
                height: "1px",
                background: "var(--border)",
                margin: "0.75rem 0",
              }}
            />

            <div className="mapLegend">
              <div className="legendItem">
                <div className="legendDot lost" />
                <span>
                  مفقود (
                  {loading ? "..." : lostCount})
                </span>
              </div>

              <div className="legendItem">
                <div className="legendDot found" />
                <span>
                  موجود (
                  {loading ? "..." : foundCount})
                </span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div
            className="mapSidebarCard"
            style={{ flex: 1 }}
          >
            <h3>النتائج</h3>

            <div className="mapItemsList">
              {loading ? (
                Array.from({ length: 5 }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="skeletonLine"
                      style={{ height: 56 }}
                    />
                  )
                )
              ) : items.length === 0 ? (
                <div
                  className="stateEmpty"
                  style={{ padding: "1.5rem" }}
                >
                  <MapPinned size={30} />
                  <p>لا توجد نتائج</p>
                </div>
              ) : (
                items.slice(0, 15).map((item) => (
                  <div
                    key={item._id}
                    className="mapItemRow"
                    onClick={() =>
                      setSelectedItem(item)
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong>
                        {item.title}
                      </strong>

                      <span
                        className={`badge badge-${
                          item.type === "lost"
                            ? "danger"
                            : "success"
                        }`}
                        style={{
                          fontSize: "0.72rem",
                        }}
                      >
                        {item.type === "lost"
                          ? "مفقود"
                          : "موجود"}
                      </span>
                    </div>

                    <span>
                      {item.city}
                      {item.area
                        ? ` - ${item.area}`
                        : ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mapCanvas">
          <div
            ref={mapContainerRef}
            className="mapRoot"
          />
        </div>
      </div>
    </MainLayout>
  );
}