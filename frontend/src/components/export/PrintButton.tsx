/**
 * PrintButton Component - Print functionality with preview options
 */

'use client';

import React, { useState } from 'react';
import { Printer, Eye, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/toast';
import { printElement, showPrintPreview, type PrintOptions } from '@/lib/print-utils';

export interface PrintButtonProps {
  targetElementId: string;
  title?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  showSettings?: boolean;
  defaultOptions?: PrintOptions;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
  onPrintError?: (error: string) => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  targetElementId,
  title = 'Print Document',
  variant = 'outline',
  size = 'default',
  className,
  disabled = false,
  showPreview = true,
  showSettings = true,
  defaultOptions = {},
  onPrintStart,
  onPrintComplete,
  onPrintError
}) => {
  const [printing, setPrinting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [options, setOptions] = useState<PrintOptions>({
    title,
    orientation: 'portrait',
    pageSize: 'A4',
    margins: '20mm',
    showHeader: true,
    showFooter: true,
    scale: 1,
    ...defaultOptions
  });
  
  const { toast } = useToast();

  const handlePrint = async () => {
    const element = document.getElementById(targetElementId);
    if (!element) {
      const error = `Element with ID "${targetElementId}" not found`;
      toast({
        title: 'Print Error',
        description: error,
        variant: 'destructive'
      });
      onPrintError?.(error);
      return;
    }

    setPrinting(true);
    onPrintStart?.();

    try {
      printElement(targetElementId, options);
      
      // Simulate print completion (actual print dialog is handled by browser)
      setTimeout(() => {
        setPrinting(false);
        onPrintComplete?.();
        toast({
          title: 'Print Ready',
          description: 'Print dialog opened successfully',
          variant: 'default'
        });
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Print failed';
      setPrinting(false);
      onPrintError?.(errorMessage);
      
      toast({
        title: 'Print Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handlePreview = () => {
    const element = document.getElementById(targetElementId);
    if (!element) {
      toast({
        title: 'Preview Error',
        description: `Element with ID "${targetElementId}" not found`,
        variant: 'destructive'
      });
      return;
    }

    try {
      showPrintPreview(element.outerHTML, options.title);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Preview failed';
      toast({
        title: 'Preview Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const updateOption = (key: keyof PrintOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!showPreview && !showSettings) {
    // Simple print button
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || printing}
        onClick={handlePrint}
      >
        {printing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {printing ? 'Printing...' : 'Print'}
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || printing}
        onClick={handlePrint}
      >
        {printing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {printing ? 'Printing...' : 'Print'}
      </Button>

      {showPreview && (
        <Button
          variant="ghost"
          size={size}
          disabled={disabled}
          onClick={handlePreview}
          title="Print Preview"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}

      {showSettings && (
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size={size}
              disabled={disabled}
              title="Print Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Print Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <input
                  id="title"
                  type="text"
                  value={options.title || ''}
                  onChange={(e) => updateOption('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select
                    value={options.orientation}
                    onValueChange={(value: 'portrait' | 'landscape') => updateOption('orientation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pageSize">Page Size</Label>
                  <Select
                    value={options.pageSize}
                    onValueChange={(value: 'A4' | 'A3' | 'Letter') => updateOption('pageSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="margins">Margins</Label>
                <Select
                  value={options.margins}
                  onValueChange={(value: string) => updateOption('margins', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10mm">Small (10mm)</SelectItem>
                    <SelectItem value="20mm">Normal (20mm)</SelectItem>
                    <SelectItem value="30mm">Large (30mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showHeader">Include Header</Label>
                  <Switch
                    id="showHeader"
                    checked={options.showHeader}
                    onCheckedChange={(checked) => updateOption('showHeader', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showFooter">Include Footer</Label>
                  <Switch
                    id="showFooter"
                    checked={options.showFooter}
                    onCheckedChange={(checked) => updateOption('showFooter', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scale">Scale ({Math.round((options.scale || 1) * 100)}%)</Label>
                <input
                  id="scale"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={options.scale || 1}
                  onChange={(e) => updateOption('scale', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {options.watermark !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="watermark">Watermark Text (Optional)</Label>
                  <input
                    id="watermark"
                    type="text"
                    value={options.watermark || ''}
                    onChange={(e) => updateOption('watermark', e.target.value)}
                    placeholder="e.g., CONFIDENTIAL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setSettingsOpen(false);
                handlePreview();
              }}>
                Preview with Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PrintButton;
