/* eslint-disable react/prop-types */
import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Image
} from "lucide-react";
import { getLocationById } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

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

const LocationDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(["location-detail", id], () => getLocationById({ id }), {
    enabled: !!id
  });

  const location = data?.data || data?.location || data;

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
    <div className="max-w-4xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/location-list")}
          className="font-medium hover:text-primary transition-colors">
          Kelola Toko
        </button>
        <span className="text-xs">/</span>
        <span className="font-semibold text-foreground">Detail Toko</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => navigate("/location-list")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detail Toko</h1>
            <p className="text-sm text-muted-foreground">Informasi lengkap cabang toko</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/edit-location?id=${id}`)} className="gap-2 shrink-0">
          <Edit size={16} />
          Edit Toko
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-muted border border-border mb-4">
                {location.image ? (
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Image size={40} />
                    <span className="text-xs">Tidak ada gambar</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">{location.name}</h2>
                {location.storeId && (
                  <span className="inline-block mt-1 font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                    {location.storeId}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={14} />
                Status Operasional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground font-medium">
                  {location.isActive ? "Aktif" : "Non-Aktif"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${
                    location.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}>
                  {location.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {location.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {location.openTime && location.closeTime && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>
                    {location.openTime} - {location.closeTime}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 size={14} />
                Informasi Toko
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow icon={Store} label="Nama Toko" value={location.name} />
              <DetailRow icon={Hash} label="Store ID" value={location.storeId} />
              <DetailRow icon={Globe} label="Deskripsi" value={location.description} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} />
                Alamat & Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow icon={MapPin} label="Alamat Lengkap" value={location.address} />
              <DetailRow icon={Building2} label="Kota" value={location.city} />
              <DetailRow icon={Globe} label="Detail Lokasi" value={location.detailLocation} />
              <DetailRow icon={Globe} label="Location" value={location.location} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Phone size={14} />
                Kontak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow icon={Phone} label="Nomor Telepon" value={location.phoneNumber} />
              <DetailRow icon={Mail} label="Email" value={location.email} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
