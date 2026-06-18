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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadTypePaymentExcel } from "@/services/type-payment";
import { motion } from "framer-motion";

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const UploadTypePaymentModal = ({ open, onOpenChange, onUploadSuccess }) => {
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

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    setParseError(false);

    try {
      const res = await uploadTypePaymentExcel(file);
      setUploadStatus("success");
      toast.success(t("common.success"), {
        description: res.message || t("page.typePayment.toast.uploadSuccess")
      });
      setTimeout(() => {
        handleClose();
        if (onUploadSuccess) onUploadSuccess();
      }, 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || t("page.typePayment.toast.uploadError");
      if (msg.includes("baris") || msg.includes("Row") || msg.includes("validasi")) {
        setParseError(true);
      }
      setUploadStatus("error");
      toast.error(t("common.error"), { description: msg });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus(null);
    setParseError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!open) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-background rounded-xl border border-border shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{t("page.typePayment.upload.title")}</h2>
                <p className="text-xs text-muted-foreground">
                  {t("page.typePayment.upload.description")}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <Database size={18} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t("page.typePayment.upload.formatHint")}</p>
                <p className="text-xs">{t("page.typePayment.upload.columnsHint")}</p>
              </div>
            </div>

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowUpToLine size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("common.dropOrClick")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("common.supportedFormats")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={20} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    disabled={uploading}
                    className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors shrink-0 ml-2">
                    <X size={16} className="text-destructive" />
                  </button>
                </div>

                {uploadStatus === "success" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {t("common.uploadSuccess")}
                    </p>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        {t("common.uploadFailed")}
                      </p>
                      {parseError && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {t("common.checkFileFormat")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploading || uploadStatus === "success"}
                  className="w-full gap-2"
                  size="lg">
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t("common.uploading")}
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      {t("common.upload")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

UploadTypePaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onUploadSuccess: PropTypes.func
};

export default UploadTypePaymentModal;
