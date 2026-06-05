/* eslint-disable react/prop-types */
import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loading } from "@/components/ui/loading";
import { Checkbox } from "@/components/ui/checkbox";

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "Tidak ada data",
  emptyIcon: EmptyIcon,
  containerClassName,
  toolbar,
  pagination,
  onRowClick,
  rowClassName,
  selectable = false,
  selectedIds = [],
  onSelectionChange = () => {},
  rowKey
}) => {
  const getRowId = (row) => {
    if (rowKey) return typeof rowKey === "function" ? rowKey(row) : row[rowKey];
    return row.id || row._id;
  };

  const currentPageIds = data.map(getRowId);
  const isAllSelected = data.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(currentPageIds);
    }
  };

  const toggleSelectRow = (e, row) => {
    e.stopPropagation();
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
              checked={isSomeSelected ? "indeterminate" : isAllSelected}
              onCheckedChange={toggleSelectAll}
            />
          ),
          render: (row) => (
            <Checkbox
              checked={selectedIds.includes(getRowId(row))}
              onCheckedChange={(e) => toggleSelectRow(e, row)}
            />
          )
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
                    "px-4 py-3.5 text-xs font-semibold uppercase tracking-wider",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
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
                    "px-4 py-3.5 text-xs font-semibold uppercase tracking-wider",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
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
                          "px-4 py-4",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center"
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
    const { page, totalPages, total, onPageChange, showingText } = pagination;
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

    return (
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {showingText || `Menampilkan 1-${data.length} dari ${total || data.length}`}
        </span>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      ) : (
        renderTable()
      )}

      {pagination && renderPagination()}
    </div>
  );
};

export default DataTable;
