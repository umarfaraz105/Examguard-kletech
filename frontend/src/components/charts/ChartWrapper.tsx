'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Table, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  exportable?: boolean;
  className?: string;
  // New accessibility props
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'donut';
  dataDescription?: string;
  chartData?: any[];
  dataTableComponent?: React.ReactNode;
  keyInsights?: string[];
}

export default function ChartWrapper({
  title,
  subtitle,
  children,
  loading = false,
  error,
  onRetry,
  exportable = false,
  className = '',
  chartType = 'bar',
  dataDescription,
  chartData = [],
  dataTableComponent,
  keyInsights = [],
}: ChartWrapperProps) {
  const [showDataTable, setShowDataTable] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  
  const handleExport = React.useCallback(() => {
    if (!exportable) return;
    
    try {
      // Find the recharts container
      const chartElement = document.querySelector(`[data-chart-title="${title}"] .recharts-wrapper`);
      if (!chartElement) return;
      
      // Get the SVG element
      const svgElement = chartElement.querySelector('svg');
      if (!svgElement) return;
      
      // Create canvas for export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = svgRect.width;
      canvas.height = svgRect.height;
      
      // Create image from SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Download
        const link = document.createElement('a');
        link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [title]);

  const handleExportData = React.useCallback(() => {
    if (!chartData.length) return;
    
    try {
      // Convert chart data to CSV
      const headers = Object.keys(chartData[0]);
      const csvContent = [
        headers.join(','),
        ...chartData.map(row => 
          headers.map(header => 
            typeof row[header] === 'string' ? `"${row[header]}"` : row[header]
          ).join(',')
        )
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-data.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Data export failed:', err);
    }
  }, [chartData, title]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // Handle keyboard navigation for chart interactions
    const key = event.key;
    
    if (key === 'Enter' || key === ' ') {
      const target = event.target as HTMLElement;
      
      // Toggle data table view
      if (target.getAttribute('data-action') === 'toggle-table') {
        event.preventDefault();
        setShowDataTable(!showDataTable);
        return;
      }
      
      // Toggle description view
      if (target.getAttribute('data-action') === 'toggle-description') {
        event.preventDefault();
        setShowDescription(!showDescription);
        return;
      }
      
      // Export actions
      if (target.getAttribute('data-action') === 'export-image') {
        event.preventDefault();
        handleExport();
        return;
      }
      
      if (target.getAttribute('data-action') === 'export-data') {
        event.preventDefault();
        handleExportData();
        return;
      }
    }
  }, [showDataTable, showDescription, handleExport, handleExportData]);

  // Generate comprehensive aria-label for chart container
  const generateChartAriaLabel = React.useCallback(() => {
    let label = `${chartType} chart titled ${title}`;
    if (subtitle) label += `, ${subtitle}`;
    if (dataDescription) label += `. ${dataDescription}`;
    
    // Add data summary for screen readers
    if (chartData.length > 0) {
      if (chartType === 'pie' || chartType === 'donut') {
        label += `. Contains ${chartData.length} segments`;
      } else {
        label += `. Contains data for ${chartData.length} items`;
      }
    }
    
    return label;
  }, [chartType, title, subtitle, dataDescription, chartData.length]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32" aria-label="Loading chart title"></div>
            {subtitle && <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mt-1" aria-label="Loading chart description"></div>}
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse" aria-label={`Loading ${chartType} chart data`} role="status"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      data-chart-title={title}
      role="img"
      aria-label={generateChartAriaLabel()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900" id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600" id={`chart-subtitle-${title.replace(/\s+/g, '-').toLowerCase()}`}>
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Chart Description Toggle */}
          {(dataDescription || keyInsights.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              data-action="toggle-description"
              aria-label={`${showDescription ? 'Hide' : 'Show'} chart description and insights`}
              aria-expanded={showDescription}
            >
              <Info className="w-3 h-3 mr-1" />
              Info
            </Button>
          )}
          
          {/* Data Table Toggle */}
          {dataTableComponent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDataTable(!showDataTable)}
              data-action="toggle-table"
              aria-label={`${showDataTable ? 'Hide' : 'Show'} data table alternative`}
              aria-expanded={showDataTable}
            >
              <Table className="w-3 h-3 mr-1" />
              Data
            </Button>
          )}
          
          {/* Export Controls */}
          {exportable && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                data-action="export-image"
                aria-label="Export chart as image"
              >
                <Download className="w-3 h-3 mr-1" />
                Chart
              </Button>
              
              {chartData.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  data-action="export-data"
                  aria-label="Export chart data as CSV"
                >
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Chart Description and Insights */}
      {showDescription && (dataDescription || keyInsights.length > 0) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg" role="region" aria-labelledby={`chart-description-${title.replace(/\s+/g, '-').toLowerCase()}`}>
          <h4 id={`chart-description-${title.replace(/\s+/g, '-').toLowerCase()}`} className="font-medium text-blue-900 mb-2">
            Chart Description
          </h4>
          {dataDescription && (
            <p className="text-sm text-blue-800 mb-2">{dataDescription}</p>
          )}
          {keyInsights.length > 0 && (
            <div>
              <h5 className="font-medium text-blue-900 mb-1 text-sm">Key Insights:</h5>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                {keyInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Data Table Alternative */}
      {showDataTable && dataTableComponent && (
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden" role="region" aria-labelledby={`chart-table-${title.replace(/\s+/g, '-').toLowerCase()}`}>
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h4 id={`chart-table-${title.replace(/\s+/g, '-').toLowerCase()}`} className="font-medium text-gray-900">
              Data Table - {title}
            </h4>
          </div>
          <div className="p-4">
            {dataTableComponent}
          </div>
        </div>
      )}
      
      <div 
        className="chart-content"
        aria-describedby={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()} chart-subtitle-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {children}
      </div>
    </div>
  );
}
