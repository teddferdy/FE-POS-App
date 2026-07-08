/* eslint-disable react/prop-types */
import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

const DataTable = ({
  columns = [],
  data = [],
  isLoading,
  emptyMessage: emptyMessageProp,
  emptyIcon: EmptyIcon,
  containerClassName,
  toolbar,
  pagination,
  onRowClick,
  rowClassName,
  selectable = false,
  selectedIds = [],
  onSelectionChange = () => {},
  isSelectable,
  rowKey,
  // ponytail: single prop for bulk action bar, called with (selectedIds, clearSelection)
  // e.g. bulkActions={(ids, clear) => <button onClick={() => { deleteItems(ids); clear(); }}>Delete</button>}
  bulkActions
}) => {
  const { t } = useTranslation();
  const emptyMessage = emptyMessageProp ?? t("common.noData");
  const getRowId = (row) => {
    if (rowKey) return typeof rowKey === "function" ? rowKey(row) : row[rowKey];
    return row.id || row._id;
  };

  const isRowSelectable = (row) => (isSelectable ? isSelectable(row) : true);

  const currentPageSelectableIds = data.filter(isRowSelectable).map(getRowId);
  const isAllSelected =
    currentPageSelectableIds.length > 0 &&
    currentPageSelectableIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange(selectedIds.filter((id) => !currentPageSelectableIds.includes(id)));
    } else {
      const newIds = [
        ...selectedIds.filter((id) => !currentPageSelectableIds.includes(id)),
        ...currentPageSelectableIds
      ];
      onSelectionChange(newIds);
    }
  };

  const toggleSelectRow = (row) => {
    if (!isRowSelectable(row)) return;
    const id = getRowId(row);
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((sid) => sid !== id) : [...selectedIds, id]
    );
  };

  const allColumns = selectable
    ? [
        {
          header: (
            <Checkbox
              checked={
                currentPageSelectableIds.length === 0
                  ? false
                  : isSomeSelected
                    ? "indeterminate"
                    : isAllSelected
              }
              disabled={currentPageSelectableIds.length === 0}
              onCheckedChange={toggleSelectAll}
            />
          ),
          render: (row) =>
            isRowSelectable(row) ? (
              <Checkbox
                checked={selectedIds.includes(getRowId(row))}
                onCheckedChange={() => toggleSelectRow(row)}
              />
            ) : null
        },
        ...columns
      ]
    : columns;

  const renderTable = () => {
    if (data.length === 0) {
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              {allColumns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-6 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.stickyRight &&
                      "sticky right-0 bg-card shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]",
                    col.hideOn && `hidden ${col.hideOn}:table-cell`,
                    col.className
                  )}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={allColumns.length}
                className="px-4 py-12 text-center text-muted-foreground">
                {EmptyIcon && <EmptyIcon size={40} className="mx-auto mb-3 opacity-30" />}
                <p>{emptyMessage}</p>
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              {allColumns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-6 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.stickyRight &&
                      "sticky right-0 bg-card shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]",
                    col.hideOn && `hidden ${col.hideOn}:table-cell`,
                    col.className
                  )}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIndex) => {
              const rowId = getRowId(row);
              return (
                <tr
                  key={rowId !== undefined && rowId !== null ? rowId : rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-accent/30 transition-colors",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row, rowIndex)
                  )}>
                  {allColumns.map((col, colIndex) => {
                    const isCheckboxCol = selectable && colIndex === 0;
                    return (
                      <td
                        key={colIndex}
                        onClick={isCheckboxCol ? (e) => e.stopPropagation() : undefined}
                        className={cn(
                          "px-6 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-center",
                          col.align === "right" && "text-right",
                          col.stickyRight &&
                            "sticky right-0 bg-card shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]",
                          col.hideOn && `hidden ${col.hideOn}:table-cell`,
                          col.className
                        )}>
                        {col.render
                          ? col.render(row, rowIndex)
                          : col.accessor
                            ? row[col.accessor]
                            : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { page, totalPages, total, pageSize, onPageChange, onPageSizeChange, showingText } =
      pagination;
    const tp = totalPages || 1;
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(tp, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pageNumbers = [];
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    const showStartEllipsis = start > 1;
    const showEndEllipsis = end < tp;

    const pageSizeOptions = [5, 10, 15, 20, 25, 50, 100];

    return (
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          {onPageSizeChange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <select
                value={pageSize || 10}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>
          )}
          <span className="text-sm text-muted-foreground">
            {showingText || `Menampilkan 1-${data.length} dari ${total || data.length}`}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
            <ChevronLeft size={14} />
          </button>
          {showStartEllipsis && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
                1
              </button>
              <span className="w-9 h-9 flex items-center justify-center text-muted-foreground text-xs select-none">
                ...
              </span>
            </>
          )}
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "w-9 h-9 flex items-center justify-center border rounded-lg text-sm font-medium transition-colors",
                pageNum === page
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}>
              {pageNum}
            </button>
          ))}
          {showEndEllipsis && (
            <>
              <span className="w-9 h-9 flex items-center justify-center text-muted-foreground text-xs select-none">
                ...
              </span>
              <button
                onClick={() => onPageChange(tp)}
                className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
                {tp}
              </button>
            </>
          )}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= tp}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onPageChange(tp)}
            disabled={page >= tp}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-sm border border-border overflow-hidden",
        containerClassName
      )}>
      {toolbar && <div className="p-4 border-b border-border bg-muted/30">{toolbar}</div>}

      {isLoading && data.length === 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                {allColumns.map((col, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-6 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.stickyRight &&
                        "sticky right-0 bg-card shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]",
                      col.hideOn && `hidden ${col.hideOn}:table-cell`
                    )}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {allColumns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-6 py-4 text-center",
                        col.align === "right" && "text-right",
                        col.stickyRight &&
                          "sticky right-0 bg-card shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]",
                        col.hideOn && `hidden ${col.hideOn}:table-cell`,
                        col.className
                      )}>
                      <Skeleton className={cn("h-4", colIdx === 0 ? "w-24" : "w-32")} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        renderTable()
      )}

      {selectedIds.length > 0 && bulkActions && (
        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-border">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedIds, () => onSelectionChange([]))}
          </div>
        </div>
      )}

      {pagination && renderPagination()}
    </div>
  );
};

export default DataTable;
