
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { isSelected?: boolean }
>(({ className, isSelected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      isSelected && "bg-primary/10",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { sortable?: boolean; sortDirection?: 'asc' | 'desc' | null }
>(({ className, children, sortable, sortDirection, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      sortable && "cursor-pointer hover:bg-muted/20",
      className
    )}
    {...props}
  >
    {sortable ? (
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {sortDirection && (
          <span className="text-xs opacity-70">
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    ) : (
      children
    )}
  </th>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 
    isEditing?: boolean;
    status?: 'error' | 'warning' | 'success' | 'modified' | 'validated';
    scoreValue?: number;
  }
>(({ className, isEditing, status, scoreValue, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      isEditing && "bg-muted/30",
      status === 'error' && "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      status === 'warning' && "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      status === 'success' && "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      status === 'modified' && "bg-blue-50 dark:bg-blue-900/20 animate-pulse",
      status === 'validated' && "bg-emerald-50 dark:bg-emerald-900/20",
      className
    )}
    {...props}
  >
    {scoreValue !== undefined ? (
      <div className="flex items-center">
        <div 
          className={cn(
            "h-2 w-full rounded-full bg-muted overflow-hidden mr-2",
            scoreValue >= 80 ? "bg-green-100" : 
            scoreValue >= 60 ? "bg-yellow-100" : 
            "bg-red-100"
          )}
        >
          <div 
            className={cn(
              "h-full",
              scoreValue >= 80 ? "bg-green-500" : 
              scoreValue >= 60 ? "bg-yellow-500" : 
              "bg-red-500"
            )}
            style={{ width: `${scoreValue}%` }}
          />
        </div>
        <span className="text-xs font-medium">{scoreValue}%</span>
      </div>
    ) : (
      props.children
    )}
  </td>
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
