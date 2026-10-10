/**
 * MultiFileUpload Component - Multiple file upload with queue management
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMultiFileUpload, UseMultiFileUploadOptions } from '@/lib/hooks/useFileUpload';
import { formatFileSize } from '@/lib/upload-utils';

export interface MultiFileUploadProps extends UseMultiFileUploadOptions {
  className?: string;
  accept?: string;
  disabled?: boolean;
  showPreview?: boolean;
  showStats?: boolean;
  gridView?: boolean;
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  className,
  accept,
  disabled = false,
  showPreview = true,
  showStats = true,
  gridView = false,
  ...uploadOptions
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const {
    files,
    uploading,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    retryUpload,
    canAddMore,
    remainingSlots
  } = useMultiFileUpload(uploadOptions);

  const handleClick = useCallback(() => {
    if (disabled || !canAddMore) return;
    fileInputRef.current?.click();
  }, [disabled, canAddMore]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && canAddMore) setIsDragOver(true);
  }, [disabled, canAddMore]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || !canAddMore) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [disabled, canAddMore, addFiles]);

  const getStatusCounts = () => {
    const counts = {
      pending: files.filter(f => f.status === 'pending').length,
      uploading: files.filter(f => f.status === 'uploading').length,
      success: files.filter(f => f.status === 'success').length,
      error: files.filter(f => f.status === 'error').length
    };
    return counts;
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.file.size, 0);
  };

  const getOverallProgress = () => {
    if (files.length === 0) return 0;
    const totalProgress = files.reduce((sum, file) => {
      if (file.status === 'success') return sum + 100;
      if (file.status === 'uploading' && file.progress) return sum + file.progress.percentage;
      return sum;
    }, 0);
    return Math.round(totalProgress / files.length);
  };

  const renderFileGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((uploadedFile) => (
        <div key={uploadedFile.id} className="relative border rounded-lg p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFile(uploadedFile.id)}
            className="absolute top-1 right-1 h-6 w-6 p-0 z-10"
          >
            <X className="h-3 w-3" />
          </Button>

          {showPreview && uploadedFile.preview ? (
            <img 
              src={uploadedFile.preview} 
              alt={uploadedFile.file.name}
              className="w-full h-24 object-cover rounded mb-2"
            />
          ) : (
            <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
              <File className="h-8 w-8 text-gray-400" />
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.file.size)}</p>
            
            {uploadedFile.status === 'uploading' && uploadedFile.progress && (
              <Progress value={uploadedFile.progress.percentage} className="h-1" />
            )}

            <div className="flex items-center justify-between">
              {uploadedFile.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {uploadedFile.status === 'error' && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {uploadedFile.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              
              {uploadedFile.status === 'error' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retryUpload(uploadedFile.id)}
                  className="h-6 text-xs"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFileList = () => (
    <div className="space-y-2">
      {files.map((uploadedFile) => (
        <div key={uploadedFile.id} className="border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {showPreview && uploadedFile.preview ? (
                <img 
                  src={uploadedFile.preview} 
                  alt={uploadedFile.file.name}
                  className="h-10 w-10 object-cover rounded"
                />
              ) : (
                <File className="h-10 w-10 text-gray-400 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(uploadedFile.file.size)}</span>
                  <Badge 
                    variant={
                      uploadedFile.status === 'success' ? 'default' :
                      uploadedFile.status === 'error' ? 'destructive' :
                      uploadedFile.status === 'uploading' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {uploadedFile.status}
                  </Badge>
                </div>
                
                {uploadedFile.status === 'uploading' && uploadedFile.progress && (
                  <div className="mt-2">
                    <Progress value={uploadedFile.progress.percentage} className="h-1" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{uploadedFile.progress.percentage}%</span>
                      {uploadedFile.progress.speed && (
                        <span>{formatFileSize(uploadedFile.progress.speed)}/s</span>
                      )}
                    </div>
                  </div>
                )}

                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {uploadedFile.status === 'error' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retryUpload(uploadedFile.id)}
                  disabled={uploading}
                >
                  Retry
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(uploadedFile.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const statusCounts = getStatusCounts();
  const totalSize = getTotalSize();
  const overallProgress = getOverallProgress();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats */}
      {showStats && files.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total files:</span>
            <Badge variant="outline">{files.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Size:</span>
            <Badge variant="outline">{formatFileSize(totalSize)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Progress:</span>
            <div className="flex items-center gap-2">
              <Progress value={overallProgress} className="w-20 h-2" />
              <span className="text-sm text-gray-600">{overallProgress}%</span>
            </div>
          </div>
          {statusCounts.success > 0 && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              ✓ {statusCounts.success} completed
            </Badge>
          )}
          {statusCounts.error > 0 && (
            <Badge variant="destructive">
              ✗ {statusCounts.error} failed
            </Badge>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          'hover:border-primary hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          (disabled || !canAddMore) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          disabled={disabled || !canAddMore}
          className="hidden"
          aria-label="Multiple file upload"
        />

        <div className="flex flex-col items-center gap-2">
          {canAddMore ? (
            <Plus className="h-8 w-8 text-gray-400" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          <div>
            {canAddMore ? (
              <>
                <p className="text-gray-600">
                  Drop more files here or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {remainingSlots} slots remaining
                </p>
              </>
            ) : (
              <p className="text-gray-600">
                Maximum files reached ({uploadOptions.maxFiles})
              </p>
            )}
            {accept && (
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: {accept.split(',').join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          {gridView ? renderFileGrid() : renderFileList()}
          
          {/* Action buttons */}
          {!uploadOptions.autoUpload && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status !== 'pending')}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading {statusCounts.uploading} files...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload {statusCounts.pending} files
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={clearFiles}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
