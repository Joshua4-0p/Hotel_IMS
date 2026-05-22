import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns:       ColumnDef<TData, TValue>[];
  data:          TData[];
  searchKey?:    string;
  searchPlaceholder?: string;
  toolbar?:      React.ReactNode;
  pageSize?:     number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search…',
  toolbar,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting,         setSorting]         = React.useState<SortingState>([]);
  const [columnFilters,   setColumnFilters]   = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection,    setRowSelection]    = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    onSortingChange:         setSorting,
    onColumnFiltersChange:   setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange:    setRowSelection,
    initialState: { pagination: { pageSize } },
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      {(searchKey || toolbar) && (
        <div className="flex items-center gap-3 flex-wrap">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
              className="h-9 max-w-xs"
            />
          )}
          {toolbar}
        </div>
      )}

      {/* Table */}
      <div className="rounded-[0.75rem] border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden bg-white dark:bg-[#1e1e1e]"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-[#e5e7eb] dark:border-[#2e2e2e] hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide"
                  >
                    {header.isPlaceholder ? null : (
                      header.column.getCanSort() ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-[#111111] dark:hover:text-white transition-colors"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc'  ? <ChevronUp size={12} /> :
                           header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                           <ChevronsUpDown size={12} className="opacity-40" />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-[#f3f4f6] dark:border-[#2e2e2e] hover:bg-[#f8f8f8] dark:hover:bg-[#252525] transition-colors',
                    row.getIsSelected() && 'bg-[#f3f4f6] dark:bg-[#252525]',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-[#9ca3af]"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-[#9ca3af] shrink-0">
          {table.getFilteredSelectedRowModel().rows.length > 0
            ? `${table.getFilteredSelectedRowModel().rows.length} of `
            : ''}
          {table.getFilteredRowModel().rows.length} row(s)
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[#585858] dark:text-[#9ca3af] hidden sm:inline">Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-[#585858] dark:text-[#9ca3af] hidden sm:inline whitespace-nowrap">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
