'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { API_BASE_URL } from '@/lib/api';

// Rule types from backend
type ExamType = 'ISA1' | 'ISA2' | 'ESA' | 'MAKEUP' | 'RETEST';
type RuleCategory = 'TIMING' | 'SEATING' | 'SCHEDULING' | 'INVIGILATION' | 'ELIGIBILITY' | 'GENERAL';

interface Rule {
  id: number;
  exam_type: ExamType;
  category: RuleCategory;
  rule_key: string;
  rule_value_int?: number;
  rule_value_float?: number;
  rule_value_str?: string;
  rule_value_bool?: boolean;
  rule_value_json?: any;
  description: string;
  is_active: boolean;
  validation_rule?: string;
  created_at: string;
  updated_at: string;
}

interface RuleFormData {
  exam_type: ExamType;
  category: RuleCategory;
  rule_key: string;
  value_type: 'int' | 'float' | 'string' | 'boolean' | 'json';
  value: string | number | boolean;
  description: string;
  is_active: boolean;
}

const EXAM_TYPES: { value: ExamType; label: string; desc: string }[] = [
  { value: 'ISA1', label: 'ISA 1', desc: 'Internal Semester Assessment 1' },
  { value: 'ISA2', label: 'ISA 2', desc: 'Internal Semester Assessment 2' },
  { value: 'ESA', label: 'ESA', desc: 'End Semester Assessment' },
  { value: 'MAKEUP', label: 'Makeup', desc: 'Makeup Examination' },
  { value: 'RETEST', label: 'Retest', desc: 'Retest Examination' }
];

const RULE_CATEGORIES: { value: RuleCategory; label: string; desc: string }[] = [
  { value: 'TIMING', label: 'Timing', desc: 'Duration, start/end times' },
  { value: 'SEATING', label: 'Seating', desc: 'Students per bench, spacing' },
  { value: 'SCHEDULING', label: 'Scheduling', desc: 'Gap days, sessions' },
  { value: 'INVIGILATION', label: 'Invigilation', desc: 'Ratios, requirements' },
  { value: 'ELIGIBILITY', label: 'Eligibility', desc: 'Attendance, prerequisites' },
  { value: 'GENERAL', label: 'General', desc: 'Other rules' }
];

const COMMON_RULES = {
  TIMING: [
    { key: 'duration_minutes', desc: 'Exam duration in minutes', type: 'int' },
    { key: 'start_time', desc: 'Default start time', type: 'string' },
    { key: 'end_time', desc: 'Default end time', type: 'string' }
  ],
  SEATING: [
    { key: 'students_per_bench', desc: 'Maximum students per bench', type: 'int' },
    { key: 'min_seat_gap', desc: 'Minimum seats between students', type: 'int' },
    { key: 'hall_capacity_percent', desc: 'Maximum hall capacity usage (%)', type: 'float' }
  ],
  SCHEDULING: [
    { key: 'min_gap_days', desc: 'Minimum days between exams for same student', type: 'int' },
    { key: 'max_exams_per_day', desc: 'Maximum exams per day', type: 'int' },
    { key: 'sessions_per_day', desc: 'Number of sessions per day', type: 'int' }
  ],
  INVIGILATION: [
    { key: 'invigilator_ratio', desc: 'Students per invigilator (e.g., 30)', type: 'int' },
    { key: 'chief_invigilator_required', desc: 'Require chief invigilator', type: 'boolean' },
    { key: 'min_invigilators_per_hall', desc: 'Minimum invigilators per hall', type: 'int' }
  ],
  ELIGIBILITY: [
    { key: 'min_attendance_percent', desc: 'Minimum attendance required (%)', type: 'float' },
    { key: 'allow_detained_students', desc: 'Allow detained students', type: 'boolean' },
    { key: 'prerequisites_required', desc: 'Check prerequisites', type: 'boolean' }
  ],
  GENERAL: [
    { key: 'hall_ticket_required', desc: 'Hall ticket required for entry', type: 'boolean' },
    { key: 'id_verification_required', desc: 'ID verification required', type: 'boolean' },
    { key: 'mobile_phones_allowed', desc: 'Mobile phones allowed in hall', type: 'boolean' }
  ]
};

