/* eslint-disable react/prop-types */
import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Store, MapPin, Navigation, Building2 } from "lucide-react";
import { getAllLocation, getAllLocationTable } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import AbortController from "@/components/organism/abort-controller";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0 }
// };

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const activeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const inactiveIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FitBounds = ({ locations }) => {
  const map = useMap();
  React.useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [+loc.latitude, +loc.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [locations, map]);
  return null;
};

const categoryColors = {
  "Main Branch": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Branch: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Warehouse: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Office: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
};

const StoreGeospatial = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const {
    data: detailData,
    isLoading: detailLoading,
    isError,
    refetch
  } = useQuery(["all-locations-detail"], getAllLocation);
  const { data: tableData, isLoading: tableLoading } = useQuery(["all-locations-table"], () =>
    getAllLocationTable({ page: 1, limit: 1000 })
  );

  const allLocations = useMemo(() => {
    const detailItems = detailData?.data || detailData?.locations || [];
    const tableItems = tableData?.data || tableData?.locations || [];

    const coordMap = {};
    detailItems.forEach((item) => {
      if (item.latitude && item.longitude) {
        const key = String(item.store ?? item.id);
        coordMap[key] = { latitude: item.latitude, longitude: item.longitude };
      }
    });

    return tableItems.map((loc) => {
      const num = parseInt(loc.storeId?.replace(/^ST-/i, ""), 10);
      const key = String(isNaN(num) ? loc.id : num);
      return { ...loc, ...(coordMap[key] || {}) };
    });
  }, [detailData, tableData]);

  const getCategory = (loc) => {
    if (loc.category) return loc.category;
    if (loc.mainBranch) return "Main Branch";
    return "Branch";
  };

  const filteredLocations = allLocations.filter((loc) => {
    const isActive = loc.status === true || loc.status === "active" || loc.isActive === true;
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive);
    const categoryMatch = categoryFilter === "all" || getCategory(loc) === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const locationsWithCoords = filteredLocations.filter((loc) => loc.latitude && loc.longitude);

  const handleOpenRoute = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const isLoading = detailLoading || tableLoading;

  if (isError) return <AbortController refetch={refetch} />;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/location-list")}
            className="font-medium hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={16} />
            {t("page.location.list.title")}
          </button>
          <span className="text-xs">/</span>
          <span className="font-semibold text-foreground">{t("page.location.list.title")}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("page.location.list.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.location.list.description")}
            </p>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("common.status")}:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="all">{t("common.all")}</option>
                <option value="active">{t("common.active")}</option>
                <option value="inactive">{t("common.inactive")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("common.category")}:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="all">{t("common.all")}</option>
                <option value="Main Branch">{t("page.location.category.mainBranch")}</option>
                <option value="Branch">{t("page.location.category.branch")}</option>
                <option value="Warehouse">{t("page.location.category.warehouse")}</option>
                <option value="Office">{t("page.location.category.office")}</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground self-center ml-auto">
              {t("page.location.map.showing", {
                count: locationsWithCoords.length,
                total: allLocations.length
              })}
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          {isLoading ? (
            <Loading fullscreen size="lg" label={t("common.loading")} />
          ) : (
            <div className="relative z-0 h-[500px]">
              <style>{`
              .leaflet-pane { z-index: 1; }
              .leaflet-top, .leaflet-bottom { z-index: 2; }
            `}</style>
              <MapContainer
                center={[-2.5, 118]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds locations={locationsWithCoords} />
                {locationsWithCoords.map((loc) => {
                  const lat = +loc.latitude;
                  const lng = +loc.longitude;
                  const isActive =
                    loc.status === true || loc.status === "active" || loc.isActive === true;
                  const category = getCategory(loc);

                  return (
                    <Marker
                      key={loc.id || loc._id}
                      position={[lat, lng]}
                      icon={isActive ? activeIcon : inactiveIcon}>
                      <Popup>
                        <div className="text-sm min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <Store size={16} className="text-primary shrink-0" />
                            <p className="font-semibold text-foreground">{loc.name}</p>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground">{loc.address || "-"}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Building2 size={12} className="text-muted-foreground shrink-0" />
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  categoryColors[category] ||
                                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                }`}>
                                {category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                {isActive ? t("common.active") : t("common.inactive")}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {lat.toFixed(6)}, {lng.toFixed(6)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 h-8 text-xs gap-1"
                            onClick={() => handleOpenRoute(lat, lng)}>
                            <Navigation size={12} />
                            {t("page.location.map.openRoute")}
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t("page.location.map.legend")}:</span>
            <div className="flex items-center gap-1.5">
              <img
                src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
                className="w-4 h-5"
                alt="active"
              />
              <span>{t("page.location.map.active")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img
                src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                className="w-4 h-5"
                alt="inactive"
              />
              <span>{t("page.location.map.inactive")}</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {Object.entries(categoryColors).map(([cat, cls]) => (
                <span key={cat} className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cls}`}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default StoreGeospatial;
