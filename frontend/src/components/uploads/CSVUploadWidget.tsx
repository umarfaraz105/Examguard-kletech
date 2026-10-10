/**
 * CSVUploadWidget - Specialized component for CSV file uploads with validation and preview
 */

'use client';

import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, AlertTriangle, CheckCircle, Eye, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload } from './FileUpload';
import { UseFileUploadOptions } from '@/lib/hooks/useFileUpload';
import { FILE_TYPE_CONFIGS, validateCSVStructure } from '@/lib/upload-utils';
import { cn } from '@/lib/utils';

export interface CSVUploadWidgetProps extends Omit<UseFileUploadOptions, 'maxFiles'> {
  className?: string;
  entityType: 'students' | 'courses' | 'rooms' | 'registrations' | 'faculty' | 'departments';
  requiredHeaders: string[];
  optionalHeaders?: string[];
  sampleData?: Record<string, string>[];
  showPreview?: boolean;
  onValidationComplete?: (isValid: boolean, headers: string[], errors: string[]) => void;
}

const ENTITY_CONFIGS = {
  students: {
    name: 'Students',
    icon: '👨‍🎓',
    requiredHeaders: ['usn', 'name', 'email', 'branch', 'semester'],
    optionalHeaders: ['section', 'phone', 'address'],
    sampleData: [
      { usn: '4NM21CS001', name: 'John Doe', email: 'john.doe@example.com', branch: 'CSE', semester: '5' },
      { usn: '4NM21CS002', name: 'Jane Smith', email: 'jane.smith@example.com', branch: 'CSE', semester: '5' }
    ]
  },
  courses: {
    name: 'Courses',
    icon: '📚',
    requiredHeaders: ['code', 'name', 'branch', 'semester', 'credits'],
    optionalHeaders: ['examType', 'department'],
    sampleData: [
      { code: 'CS101', name: 'Computer Programming', branch: 'CSE', semester: '1', credits: '4' },
      { code: 'MA101', name: 'Engineering Mathematics', branch: 'ALL', semester: '1', credits: '4' }
    ]
  },
  rooms: {
    name: 'Rooms',
    icon: '🏫',
    requiredHeaders: ['code', 'name', 'capacity', 'rows', 'columns'],
    optionalHeaders: ['building', 'floor', 'features'],
    sampleData: [
      { code: 'R101', name: 'Room 101', capacity: '60', rows: '10', columns: '6', building: 'Main Block' },
      { code: 'R102', name: 'Room 102', capacity: '40', rows: '8', columns: '5', building: 'Main Block' }
    ]
  },
  faculty: {
    name: 'Faculty',
    icon: '👨‍🏫',
    requiredHeaders: ['email', 'name', 'department'],
    optionalHeaders: ['phone', 'designation', 'expertise'],
    sampleData: [
      { email: 'prof.smith@college.edu', name: 'Dr. Smith', department: 'CSE', designation: 'Professor' },
      { email: 'dr.jones@college.edu', name: 'Dr. Jones', department: 'ECE', designation: 'Associate Professor' }
    ]
  },
  registrations: {
    name: 'Course Registrations',
    icon: '📝',
    requiredHeaders: ['usn', 'courseCode'],
    optionalHeaders: ['registrationDate', 'status'],
    sampleData: [
      { usn: '4NM21CS001', courseCode: 'CS101', registrationDate: '2024-01-15', status: 'active' },
      { usn: '4NM21CS001', courseCode: 'MA101', registrationDate: '2024-01-15', status: 'active' }
    ]
  },
  departments: {
    name: 'Departments',
    icon: '🏢',
    requiredHeaders: ['name', 'code'],
    optionalHeaders: ['hodName', 'hodEmail', 'description'],
    sampleData: [
      { name: 'Computer Science Engineering', code: 'CSE', hodName: 'Dr. Smith', hodEmail: 'hod.cse@college.edu' },
      { name: 'Electronics & Communication', code: 'ECE', hodName: 'Dr. Johnson', hodEmail: 'hod.ece@college.edu' }
    ]
  }
};

