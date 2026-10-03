'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Eye, Trash2, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVFile {
  id: string;
  filename: string;
  upload_date: string;
  file_type: 'students' | 'courses' | 'invigilators' | 'rooms' | 'schedules';
  status: 'processing' | 'completed' | 'failed';
  records_count?: number;
  error_message?: string;
}

export default function CSVManagementPage() {
  const [files, setFiles] = useState<CSVFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/csv-files', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching CSV files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, fileType: string) => {
    setUploadLoading(fileType);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchFiles();
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadLoading(null);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/csv-files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fileTypes = [
    { key: 'students', label: 'Students', description: 'Student enrollment data' },
    { key: 'courses', label: 'Courses', description: 'Course information and schedules' },
    { key: 'invigilators', label: 'Invigilators', description: 'Faculty and staff details' },
    { key: 'rooms', label: 'Rooms', description: 'Examination venues and capacity' },
    { key: 'schedules', label: 'Schedules', description: 'Exam timetables and slots' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CSV File Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage CSV data files for the examination system</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fileTypes.map((type) => (
              <div key={type.key} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, type.key);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={uploadLoading === type.key}
                  />
                  {uploadLoading === type.key && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No CSV files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <h3 className="font-medium">{file.filename}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline" className="capitalize">
                            {file.file_type}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                          {file.records_count && (
                            <>
                              <span>•</span>
                              <span>{file.records_count} records</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {file.error_message && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {file.error_message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}