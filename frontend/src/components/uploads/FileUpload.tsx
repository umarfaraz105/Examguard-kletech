/**
 * FileUpload Component - Single file upload with drag & drop
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload, UseFileUploadOptions } from '@/lib/hooks/useFileUpload';
import { formatFileSize, FILE_TYPE_CONFIGS } from '@/lib/upload-utils';

export interface FileUploadProps extends UseFileUploadOptions {
  className?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  compact?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  className,
  accept,
  multiple = false,
  disabled = false,
  placeholder = 'Drop files here or click to select',
  showPreview = true,
  compact = false,
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
    retryUpload
  } = useFileUpload(uploadOptions);

  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [disabled, addFiles]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
    if (file.type.includes('csv')) return '📋';
    return '📎';
  };

  const renderFileItem = (uploadedFile: typeof files[0]) => {
    const { file, status, progress, error, preview } = uploadedFile;
    
    if (compact) {
      return (
        <div key={uploadedFile.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <span className="text-sm">{getFileIcon(file)}</span>
          <span className="text-sm truncate flex-1">{file.name}</span>
          {status === 'uploading' && progress && (
            <span className="text-xs text-gray-500">{progress.percentage}%</span>
          )}
          {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFile(uploadedFile.id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div key={uploadedFile.id} className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {showPreview && preview ? (
                <img src={preview} alt={file.name} className="h-10 w-10 object-cover rounded" />
              ) : (
                <File className="h-10 w-10 text-gray-400" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>

            {/* Progress bar */}
            {status === 'uploading' && progress && (
              <div className="space-y-1">
                <Progress value={progress.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{progress.percentage}%</span>
                  {progress.speed && (
                    <span>{formatFileSize(progress.speed)}/s</span>
                  )}
                </div>
              </div>
            )}

            {/* Status messages */}
            {status === 'success' && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Upload complete</span>
              </div>
            )}

            {status === 'error' && error && (
              <div className="flex items-start gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex gap-1 ml-2">
            {status === 'error' && (
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
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
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
          disabled && 'cursor-not-allowed opacity-50',
          compact && 'p-4'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          aria-label="File upload"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className={cn('text-gray-400', compact ? 'h-6 w-6' : 'h-8 w-8')} />
          <div>
            <p className={cn('text-gray-600', compact && 'text-sm')}>{placeholder}</p>
            {!compact && accept && (
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: {accept.split(',').join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(renderFileItem)}
          
          {/* Action buttons */}
          {!uploadOptions.autoUpload && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status !== 'pending')}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Files'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={clearFiles}
                disabled={uploading}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Preset configurations for common use cases
export const ImageUpload: React.FC<Omit<FileUploadProps, 'accept'>> = (props) => (
  <FileUpload
    accept="image/jpeg,image/png,image/gif,image/webp"
    {...FILE_TYPE_CONFIGS.images}
    showPreview={true}
    {...props}
  />
);

export const DocumentUpload: React.FC<Omit<FileUploadProps, 'accept'>> = (props) => (
  <FileUpload
    accept="application/pdf,.doc,.docx,.xls,.xlsx"
    {...FILE_TYPE_CONFIGS.documents}
    showPreview={false}
    {...props}
  />
);

export const CSVUpload: React.FC<Omit<FileUploadProps, 'accept'>> = (props) => (
  <FileUpload
    accept=".csv,text/csv"
    {...FILE_TYPE_CONFIGS.csv}
    showPreview={false}
    {...props}
  />
);
