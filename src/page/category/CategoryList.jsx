import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderTree
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import PropTypes from "prop-types";
import { DeleteAlert } from "@/components/organism/alert";
import { Toast } from "@/components/organism/toast";
import { getAllCategoryTable, deleteCategory } from "@/services/category";
import UploadCategoryModal from "./components/UploadCategoryModal";

const CategoryList = ({ onSelect, categoryId: externalCategoryId, onCategoryChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data, isLoading } = useQuery(
    ["categories", page, limit],
    () => getAllCategoryTable({ page, limit }),
    { keepPreviousData: true }
  );

  const categories = data?.data || data || [];
  const totalPages = data?.totalPages || 1;

  const isSelectionMode = !!onCategoryChange || !!onSelect;

  const deleteMutation = useMutation(deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries("categories");
      Toast.fire({ icon: "success", title: t("page.category.deleted") });
    },
    onError: () => {
      Toast.fire({ icon: "error", title: t("page.category.deleteError") });
    }
  });

  const handleDelete = (id) => {
    DeleteAlert.fire({
      title: t("page.category.deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel")
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleSelectCategory = (cat) => {
    const id = cat?.id || cat?._id || cat?.ID || "";
    if (isSelectionMode) {
      if (onSelect) onSelect(cat);
      if (onCategoryChange) onCategoryChange(id);
    } else {
      setSelectedCategory(selectedCategory?.id === id ? null : cat);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isSelectionMode && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree size={20} className="text-primary" />
            <h1 className="text-xl font-bold">{t("page.category.title")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
              <RefreshCw size={14} />
              {t("page.category.import")}
            </Button>
            <Button size="sm" onClick={() => navigate("/category/add")}>
              <Plus size={14} />
              {t("page.category.add")}
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("page.category.search")}
          className="pl-9 h-10"
        />
      </div>

      {isSelectionMode ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {externalCategoryId && (
            <button
              onClick={() => onCategoryChange("")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                !externalCategoryId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}>
              {t("page.category.all")}
            </button>
          )}
          {categories
            .filter((cat) => {
              if (!search) return true;
              const name = (cat.nameCategory || cat.name || "").toLowerCase();
              return name.includes(search.toLowerCase());
            })
            .map((cat, idx) => {
              const id = cat?.id || cat?._id || cat?.ID || "";
              const isActive = id === externalCategoryId;
              return (
                <button
                  key={id || idx}
                  onClick={() => handleSelectCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}>
                  {cat.nameCategory || cat.name || "-"}
                </button>
              );
            })}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {categories
              .filter((cat) => {
                if (!search) return true;
                const name = (cat.nameCategory || cat.name || "").toLowerCase();
                return name.includes(search.toLowerCase());
              })
              .map((cat, idx) => {
                const id = cat?.id || cat?._id || cat?.ID || "";
                const isActive = selectedCategory?.id === id;
                return (
                  <div
                    key={id || idx}
                    onClick={() => handleSelectCategory(cat)}
                    className={`group bg-card border rounded-xl p-4 transition-all cursor-pointer ${
                      isActive
                        ? "border-primary/50 bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-border hover:shadow-sm"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                          <FolderTree size={18} className="text-primary/60" />
                        </div>
                        <div>
                          <p className="font-medium">{cat.nameCategory || cat.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat.nameCategoryEnglish || cat.nameEnglish || ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/category/edit/${id}`);
                          }}>
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(id);
                          }}>
                          <Trash2 size={14} />
                        </Button>
                        <Link to={`/category/${id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <ChevronRight size={14} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}

      {showUpload && <UploadCategoryModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};

CategoryList.propTypes = {
  onSelect: PropTypes.func,
  categoryId: PropTypes.string,
  onCategoryChange: PropTypes.func
};

export default CategoryList;
