/**
 * ExportDropdown Component
 * Dropdown menu with multiple export format options
 */

'use client'

import * as React from 'react'
import { 
  Download, 
  FileText, 
  File, 
  Table, 
  Printer, 
  Eye,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useExport, usePrint } from '@/lib/hooks/useExport'
import { type ExportFormat, type ExportOptions } from '@/lib/export-utils'
import { type PrintOptions } from '@/lib/print-utils'

interface ExportDropdownProps {
  data?: any[]
  elementId?: string
  filename?: string
  formats?: ExportFormat[]
  options?: ExportOptions
  printOptions?: PrintOptions
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  align?: 'start' | 'center' | 'end'
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  onExportSuccess?: (format: ExportFormat) => void
  onExportError?: (error: string, format: ExportFormat) => void
}

const formatConfig = {
  csv: {
    icon: Table,
    label: 'Export as CSV',
    description: 'Comma-separated values file'
  },
  excel: {
    icon: FileText,
    label: 'Export as Excel',
    description: 'Microsoft Excel spreadsheet'
  },
  pdf: {
    icon: File,
    label: 'Export as PDF',
    description: 'Portable document format'
  },
  json: {
    icon: FileText,
    label: 'Export as JSON',
    description: 'JavaScript object notation'
  },
  print: {
    icon: Printer,
    label: 'Print Document',
    description: 'Send to printer'
  }
} as const

const ExportDropdown = React.forwardRef<HTMLButtonElement, ExportDropdownProps>(
  ({
    data,
    elementId,
    filename,
    formats = ['csv', 'excel', 'pdf', 'json', 'print'],
    options = {},
    printOptions = {},
    variant = 'outline',
    size = 'default',
    align = 'end',
    children,
    className,
    disabled = false,
    onExportSuccess,
    onExportError,
    ...props
  }, ref) => {
    const { state: exportState, exportData, exportElement } = useExport()
    const { state: printState, print, preview } = usePrint()
    const [open, setOpen] = React.useState(false)

    const isLoading = exportState.isExporting || printState.isPrinting
    const currentOperation = exportState.currentOperation

    const handleExport = React.useCallback(async (format: ExportFormat) => {
      setOpen(false)
      
      try {
        if (format === 'print') {
          if (!elementId) {
            throw new Error('Element ID is required for printing')
          }
          await print(elementId, printOptions)
        } else if (elementId && format === 'pdf') {
          // For PDF export from elements
          await exportElement(elementId, format, { filename, ...options })
        } else if (data) {
          // For data export
          await exportData(format, data, { filename, ...options })
        } else {
          throw new Error('Either data or elementId must be provided')
        }
        
        onExportSuccess?.(format)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Export failed'
        onExportError?.(errorMessage, format)
      }
    }, [
      data,
      elementId,
      filename,
      options,
      printOptions,
      exportData,
      exportElement,
      print,
      onExportSuccess,
      onExportError
    ])

    const handlePreview = React.useCallback(() => {
      setOpen(false)
      
      if (!elementId) {
        onExportError?.('Element ID is required for preview', 'print')
        return
      }

      try {
        preview(elementId, printOptions)
        onExportSuccess?.('print')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Preview failed'
        onExportError?.(errorMessage, 'print')
      }
    }, [elementId, printOptions, preview, onExportSuccess, onExportError])

    // Filter available formats based on props
    const availableFormats = formats.filter(format => {
      if (format === 'pdf' || format === 'print') {
        return !!elementId // PDF and print require elementId
      }
      return !!data // Other formats require data
    })

    const hasError = !!exportState.error || !!printState.error
    const errorMessage = exportState.error || printState.error

    return (
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <Button
            ref={ref}
            variant={hasError ? 'destructive' : variant}
            size={size}
            disabled={disabled || isLoading || availableFormats.length === 0}
            loading={isLoading}
            className={cn(
              'inline-flex items-center gap-2',
              className
            )}
            title={hasError ? errorMessage : currentOperation}
            {...props}
          >
            {!isLoading && <Download className="h-4 w-4" />}
            {children || 'Export'}
            {!isLoading && <ChevronDown className="h-4 w-4" />}
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={cn(
              'z-50 min-w-[220px] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
            )}
            align={align}
            sideOffset={4}
          >
            {/* Show current operation if exporting */}
            {isLoading && currentOperation && (
              <>
                <div className="px-3 py-2 text-sm text-gray-500">
                  {currentOperation}
                </div>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
              </>
            )}

            {/* Export format options */}
            {availableFormats.map((format) => {
              const config = formatConfig[format]
              const Icon = config.icon

              return (
                <DropdownMenu.Item
                  key={format}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
                    'hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900',
                    'disabled:pointer-events-none disabled:opacity-50'
                  )}
                  onSelect={() => handleExport(format)}
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="text-gray-900">{config.label}</span>
                    <span className="text-xs text-gray-500">{config.description}</span>
                  </div>
                </DropdownMenu.Item>
              )
            })}

            {/* Print preview option */}
            {elementId && formats.includes('print') && (
              <>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                <DropdownMenu.Item
                  className={cn(
                    'relative flex cursor-pointer select-none items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
                    'hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900',
                    'disabled:pointer-events-none disabled:opacity-50'
                  )}
                  onSelect={handlePreview}
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="text-gray-900">Print Preview</span>
                    <span className="text-xs text-gray-500">Preview before printing</span>
                  </div>
                </DropdownMenu.Item>
              </>
            )}

            {/* Show error if any */}
            {hasError && (
              <>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                <div className="px-3 py-2 text-xs text-red-600">
                  {errorMessage}
                </div>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    )
  }
)

ExportDropdown.displayName = 'ExportDropdown'

export { ExportDropdown }