export default function RulesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'ALL'>('ALL');

  const [formData, setFormData] = useState<RuleFormData>({
    exam_type: 'ISA1',
    category: 'TIMING',
    rule_key: '',
    value_type: 'int',
    value: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'EXAM_CELL' && user?.role !== 'ADMIN')) {
      router.push('/login/staff');
    } else {
      loadRules();
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    filterRules();
  }, [rules, selectedExamType, selectedCategory]);

  const loadRules = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/rules/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load rules');
      }

      const data = await response.json();
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rules');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRules = () => {
    let filtered = rules;
    
    if (selectedExamType !== 'ALL') {
      filtered = filtered.filter(rule => rule.exam_type === selectedExamType);
    }
    
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(rule => rule.category === selectedCategory);
    }
    
    setFilteredRules(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare payload based on value type
      const payload: any = {
        exam_type: formData.exam_type,
        category: formData.category,
        rule_key: formData.rule_key,
        description: formData.description,
        is_active: formData.is_active
      };

      // Set the appropriate value field
      switch (formData.value_type) {
        case 'int':
          payload.rule_value_int = parseInt(formData.value.toString());
          break;
        case 'float':
          payload.rule_value_float = parseFloat(formData.value.toString());
          break;
        case 'string':
          payload.rule_value_str = formData.value.toString();
          break;
        case 'boolean':
          payload.rule_value_bool = formData.value === true || formData.value === 'true';
          break;
        case 'json':
          try {
            payload.rule_value_json = JSON.parse(formData.value.toString());
          } catch {
            throw new Error('Invalid JSON format');
          }
          break;
      }

      const url = editingRule 
        ? `${API_BASE_URL}/api/rules/${editingRule.id}`
        : `${API_BASE_URL}/api/rules/`;
      
      const method = editingRule ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save rule');
      }

      await loadRules();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule');
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete rule');
      }

      await loadRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    
    // Determine value type and value
    let valueType: 'int' | 'float' | 'string' | 'boolean' | 'json' = 'string';
    let value: any = '';

    if (rule.rule_value_int !== null && rule.rule_value_int !== undefined) {
      valueType = 'int';
      value = rule.rule_value_int;
    } else if (rule.rule_value_float !== null && rule.rule_value_float !== undefined) {
      valueType = 'float';
      value = rule.rule_value_float;
    } else if (rule.rule_value_bool !== null && rule.rule_value_bool !== undefined) {
      valueType = 'boolean';
      value = rule.rule_value_bool;
    } else if (rule.rule_value_json) {
      valueType = 'json';
      value = JSON.stringify(rule.rule_value_json, null, 2);
    } else {
      valueType = 'string';
      value = rule.rule_value_str || '';
    }

    setFormData({
      exam_type: rule.exam_type,
      category: rule.category,
      rule_key: rule.rule_key,
      value_type: valueType,
      value,
      description: rule.description,
      is_active: rule.is_active
    });
    
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      exam_type: 'ISA1',
      category: 'TIMING',
      rule_key: '',
      value_type: 'int',
      value: '',
      description: '',
      is_active: true
    });
    setShowCreateForm(false);
    setEditingRule(null);
  };

  const getRuleValue = (rule: Rule): string => {
    if (rule.rule_value_int !== null && rule.rule_value_int !== undefined) return rule.rule_value_int.toString();
    if (rule.rule_value_float !== null && rule.rule_value_float !== undefined) return rule.rule_value_float.toString();
    if (rule.rule_value_bool !== null && rule.rule_value_bool !== undefined) return rule.rule_value_bool.toString();
    if (rule.rule_value_json) return JSON.stringify(rule.rule_value_json);
    return rule.rule_value_str || '';
  };

  const getRuleValueType = (rule: Rule): string => {
    if (rule.rule_value_int !== null && rule.rule_value_int !== undefined) return 'Integer';
    if (rule.rule_value_float !== null && rule.rule_value_float !== undefined) return 'Float';
    if (rule.rule_value_bool !== null && rule.rule_value_bool !== undefined) return 'Boolean';
    if (rule.rule_value_json) return 'JSON';
    return 'String';
  };

  if (!isAuthenticated || (user?.role !== 'EXAM_CELL' && user?.role !== 'ADMIN')) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Rules Engine</h1>
        <p className="text-text-muted">Configure scheduling and exam rules</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Controls */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-4">
            {/* Exam Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Exam Type</label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value as ExamType | 'ALL')}
                className="px-3 py-2 border border-border rounded-lg bg-white text-text"
              >
                <option value="ALL">All Types</option>
                {EXAM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RuleCategory | 'ALL')}
                className="px-3 py-2 border border-border rounded-lg bg-white text-text"
              >
                <option value="ALL">All Categories</option>
                {RULE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={() => setShowCreateForm(true)}>
            ➕ Add Rule
          </Button>
        </div>

        {/* Rules Table */}
        {isLoading ? (
          <p className="text-center py-8 text-text-muted">Loading rules...</p>
        ) : filteredRules.length === 0 ? (
          <p className="text-center py-8 text-text-muted">
            No rules found. {selectedExamType !== 'ALL' || selectedCategory !== 'ALL' ? 'Try adjusting filters or' : ''} Add your first rule to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text font-semibold">Exam Type</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Category</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Rule Key</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Value</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Type</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Status</th>
                  <th className="text-right py-2 px-3 text-text font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-border hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {rule.exam_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-text">{rule.rule_key}</p>
                      <p className="text-xs text-text-muted">{rule.description}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-text">{getRuleValue(rule)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-text-muted">{getRuleValueType(rule)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rule.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(rule)}
                        >
                          Edit
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDelete(rule.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-text mb-6">
              {editingRule ? 'Edit Rule' : 'Add New Rule'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Exam Type *
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({...formData, exam_type: e.target.value as ExamType})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  required
                >
                  {EXAM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as RuleCategory})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  required
                >
                  {RULE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} - {cat.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rule Key */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Rule Key *
                </label>
                <input
                  type="text"
                  value={formData.rule_key}
                  onChange={(e) => setFormData({...formData, rule_key: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="e.g., duration_minutes"
                  required
                />
                {formData.category !== 'GENERAL' && COMMON_RULES[formData.category] && (
                  <div className="mt-2">
                    <p className="text-xs text-text-muted mb-1">Common rules for {formData.category}:</p>
                    <div className="flex flex-wrap gap-1">
                      {COMMON_RULES[formData.category].map(rule => (
                        <button
                          key={rule.key}
                          type="button"
                          onClick={() => setFormData({
                            ...formData, 
                            rule_key: rule.key,
                            description: rule.desc,
                            value_type: rule.type as any
                          })}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-text"
                        >
                          {rule.key}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Value Type */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Value Type *
                </label>
                <select
                  value={formData.value_type}
                  onChange={(e) => setFormData({...formData, value_type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  required
                >
                  <option value="int">Integer (whole numbers)</option>
                  <option value="float">Float (decimal numbers)</option>
                  <option value="string">String (text)</option>
                  <option value="boolean">Boolean (true/false)</option>
                  <option value="json">JSON (complex data)</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Value *
                </label>
                {formData.value_type === 'boolean' ? (
                  <select
                    value={formData.value.toString()}
                    onChange={(e) => setFormData({...formData, value: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : formData.value_type === 'json' ? (
                  <textarea
                    value={formData.value.toString()}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg h-24"
                    placeholder='{"example": "value"}'
                    required
                  />
                ) : (
                  <input
                    type={formData.value_type === 'int' || formData.value_type === 'float' ? 'number' : 'text'}
                    step={formData.value_type === 'float' ? 'any' : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Human-readable description of this rule"
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-text">
                  Rule is active
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}