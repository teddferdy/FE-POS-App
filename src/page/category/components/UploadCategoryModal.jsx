import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { X, Upload, FileSpreadsheet, Download, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { uploadExcel } from "@/services/category";
import { Toast } from "@/components/organism/toast";
import PropTypes from "prop-types";

const UploadCategoryModal = ({ onClose }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const mutation = useMutation((data) => uploadExcel(data), {
    onSuccess: () => {
      queryClient.invalidateQueries("categories");
      Toast.fire({ icon: "success", title: t("page.category.importSuccess") });
      onClose();
    },
    onError: (err) => {
      Toast.fire({
        icon: "error",
        title: err?.response?.data?.message || t("page.category.importError")
      });
    }
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      Toast.fire({ icon: "warning", title: t("page.category.selectFileFirst") });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    mutation.mutate(formData);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary" />
            <h2 className="text-lg font-bold">{t("page.category.importTitle")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border/60 hover:border-primary/50"
            }`}>
            {file ? (
              <div
                className="flex items-center gap-3 justify-center"
                onClick={(e) => e.stopPropagation()}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet size={20} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1 rounded-md hover:bg-accent transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Upload size={24} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">{t("page.category.dragDrop")}</p>
                <p className="text-xs text-muted-foreground/60">
                  {t("page.category.supportedFormats")}
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <a
            href="/templates/category-template.xlsx"
            download
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Download size={14} />
            {t("page.category.downloadTemplate")}
          </a>

          {file && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{t("page.category.importNote")}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || mutation.isLoading}
              className="relative overflow-hidden group/btn">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {mutation.isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {mutation.isLoading ? t("common.uploading") : t("common.upload")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

UploadCategoryModal.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default UploadCategoryModal;
