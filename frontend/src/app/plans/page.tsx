'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { plansAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { HelpButton } from '@/components/help/HelpSystem';
import Link from 'next/link';

export default function PlansPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlans();
    }
  }, [isAuthenticated, fetchPlans]);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await plansAPI.list(filter || undefined);
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await plansAPI.delete(id);
        fetchPlans();
      } catch (error: any) {
        alert(error.response?.data?.detail || 'Failed to delete plan');
      }
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'kle-status-warning',
    APPROVED: 'kle-status-success',
    PUBLISHED: 'bg-primary-light text-primary',
    ARCHIVED: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text">Exam Plans</h1>
            <HelpButton 
              content="Learn how to create and manage exam plans"
              tourId="exam-creation-tour"
              className="text-gray-400 hover:text-primary-500"
            />
          </div>
          <p className="text-text-muted mt-1">Manage examination schedules and plans</p>
        </div>
        <Link href="/plans/new">
          <Button variant="primary" className="create-plan-btn">Create New Plan</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : plans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.exam_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.academic_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[plan.status as keyof typeof statusColors]}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.scheduled_exams_count || 0} scheduled
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link href={`/plans/${plan.id}`} className="text-primary hover:text-primary-dark font-medium">
                        View
                      </Link>
                      {plan.status === 'DRAFT' && (
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No exam plans found</p>
            <p className="text-sm mt-1">Create your first plan to get started</p>
            <Link href="/plans/new">
              <Button variant="primary" className="mt-4">Create New Plan</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}