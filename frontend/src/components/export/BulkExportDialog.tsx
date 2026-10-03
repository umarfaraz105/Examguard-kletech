/**
 * BulkExportDialog Component
 * Dialog for batch export with progress tracking and format selection
 */

'use client'

import * as React from 'react'
import { 
  Download, 
  X, 
  Check, 
  FileText, 
  File, 
  Table,
  Plus,
  Minus
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import * as Progress from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'
import { useExport } from '@/lib/hooks/useExport'
import { type ExportFormat, type ExportOptions, generateFilename } from '@/lib/export-utils'

interface ExportItem {
  id: string
  name: string
  format: ExportFormat
  data: any[]
  filename?: string
  options?: ExportOptions
}

interface BulkExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ExportItem[]
  title?: string
  description?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

const formatConfig = {
  csv: {
    icon: Table,
    label: 'CSV',
    color: 'text-green-600'
  },
  excel: {
    icon: FileText,
    label: 'Excel',
    color: 'text-green-600'
  },
  pdf: {
    icon: File,
    label: 'PDF',
    color: 'text-red-600'
  },
  json: {
    icon: FileText,
    label: 'JSON',
    color: 'text-blue-600'
  },
  print: {
    icon: FileText,
    label: 'Print',
    color: 'text-gray-600'
  }
} as const

const BulkExportDialog = React.forwardRef<HTMLDivElement, BulkExportDialogProps>(
  ({
    open,
    onOpenChange,
    items,
    title = 'Bulk Export',
    description = 'Export multiple datasets in different formats',
    onSuccess,
    onError,
    ...props
  }, ref) => {
    const { state, bulkExport, reset } = useExport()
    const [selectedItems, setSelectedItems] = React.useState<string[]>([])
    const [customFilenames, setCustomFilenames] = React.useState<Record<string, string>>({})

    // Initialize selected items when dialog opens
    React.useEffect(() => {
      if (open && items.length > 0) {
        setSelectedItems(items.map(item => item.id))
        // Initialize custom filenames
        const filenames: Record<string, string> = {}
        items.forEach(item => {
          filenames[item.id] = item.filename || item.name
        })
        setCustomFilenames(filenames)
      }
    }, [open, items])

    // Reset state when dialog closes
    React.useEffect(() => {
      if (!open) {
        reset()
        setSelectedItems([])
        setCustomFilenames({})
      }
    }, [open, reset])

    const toggleItem = React.useCallback((itemId: string) => {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      )
    }, [])

    const toggleAll = React.useCallback(() => {
      setSelectedItems(prev => 
        prev.length === items.length ? [] : items.map(item => item.id)
      )
    }, [items])

    const updateFilename = React.useCallback((itemId: string, filename: string) => {
      setCustomFilenames(prev => ({ ...prev, [itemId]: filename }))
    }, [])

    const handleExport = React.useCallback(async () => {
      if (selectedItems.length === 0) {
        onError?.('Please select at least one item to export')
        return
      }

      try {
        const operations = selectedItems
          .map(itemId => items.find(item => item.id === itemId))
          .filter((item): item is ExportItem => !!item)
          .map(item => ({
            format: item.format,
            data: item.data,
            filename: customFilenames[item.id] || item.filename || item.name,
            options: item.options
          }))

        await bulkExport(operations)
        onSuccess?.()
        onOpenChange(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bulk export failed'
        onError?.(errorMessage)
      }
    }, [selectedItems, items, customFilenames, bulkExport, onSuccess, onError, onOpenChange])

    const selectedCount = selectedItems.length
    const totalCount = items.length
    const isAllSelected = selectedCount === totalCount
    const isPartialSelected = selectedCount > 0 && selectedCount < totalCount

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          ref={ref}
          className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          {...props}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary-500" />
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col">
            {/* Progress indicator */}
            {state.isExporting && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {state.currentOperation || 'Exporting...'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {state.progress}%
                  </span>
                </div>
                <Progress.Root className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <Progress.Indicator 
                    className="h-full w-full flex-1 bg-primary-500 transition-all duration-300 ease-out"
                    style={{ transform: `translateX(-${100 - state.progress}%)` }}
                  />
                </Progress.Root>
              </div>
            )}

            {/* Error display */}
            {state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {state.error}
              </div>
            )}

            {/* Selection controls */}
            <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAll}
                  className={cn(
                    "flex items-center justify-center w-5 h-5 border-2 rounded",
                    isAllSelected 
                      ? "bg-primary-500 border-primary-500 text-white" 
                      : isPartialSelected
                        ? "bg-primary-100 border-primary-500 text-primary-500"
                        : "border-gray-300"
                  )}
                >
                  {isAllSelected && <Check className="h-3 w-3" />}
                  {isPartialSelected && !isAllSelected && <Minus className="h-3 w-3" />}
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedCount}/{totalCount})
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Items list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
              {items.map((item) => {
                const isSelected = selectedItems.includes(item.id)
                const config = formatConfig[item.format]
                const Icon = config.icon

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 border rounded-lg transition-colors",
                      isSelected 
                        ? "border-primary-200 bg-primary-50" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "flex items-center justify-center w-5 h-5 border-2 rounded mt-0.5",
                          isSelected 
                            ? "bg-primary-500 border-primary-500 text-white" 
                            : "border-gray-300 hover:border-primary-500"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={cn("h-4 w-4", config.color)} />
                          <span className="font-medium text-gray-900 truncate">
                            {item.name}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            "bg-gray-100 text-gray-700"
                          )}>
                            {config.label}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-2">
                          {Array.isArray(item.data) ? item.data.length : 1} record{Array.isArray(item.data) && item.data.length !== 1 ? 's' : ''}
                        </div>

                        {/* Custom filename input */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 whitespace-nowrap">
                            Filename:
                          </label>
                          <input
                            type="text"
                            value={customFilenames[item.id] || ''}
                            onChange={(e) => updateFilename(item.id, e.target.value)}
                            placeholder={`${item.name}.${item.format}`}
                            disabled={!isSelected || state.isExporting}
                            className={cn(
                              "flex-1 min-w-0 px-2 py-1 text-xs border rounded",
                              "focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
                              "disabled:bg-gray-50 disabled:text-gray-500",
                              isSelected ? "bg-white" : "bg-gray-50"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={state.isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedCount === 0 || state.isExporting}
              loading={state.isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

BulkExportDialog.displayName = 'BulkExportDialog'

export { BulkExportDialog }