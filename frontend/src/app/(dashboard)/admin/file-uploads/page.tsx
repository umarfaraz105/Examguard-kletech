/**
 * File Upload Test Page - Demonstrates all upload components
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileUpload, 
  MultiFileUpload, 
  ImageUploadWidget, 
  CSVUploadWidget 
} from '@/components/uploads';

const FileUploadTestPage: React.FC = () => {
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  const handleUploadComplete = (files: any[], type: string) => {
    console.log(`${type} upload complete:`, files);
    setUploadResults(prev => [...prev, { type, files, timestamp: new Date() }]);
  };

  const handleUploadError = (error: string, type: string) => {
    console.error(`${type} upload error:`, error);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">File Upload Components</h1>
        <p className="text-gray-600 mt-2">
          Test and demonstration page for all file upload components with various configurations.
        </p>
      </div>

      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single File</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Files</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="csv">CSV Import</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic file upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic File Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onUploadComplete={(files) => handleUploadComplete(files, 'Basic')}
                  onUploadError={(error) => handleUploadError(error, 'Basic')}
                  maxSizeBytes={10 * 1024 * 1024}
                  placeholder="Upload any file (max 10MB)"
                />
              </CardContent>
            </Card>

            {/* Document upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept="application/pdf,.doc,.docx,.xls,.xlsx"
                  allowedTypes={[
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  ]}
                  maxSizeBytes={25 * 1024 * 1024}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Document')}
                  onUploadError={(error) => handleUploadError(error, 'Document')}
                  placeholder="Upload PDF, DOC, DOCX, XLS, or XLSX files"
                />
              </CardContent>
            </Card>

            {/* Compact upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compact Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  compact={true}
                  autoUpload={true}
                  maxSizeBytes={5 * 1024 * 1024}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Compact')}
                  onUploadError={(error) => handleUploadError(error, 'Compact')}
                  placeholder="Compact view with auto-upload"
                />
              </CardContent>
            </Card>

            {/* Auto upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  autoUpload={true}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Auto')}
                  onUploadError={(error) => handleUploadError(error, 'Auto')}
                  placeholder="Files upload automatically when selected"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="multiple" className="space-y-6">
          <div className="grid gap-6">
            {/* Multi file upload - list view */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multiple Files - List View</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiFileUpload
                  maxFiles={5}
                  showStats={true}
                  gridView={false}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Multi-List')}
                  onUploadError={(error) => handleUploadError(error, 'Multi-List')}
                  maxSizeBytes={10 * 1024 * 1024}
                />
              </CardContent>
            </Card>

            {/* Multi file upload - grid view */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multiple Files - Grid View</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiFileUpload
                  maxFiles={8}
                  showStats={true}
                  gridView={true}
                  accept="image/*"
                  showPreview={true}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Multi-Grid')}
                  onUploadError={(error) => handleUploadError(error, 'Multi-Grid')}
                  maxSizeBytes={5 * 1024 * 1024}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image upload with preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Image Upload - Free Aspect</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadWidget
                  aspectRatio="free"
                  maxDimensions={{ width: 1920, height: 1080 }}
                  allowCrop={true}
                  allowRotate={true}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Image-Free')}
                  onUploadError={(error) => handleUploadError(error, 'Image-Free')}
                />
              </CardContent>
            </Card>

            {/* Square image upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Picture - Square</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadWidget
                  aspectRatio="square"
                  maxDimensions={{ width: 800, height: 800 }}
                  allowCrop={true}
                  quality={0.9}
                  placeholder="Upload profile picture (square format)"
                  onUploadComplete={(files) => handleUploadComplete(files, 'Profile')}
                  onUploadError={(error) => handleUploadError(error, 'Profile')}
                />
              </CardContent>
            </Card>

            {/* Banner image upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Banner Image - 16:9</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadWidget
                  aspectRatio="16:9"
                  maxDimensions={{ width: 1920, height: 1080 }}
                  allowCrop={true}
                  quality={0.8}
                  placeholder="Upload banner image (16:9 format)"
                  onUploadComplete={(files) => handleUploadComplete(files, 'Banner')}
                  onUploadError={(error) => handleUploadError(error, 'Banner')}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="csv" className="space-y-6">
          <div className="grid gap-6">
            {/* Student CSV upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Data Import</CardTitle>
              </CardHeader>
              <CardContent>
                <CSVUploadWidget
                  entityType="students"
                  requiredHeaders={['usn', 'name', 'email', 'branch', 'semester']}
                  optionalHeaders={['section', 'phone']}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Students-CSV')}
                  onUploadError={(error) => handleUploadError(error, 'Students-CSV')}
                  onValidationComplete={(isValid, headers, errors) => {
                    console.log('Student CSV validation:', { isValid, headers, errors });
                  }}
                />
              </CardContent>
            </Card>

            {/* Course CSV upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Data Import</CardTitle>
              </CardHeader>
              <CardContent>
                <CSVUploadWidget
                  entityType="courses"
                  requiredHeaders={['code', 'name', 'branch', 'semester', 'credits']}
                  optionalHeaders={['examType', 'department']}
                  onUploadComplete={(files) => handleUploadComplete(files, 'Courses-CSV')}
                  onUploadError={(error) => handleUploadError(error, 'Courses-CSV')}
                  onValidationComplete={(isValid, headers, errors) => {
                    console.log('Course CSV validation:', { isValid, headers, errors });
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upload Results</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUploadResults([])}
            >
              Clear Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadResults.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{result.type}</Badge>
                    <span className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Files uploaded: {result.files.length}</p>
                    {result.files.map((file: any, fileIndex: number) => (
                      <div key={fileIndex} className="text-gray-600">
                        • {file.file.name} ({(file.file.size / 1024).toFixed(1)} KB)
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadTestPage;