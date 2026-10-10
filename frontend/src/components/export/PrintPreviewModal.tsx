/**
 * PrintPreviewModal Component
 * Modal showing print preview with layout options
 */

'use client'

import * as React from 'react'
import { 
  Printer, 
  Eye, 
  X, 
  RotateCw,
  FileText,
  Settings,
  Monitor
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { usePrint } from '@/lib/hooks/useExport'
import { type PrintOptions, generatePrintHTML, getPrintStyles } from '@/lib/print-utils'

interface PrintPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  elementId: string
  title?: string
  defaultOptions?: PrintOptions
  onPrint?: () => void
  onError?: (error: string) => void
}

const PrintPreviewModal = React.forwardRef<HTMLDivElement, PrintPreviewModalProps>(
  ({
    open,
    onOpenChange,
    elementId,
    title = 'Print Preview',
    defaultOptions = {},
    onPrint,
    onError,
    ...props
  }, ref) => {
    const { state, print } = usePrint()
    const [options, setOptions] = React.useState<PrintOptions>(defaultOptions)
    const [previewContent, setPreviewContent] = React.useState<string>('')
    const [activeTab, setActiveTab] = React.useState('preview')
    const iframeRef = React.useRef<HTMLIFrameElement>(null)

    // Generate preview content when modal opens or options change
    React.useEffect(() => {
      if (open && elementId) {
        try {
          const element = document.getElementById(elementId)
          if (!element) {
            onError?.(`Element with ID "${elementId}" not found`)
            return
          }

          // Clone the element to avoid modifying the original
          const clonedElement = element.cloneNode(true) as HTMLElement
          
          // Remove elements that shouldn't be printed
          const elementsToRemove = clonedElement.querySelectorAll('.no-print, button:not(.print-button), .dropdown, .modal')
          elementsToRemove.forEach(el => el.remove())

          // Show print-only elements
          const printOnlyElements = clonedElement.querySelectorAll('.print-only')
          printOnlyElements.forEach(el => {
            (el as HTMLElement).style.display = 'block'
          })

          // Generate print HTML with styles
          const styles = getPrintStyles(options)
          const timestamp = new Date().toLocaleString('en-IN')
          
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${options.title || title}</title>
                ${styles}
              </head>
              <body>
                ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ''}
                
                ${options.header || options.title ? `
                  <div class="print-header">
                    ${options.title ? `<div class="print-title">${options.title}</div>` : ''}
                    ${options.header ? `<div>${options.header}</div>` : ''}
                    <div class="text-small">Generated on ${timestamp}</div>
                  </div>
                ` : ''}
                
                <div class="print-content">
                  ${clonedElement.outerHTML}
                </div>
                
                ${options.footer ? `
                  <div class="print-footer">${options.footer}</div>
                ` : ''}
              </body>
            </html>
          `
          
          setPreviewContent(html)
        } catch (error) {
          onError?.(error instanceof Error ? error.message : 'Failed to generate preview')
        }
      }
    }, [open, elementId, options, title, onError])

    // Update iframe content when preview content changes
    React.useEffect(() => {
      if (previewContent && iframeRef.current) {
        const iframe = iframeRef.current
        iframe.onload = () => {
          if (iframe.contentDocument) {
            iframe.contentDocument.open()
            iframe.contentDocument.write(previewContent)
            iframe.contentDocument.close()
          }
        }
        iframe.src = 'about:blank'
      }
    }, [previewContent])

    const handlePrint = React.useCallback(async () => {
      try {
        await print(elementId, options)
        onPrint?.()
        onOpenChange(false)
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Print failed')
      }
    }, [elementId, options, print, onPrint, onOpenChange, onError])

    const updateOption = React.useCallback((key: keyof PrintOptions, value: any) => {
      setOptions(prev => ({ ...prev, [key]: value }))
    }, [])

    const updateMargin = React.useCallback((side: string, value: string) => {
      setOptions(prev => ({
        ...prev,
        margins: {
          ...prev.margins,
          [side]: value
        }
      }))
    }, [])

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          ref={ref}
          className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          {...props}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary-500" />
              {title}
            </DialogTitle>
          </DialogHeader>

          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
            <Tabs.List className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
              <Tabs.Trigger
                value="preview"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                )}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Preview
              </Tabs.Trigger>
              <Tabs.Trigger
                value="settings"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                )}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content 
              value="preview" 
              className="flex-1 min-h-0 mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="h-full border border-gray-200 rounded-lg bg-white overflow-hidden">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  title="Print Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </Tabs.Content>

            <Tabs.Content 
              value="settings"
              className="flex-1 min-h-0 mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="h-full overflow-y-auto space-y-6 pr-2">
                {/* Page Layout */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Page Layout</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orientation
                      </label>
                      <select
                        value={options.orientation || 'portrait'}
                        onChange={(e) => updateOption('orientation', e.target.value as 'portrait' | 'landscape')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Size
                      </label>
                      <select
                        value={options.pageSize || 'A4'}
                        onChange={(e) => updateOption('pageSize', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Margins */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Margins</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Top
                      </label>
                      <input
                        type="text"
                        value={options.margins?.top || '20mm'}
                        onChange={(e) => updateMargin('top', e.target.value)}
                        placeholder="20mm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Right
                      </label>
                      <input
                        type="text"
                        value={options.margins?.right || '15mm'}
                        onChange={(e) => updateMargin('right', e.target.value)}
                        placeholder="15mm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bottom
                      </label>
                      <input
                        type="text"
                        value={options.margins?.bottom || '20mm'}
                        onChange={(e) => updateMargin('bottom', e.target.value)}
                        placeholder="20mm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Left
                      </label>
                      <input
                        type="text"
                        value={options.margins?.left || '15mm'}
                        onChange={(e) => updateMargin('left', e.target.value)}
                        placeholder="15mm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Headers and Content */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Content</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Title
                      </label>
                      <input
                        type="text"
                        value={options.title || ''}
                        onChange={(e) => updateOption('title', e.target.value)}
                        placeholder="Document title (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Text
                      </label>
                      <input
                        type="text"
                        value={options.header || ''}
                        onChange={(e) => updateOption('header', e.target.value)}
                        placeholder="Header text (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Footer Text
                      </label>
                      <input
                        type="text"
                        value={options.footer || ''}
                        onChange={(e) => updateOption('footer', e.target.value)}
                        placeholder="Footer text (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Watermark
                      </label>
                      <input
                        type="text"
                        value={options.watermark || ''}
                        onChange={(e) => updateOption('watermark', e.target.value)}
                        placeholder="Watermark text (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>

          {/* Error display */}
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {state.error}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={state.isPrinting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePrint}
              disabled={state.isPrinting}
              loading={state.isPrinting}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

PrintPreviewModal.displayName = 'PrintPreviewModal'

export { PrintPreviewModal }
