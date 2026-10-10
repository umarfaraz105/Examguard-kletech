/**
 * ImageUploadWidget - Specialized component for image uploads with preview and editing
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Camera, Crop, RotateCcw, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload } from './FileUpload';
import { UseFileUploadOptions } from '@/lib/hooks/useFileUpload';
import { FILE_TYPE_CONFIGS, formatFileSize } from '@/lib/upload-utils';
import { cn } from '@/lib/utils';

export interface ImageUploadWidgetProps extends Omit<UseFileUploadOptions, 'maxFiles'> {
  className?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'free';
  maxDimensions?: { width: number; height: number };
  showPreview?: boolean;
  allowCrop?: boolean;
  allowRotate?: boolean;
  quality?: number;
  placeholder?: string;
}

export const ImageUploadWidget: React.FC<ImageUploadWidgetProps> = ({
  className,
  aspectRatio = 'free',
  maxDimensions,
  showPreview = true,
  allowCrop = false,
  allowRotate = false,
  quality = 0.8,
  placeholder,
  ...uploadOptions
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleUploadComplete = useCallback((files: any[]) => {
    if (files.length > 0 && files[0].url) {
      setSelectedImage(files[0].url);
    }
    uploadOptions.onUploadComplete?.(files);
  }, [uploadOptions]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '4:3': return 'aspect-[4/3]';
      default: return '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview area */}
      {showPreview && selectedImage && (
        <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4">
          <div className={cn('relative overflow-hidden rounded-lg', getAspectRatioClass())}>
            <img 
              src={selectedImage} 
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Image Preview</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <img 
                      src={selectedImage} 
                      alt="Full size preview"
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              
              {allowCrop && (
                <Button variant="secondary" size="sm">
                  <Crop className="h-4 w-4 mr-2" />
                  Crop
                </Button>
              )}
              
              {allowRotate && (
                <Button variant="secondary" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rotate
                </Button>
              )}
              
              <Button variant="secondary" size="sm" asChild>
                <a href={selectedImage} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>

          {/* Image info */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary">
                <Camera className="h-3 w-3 mr-1" />
                Image
              </Badge>
              {maxDimensions && (
                <Badge variant="outline">
                  Max: {maxDimensions.width}x{maxDimensions.height}
                </Badge>
              )}
              <Badge variant="outline">
                Quality: {Math.round(quality * 100)}%
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedImage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!selectedImage && (
        <FileUpload
          accept="image/jpeg,image/png,image/gif,image/webp"
          {...FILE_TYPE_CONFIGS.images}
          maxFiles={1}
          showPreview={true}
          placeholder={placeholder || "Drop an image here or click to select"}
          onUploadComplete={handleUploadComplete}
          {...uploadOptions}
        />
      )}

      {/* Upload constraints info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
        <p>• Maximum size: {formatFileSize(FILE_TYPE_CONFIGS.images.maxSizeBytes!)}</p>
        {maxDimensions && (
          <p>• Maximum dimensions: {maxDimensions.width}x{maxDimensions.height}px</p>
        )}
        {aspectRatio !== 'free' && (
          <p>• Aspect ratio: {aspectRatio.replace(':', '∶')}</p>
        )}
      </div>
    </div>
  );
};
