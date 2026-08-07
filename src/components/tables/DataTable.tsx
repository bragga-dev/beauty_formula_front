import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  /** Renderizado como card no mobile (layout alternativo à tabela em telas pequenas) */
  renderCard?: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, isLoading, renderCard }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {renderCard && (
        <div className="flex flex-col gap-3 md:hidden">
          {rows.map((row) => (
            <div key={rowKey(row)}>{renderCard(row)}</div>
          ))}
        </div>
      )}
      <div className={renderCard ? "hidden overflow-x-auto rounded-card border border-ink-700 md:block" : "overflow-x-auto rounded-card border border-ink-700"}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-ink-800 text-xs uppercase tracking-wide text-bone-500">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className={`px-4 py-3 font-medium ${col.hideOnMobile ? "hidden md:table-cell" : ""} ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-ink-800/60">
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-3 text-bone-200 ${col.hideOnMobile ? "hidden md:table-cell" : ""} ${col.className ?? ""}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}