/* eslint-disable no-constant-binary-expression */
/* eslint-disable react/prop-types */
import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Edit,
  Building2,
  Hash,
  CheckCircle2,
  XCircle,
  Image,
  Navigation,
  User,
  Layers,
  Map,
  Info,
  ShieldCheck,
  History,
  Smartphone
} from "lucide-react";
import { getLocationDetail } from "@/services/location";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  getPostalCode
} from "@/services/general";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const dayLabels = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu"
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value || "-"}</p>
    </div>
  </div>
);

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${
      isActive
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
    }`}>
    {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    {isActive ? "Active" : "Inactive"}
  </span>
);

const FormattedOpeningHours = ({ openingHours }) => {
  if (!openingHours || openingHours.length === 0) {
    return <p className="text-sm text-foreground italic">Tidak ada jam operasional</p>;
  }
  return (
    <div className="space-y-1">
      {openingHours.map((oh) => (
        <div key={oh.day} className="flex items-center justify-between py-1.5">
          <span className="text-sm font-medium text-foreground w-24">
            {dayLabels[oh.day] || oh.day}
          </span>
          {oh.open && oh.close ? (
            <span className="text-sm font-semibold text-foreground bg-muted px-3 py-1 rounded-lg">
              {oh.open} - {oh.close}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/60 italic bg-muted/50 px-3 py-1 rounded-lg">
              Tutup
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between pb-3 border-b border-border">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
        <Icon size={18} />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
    </div>
    {action}
  </div>
);

const LocationDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(["location-detail", id], () => getLocationDetail({ id }), {
    enabled: !!id
  });

  const location = data?.data || data?.location || data;

  const { data: provinces } = useQuery(["provinces"], getProvinces, {
    enabled: !!location
  });

  const { data: cities } = useQuery(
    ["cities", location?.province],
    () => getCities(location.province),
    { enabled: !!location?.province }
  );

  const { data: districts } = useQuery(
    ["districts", location?.city],
    () => getDistricts(location.city),
    { enabled: !!location?.city }
  );

  const { data: villages } = useQuery(
    ["villages", location?.district],
    () => getVillages(location.district),
    { enabled: !!location?.district }
  );

  const { data: postalCodes } = useQuery(
    ["postal-codes", location?.village],
    () => getPostalCode(location.village),
    { enabled: !!location?.village }
  );

  const provinceName =
    provinces?.find((p) => p.kode_prov === location?.province)?.nama_provinsi || location?.province;
  const cityName =
    cities?.find((c) => c.kode_kab === location?.city)?.nama_kabupaten || location?.city;
  const districtName =
    districts?.find((d) => d.kode_kec === location?.district)?.nama_kecamatan || location?.district;
  const villageName =
    villages?.find((v) => v.kode_desa === location?.village)?.nama_desa || location?.village;
  const postalCodeValue = postalCodes?.[0]?.kode_pos || location?.postalCode;

  const isActive = location?.isActive ?? location?.status === "active" ?? true;

  const lat = location?.latitude ?? location?.coordinates?.lat ?? null;
  const lng = location?.longitude ?? location?.coordinates?.lng ?? null;
  const hasCoordinates = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Store size={40} />
        <p>Toko tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/location-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/location-list")}
          className="font-medium hover:text-primary transition-colors">
          Kelola Toko
        </button>
        <span className="text-xs">/</span>
        <span className="font-semibold text-foreground">Detail Toko</span>
      </nav>

      {/* Main Card */}
      <div className="bg-card rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => navigate("/location-list")}>
              <ArrowLeft size={18} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Store size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Detail Toko</h2>
                <p className="text-sm text-muted-foreground">Informasi lengkap cabang toko</p>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate(`/edit-location?id=${id}`)} className="gap-2 shrink-0">
            <Edit size={16} />
            Edit Toko
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ===== LEFT COLUMN (2/3) ===== */}
            <div className="lg:col-span-2 space-y-8">
              {/* Informasi Toko */}
              <div className="space-y-4">
                <SectionHeader icon={Building2} title="Informasi Toko" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <DetailRow icon={Store} label="Nama Toko" value={location.name} />
                  <DetailRow icon={Hash} label="Store ID" value={location.id} />
                  <DetailRow icon={Layers} label="Kategori" value={location.category} />
                  <DetailRow icon={User} label="Manager" value={location.managerName} />
                </div>
              </div>

              {/* Kontak */}
              <div className="space-y-4">
                <SectionHeader icon={Smartphone} title="Kontak" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <DetailRow icon={Phone} label="Nomor Telepon" value={location.phoneNumber} />
                  <DetailRow icon={Mail} label="Email" value={location.email} />
                </div>
              </div>

              {/* Alamat & Wilayah */}
              <div className="space-y-4">
                <SectionHeader icon={MapPin} title="Alamat & Wilayah" />
                <div className="space-y-0">
                  <DetailRow icon={MapPin} label="Alamat Lengkap" value={location.address} />
                  <DetailRow icon={Globe} label="Detail Lokasi" value={location.detailLocation} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <DetailRow icon={Building2} label="Provinsi" value={provinceName} />
                  <DetailRow icon={Building2} label="Kota / Kabupaten" value={cityName} />
                  <DetailRow icon={Building2} label="Kecamatan" value={districtName} />
                  <DetailRow icon={Building2} label="Kelurahan" value={villageName} />
                  <DetailRow icon={Hash} label="Kode Pos" value={postalCodeValue} />
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="space-y-4">
                <SectionHeader icon={Clock} title="Jam Operasional" />
                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <FormattedOpeningHours openingHours={location.openingHours} />
                </div>
              </div>

              {/* Lokasi Peta */}
              <div className="space-y-4">
                <SectionHeader
                  icon={Map}
                  title="Lokasi Peta"
                  action={
                    hasCoordinates &&
                    googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                        <Navigation size={13} />
                        Buka rute
                      </a>
                    )
                  }
                />
                {hasCoordinates ? (
                  <div className="relative z-0 rounded-lg overflow-hidden border border-border">
                    <style>{`
                      .leaflet-pane { z-index: 1; }
                      .leaflet-top, .leaflet-bottom { z-index: 2; }
                    `}</style>
                    <MapContainer
                      center={[lat, lng]}
                      zoom={15}
                      style={{ height: "320px", width: "100%" }}
                      scrollWheelZoom={false}
                      dragging={false}
                      touchZoom={false}
                      doubleClickZoom={false}
                      zoomControl={false}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[lat, lng]}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold">{location.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {location.address}
                            </p>
                            <p className="text-xs mt-1">
                              {lat.toFixed(6)}, {lng.toFixed(6)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t border-border text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium">Lat:</span> {lat.toFixed(6)}
                      </span>
                      <span>
                        <span className="font-medium">Lng:</span> {lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3 bg-muted/30 rounded-lg border border-dashed border-border">
                    <MapPin size={32} />
                    <p className="text-sm">Koordinat tidak tersedia</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit-location?id=${id}`)}>
                      Atur Lokasi
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT COLUMN (1/3) ===== */}
            <div className="lg:col-span-1 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-green-600 dark:bg-green-700 text-white"
                        : "bg-red-600 dark:bg-red-900 text-white"
                    }`}>
                    {isActive ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {isActive ? "Aktif" : "Non-Aktif"}
                    </p>
                    <p className="text-xs text-muted-foreground">Status Operasional Toko</p>
                  </div>
                </div>
                <StatusBadge isActive={isActive} />
              </div>

              {/* Foto Toko */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Image size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Foto Toko</h3>
                </div>
                {location.image ? (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 p-8 min-h-[200px]">
                    <Image size={48} className="text-muted-foreground mb-3" />
                    <span className="text-sm text-muted-foreground">Tidak ada gambar</span>
                  </div>
                )}
              </div>

              {/* Informasi Tambahan */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Hash size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Detail Lainnya</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-xs font-medium text-muted-foreground">Main Branch</span>
                    <span
                      className={`text-xs font-bold ${location.mainBranch ? "text-green-600" : "text-muted-foreground"}`}>
                      {location.mainBranch ? "Ya" : "Tidak"}
                    </span>
                  </div>
                  {location.managerName && (
                    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                      <span className="text-xs font-medium text-muted-foreground">Manager</span>
                      <span className="text-xs font-semibold text-foreground">
                        {location.managerName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informasi Sistem */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">info</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Informasi Sistem</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-xs font-medium text-muted-foreground">Dibuat Pada</span>
                    <span className="text-xs font-semibold text-foreground">
                      {location.createdAt
                        ? new Date(location.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      Diperbarui Pada
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {location.updatedAt
                        ? new Date(location.updatedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Help Cards */}
              <div className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border">
                  <Info size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Validasi Data
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pastikan data toko selalu diperbarui untuk akurasi operasional.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border">
                  <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Keamanan
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data hanya dapat diubah oleh pemilik atau super admin.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border">
                  <History size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Audit Trail
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Setiap perubahan akan tercatat dalam log sistem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
