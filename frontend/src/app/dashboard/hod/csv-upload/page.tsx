'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';

interface UploadResponse {
  id: number;
  department_id: number;
  department_name: string;
  hod_id: number;
  hod_name: string;
  status: string;
  file_name: string;
  record_count: number;
  valid_count: number;
  invalid_count: number;
  validation_percentage: number;
  uploaded_at: string;
}

interface UploadedFile {
  id: number;
  department_name: string;
  status: string;
  record_count: number;
  valid_count: number;
  validation_percentage: number;
  uploaded_at: string;
  hod_name: string;
}

export default function CSVUploadPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'HOD') {
      router.push('/login/hod');
    } else {
      loadUploads();
    }
  }, [isAuthenticated, user, router]);

  const loadUploads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/course-registrations/uploads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load uploads');
      }

      const data = await response.json();
      setUploadedFiles(data);
    } catch (err) {
      console.error('Error loading uploads:', err);
    }
  };

  const downloadTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/course-registrations/template`);

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'course_registration_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download template');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/course-registrations/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      setSuccess(`File uploaded successfully! ${data.valid_count}/${data.record_count} records are valid.`);
      
      // Reload uploads
      loadUploads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (!isAuthenticated || user?.role !== 'HOD') {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">CSV Upload</h1>
        <p className="text-text-muted">Upload course registration data for your department</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <h2 className="text-xl font-bold text-text mb-6">Upload Course Registration File</h2>

        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-text-muted mb-3">
            Start by downloading the CSV template with the required columns and format.
          </p>
          <Button
            onClick={downloadTemplate}
            disabled={isLoading}
            variant="secondary"
          >
            📥 Download Template
          </Button>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary-light/10'
              : 'border-border bg-surface hover:bg-gray-50'
          }`}
        >
          <p className="text-2xl mb-2">📄</p>
          <p className="font-semibold text-text mb-2">Drag and drop your CSV file here</p>
          <p className="text-text-muted text-sm mb-4">or click to select from your computer</p>
          
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
            disabled={isLoading}
            className="hidden"
            id="file-input"
          />
          
          <label htmlFor="file-input">
            <Button
              as="span"
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? '⏳ Uploading...' : '📁 Select File'}
            </Button>
          </label>
        </div>

        {/* Requirements */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-border">
          <h3 className="font-semibold text-text mb-3">Required CSV Columns:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-muted">
            <div>• USN (Student ID)</div>
            <div>• student_name</div>
            <div>• department_code</div>
            <div>• semester</div>
            <div>• academic_year</div>
            <div>• course_code</div>
            <div>• course_name</div>
            <div>• course_type</div>
            <div>• credits</div>
            <div>• exam_duration_minutes</div>
            <div>• email</div>
          </div>
        </div>
      </Card>

      {/* Upload History */}
      <Card>
        <h2 className="text-xl font-bold text-text mb-6">Upload History</h2>

        {uploadedFiles.length === 0 ? (
          <p className="text-text-muted text-center py-8">No uploads yet</p>
        ) : (
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-text">{file.department_name}</p>
                    <p className="text-sm text-text-muted">
                      Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      file.status
                    )}`}
                  >
                    {file.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-text-muted">Total Records</p>
                    <p className="text-lg font-bold text-text">{file.record_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Valid Records</p>
                    <p className="text-lg font-bold text-text">{file.valid_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Validation Rate</p>
                    <p className="text-lg font-bold text-text">
                      {file.validation_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${file.validation_percentage}%` }}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/hod/upload-report/${file.id}`)}
                  >
                    📋 View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'UPLOADED':
      return 'bg-blue-100 text-blue-800';
    case 'VALIDATED':
      return 'bg-green-100 text-green-800';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
