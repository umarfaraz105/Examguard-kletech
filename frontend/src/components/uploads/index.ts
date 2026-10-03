/**
 * Upload components barrel export
 */

export { FileUpload, ImageUpload, DocumentUpload, CSVUpload } from './FileUpload';
export type { FileUploadProps } from './FileUpload';

export { MultiFileUpload } from './MultiFileUpload';
export type { MultiFileUploadProps } from './MultiFileUpload';

export { ImageUploadWidget } from './ImageUploadWidget';
export type { ImageUploadWidgetProps } from './ImageUploadWidget';

export { CSVUploadWidget } from './CSVUploadWidget';
export type { CSVUploadWidgetProps } from './CSVUploadWidget';

// Re-export upload utilities and hooks
export {
  formatFileSize,
  validateFile,
  generateFileId,
  FILE_TYPE_CONFIGS
} from '@/lib/upload-utils';

export { useFileUpload, useMultiFileUpload } from '@/lib/hooks/useFileUpload';
export type { 
  UseFileUploadOptions, 
  UseFileUploadReturn,
  UseMultiFileUploadOptions 
} from '@/lib/hooks/useFileUpload';