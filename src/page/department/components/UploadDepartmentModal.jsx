import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  Database,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpToLine
} from "lucide-react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { uploadDepartmentExcel } from "@/services/department";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ALLOWED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv"
];

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadDepartmentModal = ({ open, onOpenChange, onUploadSuccess }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [parseError, setParseError] = useState(false);
  const fileInputRef = useRef(null);

  const resetState = useCallback(() => {
    setFile(null);
    setUploading(false);
    setUploadStatus(null);
    setParseError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const processFile = useCallback(async (selectedFile) => {
    if (!selectedFile) return;
    if (
      !ALLOWED_TYPES.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      return;
    }
    setFile(selectedFile);
    setUploadStatus(null);
    setParseError(false);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer?.files?.[0];
      if (droppedFile) processFile(droppedFile);
    },
    [processFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);

  const handleDirectUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      await uploadDepartmentExcel(file);
      setUploadStatus("success");
      if (onUploadSuccess) onUploadSuccess();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch {
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t("page.department.upload.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("page.department.upload.subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-xl border-2 border-dashed transition-all p-10 text-center cursor-pointer
                ${dragOver ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]" : "border-muted-foreground/25 hover:border-emerald-300 hover:bg-muted/20"}`}
              onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className={`flex flex-col items-center gap-3 transition-all ${dragOver ? "scale-105" : ""}`}>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted"}`}>
                  {dragOver ? (
                    <ArrowUpToLine size={32} className="text-emerald-500" />
                  ) : (
                    <Upload size={32} className="text-muted-foreground/60" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {dragOver
                      ? t("page.department.upload.dragActive")
                      : t("page.department.upload.dragInactive")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("page.department.upload.format")}
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet size={24} className="text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setParseError(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
            )}

            {parseError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-sm animate-in slide-in-from-bottom-2 duration-200">
                <AlertCircle size={18} />
                {t("page.department.upload.parseError")}
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-sm animate-in slide-in-from-bottom-2 duration-200">
                <CheckCircle2 size={18} />
                {t("page.department.upload.successMsg")}
              </div>
            )}
            {uploadStatus === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-sm animate-in slide-in-from-bottom-2 duration-200">
                <AlertCircle size={18} />
                {t("page.department.upload.errorMsg")}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button
                disabled={!file || uploading}
                onClick={handleDirectUpload}
                className="gap-2 min-w-[140px]">
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t("page.department.upload.uploading")}
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    {t("page.department.upload.directUpload")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
};

UploadDepartmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onUploadSuccess: PropTypes.func
};
export default UploadDepartmentModal;
