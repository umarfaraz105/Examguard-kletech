# Implementation Plan: File Upload Components

This plan covers the creation of comprehensive, reusable file upload components with validation, progress tracking, and error handling for the ExamGuard examination management system frontend.

## Project Context

**Technology Stack:**
- Next.js 14 with TypeScript
- React 18 with React Hook Form
- Zod validation
- Axios for API calls
- Radix UI components
- Tailwind CSS with KLE theme
- Lucide React icons

**Build System:** npm scripts (dev, build, lint, type-check)
**Test Strategy:** TypeScript compilation verification via `npm run type-check`

## Implementation Plan

- [ ] 1. Create the upload utilities library in `src/lib/upload-utils.ts`.
      File validation helpers, MIME type detection, size formatting, sanitization functions.
      Files: src/lib/upload-utils.ts
      Verify: `npm run type-check` passes without errors for the new file.

- [ ] 2. Add file upload validation schemas to `src/lib/validations.ts`.
      Extend existing Zod schema patterns with file upload specific validations following the established patterns.
      Files: src/lib/validations.ts
      Verify: `npm run type-check` passes and schemas can be imported without errors.

- [ ] 3. Create the base file upload hook in `src/lib/hooks/useFileUpload.ts`.
      Single file upload state management, progress tracking, error handling following existing useApi patterns.
      Files: src/lib/hooks/useFileUpload.ts
      Verify: `npm run type-check` passes and hook exports can be imported.

- [ ] 4. Create the multi-file upload hook in `src/lib/hooks/useMultiUpload.ts`.
      Queue management, batch operations, individual file tracking extending the base hook pattern.
      Files: src/lib/hooks/useMultiUpload.ts
      Verify: `npm run type-check` passes and multi-upload logic compiles correctly.

- [ ] 5. Add file upload API endpoints to `src/lib/api.ts`.
      Extend existing API patterns with file upload methods using FormData and progress callbacks.
      Files: src/lib/api.ts
      Verify: `npm run type-check` passes and API methods follow existing axios patterns.

- [ ] 6. Create the uploads components directory and base FileUpload component.
      Single file drag & drop with progress bar following existing UI component patterns from components/ui/.
      Files: src/components/uploads/FileUpload.tsx
      Verify: `npm run type-check` passes and component renders without TypeScript errors.

- [ ] 7. Create the MultiFileUpload component in uploads directory.
      Multiple file queue with batch operations, individual progress tracking, remove/retry functionality.
      Files: src/components/uploads/MultiFileUpload.tsx
      Verify: `npm run type-check` passes and component integrates with useMultiUpload hook.

- [ ] 8. Create the ImageUpload component with preview functionality.
      Image-specific upload with thumbnail previews, dimension validation, crop/resize options.
      Files: src/components/uploads/ImageUpload.tsx
      Verify: `npm run type-check` passes and image preview functionality compiles.

- [ ] 9. Create the DocumentUpload component for office documents.
      PDF/Excel/Word format validation, file type icons, document metadata extraction.
      Files: src/components/uploads/DocumentUpload.tsx
      Verify: `npm run type-check` passes and document validation logic works.

- [ ] 10. Create the CSVUpload component for data import.
       CSV structure validation, header validation, data preview, column mapping interface.
       Files: src/components/uploads/CSVUpload.tsx
       Verify: `npm run type-check` passes and CSV parsing functionality compiles.

- [ ] 11. Create the barrel export file for uploads components.
       Export all upload components from a single index file following existing component patterns.
       Files: src/components/uploads/index.ts
       Verify: `npm run type-check` passes and all exports are accessible.

- [ ] 12. Create the test uploads page for visual verification.
       Demo page showcasing all upload components with different configurations and use cases.
       Files: src/app/test-uploads/page.tsx
       Verify: `npm run dev` starts successfully and page renders at /test-uploads route.

- [ ] 13. Build and verify the complete upload system.
       Run full build process and verify all components work together without errors.
       Files: All upload-related files
       Verify: `npm run build` completes successfully without TypeScript or build errors.

## File Details

