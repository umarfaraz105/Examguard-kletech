/**
 * ExportButton Component - Generic export button with format selection
 */

'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/lib/toast';
import { 
  exportToCSV, 
  exportToExcel, 
  exportToJSON, 
  exportToPDF,
  type ExportColumn 
} from '@/lib/export-utils';

export interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename?: string;
  formats?: Array<'csv' | 'excel' | 'json' | 'pdf'>;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: string) => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  filename = 'export',
  formats = ['csv', 'excel', 'json'],
  disabled = false,
  variant = 'outline',
  size = 'default',
  className,
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    if (disabled || data.length === 0) {
      toast({
        title: 'Export Error',
        description: 'No data available to export',
        variant: 'destructive'
      });
      return;
    }

    setExporting(format);
    onExportStart?.();

    try {
      const fileExtension = format === 'excel' ? 'xlsx' : format;
      const fullFilename = `${filename}.${fileExtension}`;

      switch (format) {
        case 'csv':
          exportToCSV(data, columns, { filename: fullFilename });
          break;
        case 'excel':
          exportToExcel(data, columns, { filename: fullFilename });
          break;
        case 'json':
          exportToJSON(data, fullFilename);
          break;
        case 'pdf':
          // For PDF export, we need an element ID
          // This is a simplified version - in practice you'd need to prepare the content
          toast({
            title: 'PDF Export',
            description: 'PDF export requires specific content preparation',
            variant: 'destructive'
          });
          return;
      }

      toast({
        title: 'Export Successful',
        description: `Data exported as ${format.toUpperCase()} successfully`,
        variant: 'default'
      });

      onExportComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      
      toast({
        title: 'Export Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      onExportError?.(errorMessage);
    } finally {
      setExporting(null);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4 mr-2" />;
      case 'json':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'pdf':
        return <FileImage className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'csv':
        return 'Export as CSV';
      case 'excel':
        return 'Export as Excel';
      case 'json':
        return 'Export as JSON';
      case 'pdf':
        return 'Export as PDF';
      default:
        return `Export as ${format.toUpperCase()}`;
    }
  };

  const isExporting = exporting !== null;

  if (formats.length === 1) {
    // Single format - render as regular button
    const format = formats[0];
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || isExporting}
        onClick={() => handleExport(format)}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          getFormatIcon(format)
        )}
        {isExporting ? 'Exporting...' : getFormatLabel(format)}
      </Button>
    );
  }

  // Multiple formats - render as dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled || isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? `Exporting ${exporting}...` : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {formats.map((format, index) => (
          <React.Fragment key={format}>
            <DropdownMenuItem
              onClick={() => handleExport(format)}
              disabled={isExporting}
            >
              {getFormatIcon(format)}
              {getFormatLabel(format)}
            </DropdownMenuItem>
            {index < formats.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
