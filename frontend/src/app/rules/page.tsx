'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rulesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

interface Rule {
  id: number;
  exam_type: string;
  category: string;
  rule_key: string;
  description: string;
  rule_value_int?: number;
  rule_value_float?: number;
  rule_value_str?: string;
  rule_value_bool?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'EXAM_CELL') {
      router.push('/dashboard');
      return;
    }
    fetchRules();
  }, [user, router]);

  const fetchRules = async () => {
    try {
      const response = await rulesAPI.list();
      setRules(response.data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    // Determine the current value
    if (rule.rule_value_int !== null && rule.rule_value_int !== undefined) {
      setEditValue(rule.rule_value_int.toString());
    } else if (rule.rule_value_float !== null && rule.rule_value_float !== undefined) {
      setEditValue(rule.rule_value_float.toString());
    } else if (rule.rule_value_str) {
      setEditValue(rule.rule_value_str);
    } else if (rule.rule_value_bool !== null && rule.rule_value_bool !== undefined) {
      setEditValue(rule.rule_value_bool.toString());
    } else {
      setEditValue('');
    }
  };

  const handleSave = async () => {
    if (!editingRule) return;

    try {
      // Determine which field to update based on existing type
      const updateData: any = {};
      
      if (editingRule.rule_value_int !== null && editingRule.rule_value_int !== undefined) {
        updateData.rule_value_int = parseInt(editValue);
      } else if (editingRule.rule_value_float !== null && editingRule.rule_value_float !== undefined) {
        updateData.rule_value_float = parseFloat(editValue);
      } else if (editingRule.rule_value_str !== null) {
        updateData.rule_value_str = editValue;
      } else if (editingRule.rule_value_bool !== null && editingRule.rule_value_bool !== undefined) {
        updateData.rule_value_bool = editValue.toLowerCase() === 'true';
      }

      await rulesAPI.update(editingRule.id, updateData);
      setEditingRule(null);
      setEditValue('');
      fetchRules();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update rule');
    }
  };

  const toggleActive = async (rule: Rule) => {
    try {
      await rulesAPI.update(rule.id, { is_active: !rule.is_active });
      fetchRules();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update rule');
    }
  };

  const getRuleValue = (rule: Rule): string => {
    if (rule.rule_value_int !== null && rule.rule_value_int !== undefined) {
      return rule.rule_value_int.toString();
    } else if (rule.rule_value_float !== null && rule.rule_value_float !== undefined) {
      return rule.rule_value_float.toString();
    } else if (rule.rule_value_str) {
      return rule.rule_value_str;
    } else if (rule.rule_value_bool !== null && rule.rule_value_bool !== undefined) {
      return rule.rule_value_bool ? 'Yes' : 'No';
    }
    return 'N/A';
  };

  const filteredRules = filter === 'ALL' 
    ? rules 
    : rules.filter(r => r.exam_type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading rules...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Examination Rules</h1>
        <p className="text-gray-600 mt-1">Configure exam scheduling and seating rules</p>
      </div>

      <div className="mb-6 flex gap-2">
        {['ALL', 'ISA1', 'ISA2', 'ESA'].map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {type === 'ALL' ? 'All Rules' : type}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredRules.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 py-8">
              No rules found for the selected filter.
            </p>
          </Card>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded">
                      {rule.exam_type}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {rule.category}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        rule.is_active
                          ? 'kle-status-success'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{rule.rule_key}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                  
                  {editingRule?.id === rule.id ? (
                    <div className="flex gap-2 items-center mt-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-xs"
                        placeholder="New value"
                      />
                      <Button size="sm" onClick={handleSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingRule(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-primary">
                        Value: {getRuleValue(rule)}
                      </p>
                    </div>
                  )}
                </div>

                {user?.role === 'ADMIN' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(rule)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleActive(rule)}
                    >
                      {rule.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-warning/10 border border-warning rounded-lg">
        <h3 className="font-semibold text-warning mb-2">⚠️ Important Notes</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• These rules control how the exam scheduling engines operate</li>
          <li>• Changes take effect immediately for new exam plans</li>
          <li>• Disabling a rule may cause scheduling conflicts</li>
          <li>• Contact system administrator before making critical changes</li>
        </ul>
      </div>

      {filteredRules.length > 0 && (
        <div className="mt-4 text-center text-sm text-text-muted">
          Showing {filteredRules.length} of {rules.length} rules
        </div>
      )}
    </div>
  );
}