### src/lib/upload-utils.ts
**Key exports:** 
- `validateFileSize(file: File, maxMB: number): boolean`
- `validateFileType(file: File, allowedTypes: string[]): boolean`
- `sanitizeFileName(fileName: string): string`
- `formatFileSize(bytes: number): string`
- `getMimeTypeIcon(mimeType: string): LucideIcon`
- `createFilePreview(file: File): Promise<string>`
- `validateImageDimensions(file: File, maxW: number, maxH: number): Promise<boolean>`

**Dependencies:** Extends existing form-utils.ts patterns, uses Lucide icons

### src/lib/validations.ts (additions)
**New schemas:**
- `fileUploadSchema` - Basic file validation
- `imageUploadSchema` - Image-specific validation with dimensions
- `documentUploadSchema` - Office document validation
- `csvUploadSchema` - Enhanced version of existing CSV schema
- `multiFileUploadSchema` - Batch upload validation

**Pattern:** Follows existing Zod patterns with kleTheme color integration

### src/lib/hooks/useFileUpload.ts
**Key exports:**
- `useFileUpload(options: FileUploadOptions): FileUploadReturn`
- Interfaces: `FileUploadOptions`, `FileUploadReturn`, `UploadProgress`

**Features:** Progress tracking, error handling, retry logic, abort capability
**Dependencies:** Uses existing useApi patterns, axios for upload

### src/lib/hooks/useMultiUpload.ts
**Key exports:**
- `useMultiUpload(options: MultiUploadOptions): MultiUploadReturn`
- Queue management functions, batch operations

**Dependencies:** Built on useFileUpload, extends patterns from useApi.ts

### src/lib/api.ts (additions)
**New methods in uploadAPI namespace:**
- `uploadFile(file: File, options?: UploadOptions): Promise<UploadResponse>`
- `uploadMultiple(files: FileList, options?: UploadOptions): Promise<UploadResponse[]>`
- `uploadImage(file: File, options?: ImageUploadOptions): Promise<ImageUploadResponse>`
- `uploadDocument(file: File, options?: DocumentUploadOptions): Promise<DocumentUploadResponse>`
- `uploadCSV(file: File, entityType: string): Promise<CSVUploadResponse>`

**Pattern:** Follows existing API patterns with FormData and progress callbacks

### Upload Components Architecture
**Base Component Pattern:** All components extend Button.tsx patterns with kleTheme integration
- Drag & drop zones with visual feedback
- Progress indicators using existing UI patterns
- Error handling with toast notifications
- KLE theme color scheme (primary-500, error-500, success-500)
- Responsive design following existing grid patterns

### src/components/uploads/FileUpload.tsx
**Props Interface:**
```typescript
interface FileUploadProps {
  accept?: string[]
  maxSize?: number
  onUpload?: (file: File) => void
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
  disabled?: boolean
  variant?: 'default' | 'compact' | 'minimal'
}
```

### src/components/uploads/MultiFileUpload.tsx
**Features:** Queue management, batch progress, individual file status, remove/retry
**Props:** Extends FileUploadProps with maxFiles, allowDuplicates, batchSize options

### src/components/uploads/ImageUpload.tsx
**Features:** Image previews, dimension validation, crop interface, format conversion
**Props:** Includes maxDimensions, allowCrop, outputFormat, quality options

### src/components/uploads/DocumentUpload.tsx
**Features:** Document type icons, metadata extraction, format validation
**Supported:** PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX following existing csvUploadSchema patterns

### src/components/uploads/CSVUpload.tsx
**Features:** Header validation, data preview, column mapping, import preview
**Integration:** Uses existing dataExtractionAPI methods from api.ts

### src/app/test-uploads/page.tsx
**Content:** Demo of all upload components with different configurations
**Layout:** Uses existing card patterns from components/ui/Card.tsx
**Navigation:** Follows existing app router patterns (see plans/page.tsx structure)

## Verification Strategy

Each step includes TypeScript compilation verification ensuring type safety. The final build step confirms all components integrate correctly with the existing ExamGuard system. The test page provides visual verification that all upload components work as expected with the KLE theme and existing UI patterns.

## Dependencies Integration

- Uses existing Zod validation patterns from validations.ts
- Follows Button.tsx and Input.tsx component patterns
- Integrates with kleTheme color system
- Uses existing API patterns from api.ts
- Leverages React Hook Form patterns from form-utils.ts
- Compatible with existing toast notification system