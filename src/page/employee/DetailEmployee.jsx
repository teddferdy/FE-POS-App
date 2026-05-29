/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Badge,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building2,
  Shield,
  Clock,
  Store,
  Briefcase,
  Star,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Lock,
  Edit,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon
} from "lucide-react";
import { getEmployeeDetail } from "@/services/employee";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

const DetailEmployee = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employeeID = searchParams.get("employeeID");

  const { data, isLoading } = useQuery(
    ["employee-detail", employeeID],
    () => getEmployeeDetail(employeeID),
    { enabled: !!employeeID }
  );

  const employee = data?.data || data?.employee || {};

  const statusActive = employee.statusActive === true;

  if (isLoading) {
    return <Loading fullscreen size="lg" label="Memuat data karyawan..." />;
  }

  if (!employeeID || !employee.id) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <span className="material-symbols-outlined text-6xl text-muted-foreground">badge</span>
        <p className="text-muted-foreground">Karyawan tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/employee-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type, name) => {
    const ext = name?.split(".").pop()?.toLowerCase();
    if (type?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      return <FileImage size={18} className="text-blue-500 shrink-0" />;
    if (["pdf"].includes(ext)) return <FileText size={18} className="text-red-500 shrink-0" />;
    if (["xls", "xlsx", "csv"].includes(ext))
      return <FileSpreadsheet size={18} className="text-green-600 shrink-0" />;
    if (["doc", "docx"].includes(ext))
      return <FileText size={18} className="text-blue-700 shrink-0" />;
    return <FileIcon size={18} className="text-muted-foreground shrink-0" />;
  };

  const handleShow = (url) => {
    const sep = url.includes("?") ? "&" : "?";
    const previewUrl = url.includes("/raw/upload/") ? url + sep + "fl_attachment=false" : url;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const normalizeDoc = (doc) => {
    if (typeof doc === "string") {
      const fileName = doc.split("/").pop() || doc;
      const ext = fileName.split(".").pop()?.toLowerCase();
      return {
        fileUrl: doc,
        fileName,
        mimeType:
          ext === "pdf"
            ? "application/pdf"
            : ext === "docx"
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : ext === "jpg" || ext === "jpeg"
                ? "image/jpeg"
                : ext === "png"
                  ? "image/png"
                  : undefined
      };
    }
    return doc;
  };
  const documents =
    typeof employee.documents === "string"
      ? JSON.parse(employee.documents).map(normalizeDoc)
      : (employee.documents || []).map(normalizeDoc);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/employee-list")}
          className="font-medium hover:text-primary transition-colors">
          Kelola Karyawan
        </button>
        <span className="text-xs">/</span>
        <span className="font-semibold text-foreground">Detail Karyawan</span>
      </nav>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-muted">
            {employee.image ? (
              <img
                src={employee.image}
                alt={employee.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                {(employee.fullName || "?").charAt(0)}
              </div>
            )}
          </div>
          <div
            className={`absolute -bottom-2 -right-2 p-1 rounded-full border-2 border-background ${
              statusActive ? "bg-green-500" : "bg-muted-foreground"
            }`}>
            <span
              className="material-symbols-outlined text-sm block text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-1 relative">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-2xl font-bold text-foreground">{employee.fullName}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                statusActive
                  ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
              }`}>
              {statusActive ? "Active" : "Non-aktif"}
            </span>
          </div>
          <p className="text-muted-foreground">
            {employee.position || employee.positionData?.name || "Posisi tidak ditentukan"}
            <span className="mx-2">&bull;</span>
            ID: {employee.employeeID || "-"}
          </p>
          <div className="flex gap-4 pt-2 flex-wrap">
            {employee.storeData?.name && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Store size={14} />
                <span>{employee.storeData.name}</span>
              </div>
            )}
            {employee.startDate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>Bergabung {formatDate(employee.startDate)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate(`/edit-employee?id=${employee.id}`)}>
            <Edit size={16} />
            Edit Profil
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold">Informasi Dasar</h4>
              <User size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground shrink-0" />
                  {employee.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Nomor Telepon
                </p>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  {employee.phoneNumber || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Alamat
                </p>
                <p className="text-sm text-foreground flex items-start gap-2">
                  <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                  {employee.address || "-"}
                </p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Departemen
                </p>
                <p className="text-sm text-foreground">{employee.department || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Jenis Kelamin
                </p>
                <p className="text-sm text-foreground">{employee.gender || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold">Akun & Akses</h4>
              <Shield size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Username
                </p>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <User size={14} className="text-muted-foreground shrink-0" />
                  {employee.userName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Role
                </p>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Shield size={14} className="text-muted-foreground shrink-0" />
                  {employee.roleType || "user"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Tipe User
                </p>
                <p className="text-sm text-foreground">{employee.userType || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h4 className="text-base font-semibold mb-4">Informasi Pekerjaan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  ID Karyawan
                </p>
                <p className="text-sm font-mono font-bold text-primary">
                  {employee.employeeID || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Jabatan
                </p>
                <p className="text-sm text-foreground">
                  {employee.positionData?.name || employee.position || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Penempatan
                </p>
                <p className="text-sm text-foreground">{employee.storeData?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Tipe Kerja
                </p>
                <p className="text-sm text-foreground">
                  {employee.employmentType
                    ? employee.employmentType === "full-time"
                      ? "Full Time"
                      : employee.employmentType === "part-time"
                        ? "Part Time"
                        : employee.employmentType === "contract"
                          ? "Kontrak"
                          : employee.employmentType === "internship"
                            ? "Magang"
                            : employee.employmentType
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Shift
                </p>
                <p className="text-sm text-foreground">
                  {employee.shiftData?.shiftName || employee.shift || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Tanggal Mulai Kerja
                </p>
                <p className="text-sm text-foreground">{formatDate(employee.startDate)}</p>
              </div>
              {["contract", "internship"].includes(employee.employmentType) && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {employee.employmentType === "internship"
                        ? "Durasi Magang"
                        : "Durasi Kontrak"}
                    </p>
                    <p className="text-sm text-foreground">
                      {employee.contractDuration
                        ? {
                            3: "3 Bulan",
                            6: "6 Bulan",
                            9: "9 Bulan",
                            12: "12 Bulan / 1 Tahun",
                            24: "2 Tahun",
                            36: "3 Tahun",
                            48: "4 Tahun",
                            60: "5 Tahun"
                          }[employee.contractDuration] || `${employee.contractDuration} Bulan`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Tanggal Berakhir
                    </p>
                    <p className="text-sm text-foreground">{formatDate(employee.endDate)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl shadow-sm border border-border p-4 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Tempat Lahir</p>
                <p className="text-lg font-bold text-foreground">{employee.placeOfBirth || "-"}</p>
              </div>
              <MapPin className="absolute -right-4 -bottom-4 text-5xl text-primary/5" />
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-4 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Tanggal Lahir</p>
                <p className="text-lg font-bold text-foreground">
                  {formatDate(employee.dateOfBirth)}
                </p>
              </div>
              <Calendar className="absolute -right-4 -bottom-4 text-5xl text-primary/5" />
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-4 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
                <p
                  className={`text-lg font-bold flex items-center gap-1 ${
                    statusActive ? "text-green-600" : "text-red-600"
                  }`}>
                  {statusActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {statusActive ? "Aktif" : "Non-aktif"}
                </p>
              </div>
              <Shield className="absolute -right-4 -bottom-4 text-5xl text-primary/5" />
            </div>
          </div>

          {documents.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <span className="material-symbols-outlined text-primary">description</span>
                <h4 className="text-base font-semibold text-foreground">Dokumen</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc, index) => (
                  <div
                    key={doc.id || index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 group">
                    {getFileIcon(doc.mimeType || doc.fileType, doc.fileName || doc.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.fileName || doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.fileSize || doc.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShow(doc.fileUrl)}
                      className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Lihat">
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc.fileUrl, doc.fileName || "dokumen")}
                      className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Download">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h4 className="text-base font-semibold mb-4">Informasi Sistem</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Dibuat Pada
                </p>
                <p className="text-sm text-foreground">{formatDate(employee.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Diperbarui Pada
                </p>
                <p className="text-sm text-foreground">{formatDate(employee.updatedAt)}</p>
              </div>
              {employee.deletedAt && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Dihapus Pada
                  </p>
                  <p className="text-sm text-foreground">{formatDate(employee.deletedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailEmployee;
