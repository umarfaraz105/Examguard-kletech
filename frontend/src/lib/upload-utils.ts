/**
 * Upload utility functions for file handling, validation, and processing
 */

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxFiles?: number;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
}

export interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: FileUploadProgress;
  error?: string;
  preview?: string;
}

// File type validation
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
};

// File extension validation
export const validateFileExtension = (file: File, allowedExtensions: string[]): boolean => {
  const extension = file.name.toLowerCase().split('.').pop();
  return extension ? allowedExtensions.includes(extension) : false;
};

// File size validation
export const validateFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate file preview URL
export const generateFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Sanitize filename
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
};

// Validate uploaded file
export const validateFile = (
  file: File, 
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } => {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  if (!validateFileSize(file, maxSizeBytes)) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(maxSizeBytes)}`
    };
  }

  if (allowedTypes.length > 0 && !validateFileType(file, allowedTypes)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  if (allowedExtensions.length > 0 && !validateFileExtension(file, allowedExtensions)) {
    return {
      valid: false,
      error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
};

// CSV validation helper
export const validateCSVStructure = async (
  file: File,
  expectedHeaders: string[]
): Promise<{ valid: boolean; error?: string; headers?: string[] }> => {
  return new Promise((resolve) => {
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      resolve({ valid: false, error: 'File must be a CSV' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length === 0) {
          resolve({ valid: false, error: 'CSV file is empty' });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          resolve({
            valid: false,
            error: `Missing required columns: ${missingHeaders.join(', ')}`,
            headers
          });
          return;
        }

        resolve({ valid: true, headers });
      } catch (error) {
        resolve({ valid: false, error: 'Invalid CSV format' });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: 'Failed to read CSV file' });
    };

    reader.readAsText(file);
  });
};

// Generate unique file ID
export const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Compress image if needed
export const compressImage = (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob!),
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// File upload progress calculator
export class UploadProgressTracker {
  private startTime: number = 0;
  private loaded: number = 0;

  start(): void {
    this.startTime = Date.now();
    this.loaded = 0;
  }

  update(loaded: number, total: number): FileUploadProgress {
    this.loaded = loaded;
    const elapsed = (Date.now() - this.startTime) / 1000; // seconds
    const speed = elapsed > 0 ? loaded / elapsed : 0;
    
    return {
      loaded,
      total,
      percentage: Math.round((loaded / total) * 100),
      speed
    };
  }

  getEstimatedTimeRemaining(loaded: number, total: number): number {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = elapsed > 0 ? loaded / elapsed : 0;
    const remaining = total - loaded;
    
    return speed > 0 ? remaining / speed : 0;
  }
}

// Common file type configurations
export const FILE_TYPE_CONFIGS = {
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxSizeBytes: 5 * 1024 * 1024 // 5MB
  },
  documents: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    maxSizeBytes: 10 * 1024 * 1024 // 10MB
  },
  csv: {
    allowedTypes: ['text/csv', 'application/csv'],
    allowedExtensions: ['csv'],
    maxSizeBytes: 5 * 1024 * 1024 // 5MB
  },
  archives: {
    allowedTypes: ['application/zip', 'application/x-zip-compressed'],
    allowedExtensions: ['zip'],
    maxSizeBytes: 50 * 1024 * 1024 // 50MB
  }
};

// ============================================================================
// Security-Enhanced File Validation (Task #20)
// ============================================================================

/** Strict security limits enforced for all uploads */
export const SECURE_FILE_LIMITS = {
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB hard cap
  allowedMimeTypes: new Set([
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ]),
  allowedExtensions: new Set([
    'csv', 'xlsx', 'xls', 'pdf', 'jpg', 'jpeg', 'png', 'webp',
  ]),
} as const;

/**
 * Validates a file against strict security limits.
 * Checks: size, MIME type whitelist, extension whitelist, and filename safety.
 * Returns an error message string on failure, or null on success.
 */
export function secureValidateFile(file: File): string | null {
  // 1. Size check
  if (file.size > SECURE_FILE_LIMITS.maxFileSizeBytes) {
    return `File exceeds maximum allowed size of ${formatFileSize(SECURE_FILE_LIMITS.maxFileSizeBytes)}`;
  }

  // 2. MIME type whitelist
  if (!SECURE_FILE_LIMITS.allowedMimeTypes.has(file.type as string)) {
    return `File type '${file.type}' is not permitted`;
  }

  // 3. Extension whitelist (cross-check against MIME spoofing)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!SECURE_FILE_LIMITS.allowedExtensions.has(ext as string)) {
    return `File extension '.${ext}' is not permitted`;
  }

  // 4. Filename safety (no path traversal, no null bytes)
  if (/\.\.|[\/\\\x00]/.test(file.name)) {
    return 'Filename contains unsafe characters';
  }

  return null;
}