export const CSVUploadWidget: React.FC<CSVUploadWidgetProps> = ({
  className,
  entityType,
  requiredHeaders,
  optionalHeaders = [],
  sampleData = [],
  showPreview = true,
  onValidationComplete,
  ...uploadOptions
}) => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    headers: string[];
    errors: string[];
    preview: string[][];
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const config = ENTITY_CONFIGS[entityType];
  const finalRequiredHeaders = requiredHeaders.length > 0 ? requiredHeaders : config.requiredHeaders;
  const finalOptionalHeaders = optionalHeaders.length > 0 ? optionalHeaders : (config.optionalHeaders || []);
  const finalSampleData = sampleData.length > 0 ? sampleData : config.sampleData;

  const handleFileValidation = useCallback(async (files: any[]) => {
    if (files.length === 0) return;

    const file = files[0].file;
    try {
      const validation = await validateCSVStructure(file, finalRequiredHeaders);
      
      // Read first few rows for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(0, 6); // Header + 5 rows
        const preview = lines.map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));
        
        const result = {
          isValid: validation.valid,
          headers: validation.headers || [],
          errors: validation.error ? [validation.error] : [],
          preview
        };
        
        setValidationResult(result);
        onValidationComplete?.(result.isValid, result.headers, result.errors);
      };
      reader.readAsText(file);
      
    } catch (error) {
      const result = {
        isValid: false,
        headers: [],
        errors: ['Failed to validate CSV file'],
        preview: []
      };
      setValidationResult(result);
      onValidationComplete?.(false, [], ['Failed to validate CSV file']);
    }

    uploadOptions.onUploadComplete?.(files);
  }, [finalRequiredHeaders, onValidationComplete, uploadOptions]);

  const downloadSample = useCallback(() => {
    const headers = [...finalRequiredHeaders, ...finalOptionalHeaders];
    const csvContent = [
      headers.join(','),
      ...finalSampleData.map(row => 
        headers.map(header => row[header as keyof typeof row] || '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_sample.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [entityType, finalRequiredHeaders, finalOptionalHeaders, finalSampleData]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Entity info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{config.icon}</span>
            {config.name} CSV Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Headers info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Required Columns:</h4>
              <div className="flex flex-wrap gap-1">
                {finalRequiredHeaders.map(header => (
                  <Badge key={header} variant="destructive" className="text-xs">
                    {header}
                  </Badge>
                ))}
              </div>
            </div>
            {finalOptionalHeaders.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Optional Columns:</h4>
                <div className="flex flex-wrap gap-1">
                  {finalOptionalHeaders.map(header => (
                    <Badge key={header} variant="secondary" className="text-xs">
                      {header}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sample download */}
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Need a template?</p>
              <p className="text-xs text-gray-600">Download a sample CSV with the correct format</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="h-4 w-4 mr-2" />
              Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation results */}
      {validationResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {validationResult.isValid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Validation Passed
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Validation Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.isValid ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  ✓ All required columns found. File is ready for import.
                </p>
                <div>
                  <h5 className="text-sm font-medium mb-1">Detected Columns:</h5>
                  <div className="flex flex-wrap gap-1">
                    {validationResult.headers.map(header => (
                      <Badge 
                        key={header} 
                        variant={finalRequiredHeaders.includes(header) ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {header}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700">✗ {error}</p>
                ))}
              </div>
            )}

            {/* Preview button */}
            {validationResult.preview.length > 0 && showPreview && (
              <div className="mt-3">
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>CSV Preview</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {validationResult.preview[0]?.map((header, index) => (
                              <th key={index} className="text-left p-2 font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.preview.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-2">
                                  {cell || <span className="text-gray-400">empty</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload area */}
      <FileUpload
        accept=".csv,text/csv"
        {...FILE_TYPE_CONFIGS.csv}
        maxFiles={1}
        placeholder={`Drop your ${config.name.toLowerCase()} CSV file here or click to select`}
        onUploadComplete={handleFileValidation}
        {...uploadOptions}
      />

      {/* Upload tips */}
      <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium">Upload Tips:</h5>
        <ul className="space-y-1 ml-4">
          <li>• Ensure the first row contains column headers</li>
          <li>• Use UTF-8 encoding for special characters</li>
          <li>• Avoid empty rows in your data</li>
          <li>• Maximum file size: 2MB</li>
          <li>• Use comma (,) as delimiter</li>
        </ul>
      </div>
    </div>
  );
};
