'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { plansAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function NewPlanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    exam_type: 'ISA1',
    academic_year: '2024-25',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await plansAPI.create(formData);
      router.push(`/plans/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-primary hover:text-primary-dark flex items-center gap-2 mb-4 font-medium">
          ← Back to Plans
        </button>
        <h1 className="text-3xl font-bold text-text">Create New Exam Plan</h1>
        <p className="text-text-muted mt-1">Set up a new examination schedule</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-primary-light border border-primary text-primary px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Plan Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., ISA-1 December 2024"
            required
          />

          <div>
            <label className="block text-sm font-medium text-text mb-1">Exam Type</label>
            <select
              value={formData.exam_type}
              onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="ISA1">ISA-1 (Internal Semester Assessment 1)</option>
              <option value="ISA2">ISA-2 (Internal Semester Assessment 2)</option>
              <option value="ESA">ESA (End Semester Assessment)</option>
            </select>
          </div>

          <Input
            label="Academic Year"
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            placeholder="e.g., 2024-25"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add any additional notes about this exam plan..."
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary" loading={loading}>
              Create Plan
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}