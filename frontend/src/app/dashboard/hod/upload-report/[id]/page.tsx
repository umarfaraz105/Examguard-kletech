'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { API_BASE_URL } from '@/lib/api';

interface ValidationReport {
  upload_id: number;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  validation_percentage: number;
  errors: Array<{
    row_number: number;
    usn: string;
    field: string;
    message: string;
    error_type: string;
  }>;
  warnings: Array<{
    row_number: number;
    usn: string;
    message: string;
  }>;
  unmatched_students: string[];
  new_courses: string[];
}

export default function UploadReportPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const uploadId = params?.id as string;

  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'HOD') {
      router.push('/login/hod');
    } else if (uploadId) {
      loadReport();
    }
  }, [isAuthenticated, user, router, uploadId]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/course-registrations/uploads/${uploadId}/report`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load report');
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'HOD') {
    return <div>Redirecting...</div>;
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
          <p className="text-red-800">{error || 'Failed to load report'}</p>
        </div>
        <Button onClick={() => router.back()}>← Back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="secondary" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-text">Validation Report</h1>
        <p className="text-text-muted">Upload ID: {report.upload_id}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-text-muted text-sm mb-2">Total Records</p>
          <p className="text-3xl font-bold text-text">{report.total_records}</p>
        </Card>

        <Card>
          <p className="text-text-muted text-sm mb-2">Valid Records</p>
          <p className="text-3xl font-bold text-green-600">{report.valid_records}</p>
        </Card>

        <Card>
          <p className="text-text-muted text-sm mb-2">Invalid Records</p>
          <p className="text-3xl font-bold text-red-600">{report.invalid_records}</p>
        </Card>

        <Card>
          <p className="text-text-muted text-sm mb-2">Validation Rate</p>
          <p className="text-3xl font-bold text-primary">
            {report.validation_percentage.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <p className="font-semibold text-text mb-3">Overall Progress</p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${report.validation_percentage}%` }}
          />
        </div>
      </Card>

      {/* Errors Section */}
      {report.errors.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">❌ Validation Errors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text font-semibold">USN</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Field</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Error Type</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Message</th>
                </tr>
              </thead>
              <tbody>
                {report.errors.map((error, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-gray-50">
                    <td className="py-3 px-3 text-text">{error.usn}</td>
                    <td className="py-3 px-3 text-text">{error.field}</td>
                    <td className="py-3 px-3">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                        {error.error_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-text-muted">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Warnings Section */}
      {report.warnings.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">⚠️ Warnings</h2>
          <div className="space-y-2">
            {report.warnings.map((warning, idx) => (
              <div
                key={idx}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
              >
                <strong>USN {warning.usn}:</strong> {warning.message}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Unmatched Students */}
      {report.unmatched_students.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">👤 Unmatched Students</h2>
          <p className="text-text-muted text-sm mb-4">
            These students are not found in the system database. They may need to be added first.
          </p>
          <div className="flex flex-wrap gap-2">
            {report.unmatched_students.map((usn) => (
              <span
                key={usn}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {usn}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* New Courses */}
      {report.new_courses.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">📚 New Courses</h2>
          <p className="text-text-muted text-sm mb-4">
            These courses are not yet defined in the system. They will be created automatically
            when the upload is approved.
          </p>
          <div className="flex flex-wrap gap-2">
            {report.new_courses.map((code) => (
              <span
                key={code}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {code}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={() => router.back()}>← Back to Uploads</Button>
        {report.validation_percentage === 100 && (
          <Button
            onClick={() => router.push(`/dashboard/hod/csv-upload`)}
            className="ml-auto"
          >
            ✅ Upload More Files
          </Button>
        )}
      </div>
    </div>
  );
}
