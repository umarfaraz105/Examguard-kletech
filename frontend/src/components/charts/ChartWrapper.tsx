'use client';

import React from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  exportable?: boolean;
  className?: string;
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
}: ChartWrapperProps) {
  const handleExport = () => {
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
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            {subtitle && <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mt-1"></div>}
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
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
      aria-label={`${title} chart${subtitle ? `: ${subtitle}` : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {exportable && (
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            title="Export as PNG"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </button>
        )}
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
}
