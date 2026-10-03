/**
 * Course Form with comprehensive validation
 */
import React from 'react';
import { Form, FieldGroup, FieldRow } from './Form';
import { TextField, NumberField, SelectField, CheckboxField } from './FormField';
import { courseSchema, type CourseFormData } from '@/lib/validations';
import { coursesAPI } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { Course } from '@/lib/types';

interface CourseFormProps {
  initialData?: Partial<Course>;
  onSuccess?: (course: Course) => void;
  onCancel?: () => void;
  className?: string;
}

export function CourseForm({ initialData, onSuccess, onCancel, className }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  
  const isEditing = !!initialData?.id;

  const examTypeOptions = [
    { value: 'MID_TERM', label: 'Mid Term Examination' },
    { value: 'END_SEM', label: 'End Semester Examination' },
    { value: 'MAKEUP', label: 'Makeup Examination' },
    { value: 'RETEST', label: 'Retest Examination' },
    { value: 'SUPPLEMENTARY', label: 'Supplementary Examination' },
  ];

  const branchOptions = [
    { value: 'CSE', label: 'Computer Science & Engineering' },
    { value: 'ECE', label: 'Electronics & Communication Engineering' },
    { value: 'ME', label: 'Mechanical Engineering' },
    { value: 'CE', label: 'Civil Engineering' },
    { value: 'EEE', label: 'Electrical & Electronics Engineering' },
    { value: 'ISE', label: 'Information Science & Engineering' },
    { value: 'BT', label: 'Biotechnology' },
    { value: 'CHE', label: 'Chemical Engineering' },
  ];

  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Semester ${i + 1}`,
  }));

  const handleSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let course: Course;
      
      if (isEditing && initialData?.id) {
        const response = await coursesAPI.update(initialData.id, data);
        course = response.data;
        toast.success('Course updated successfully');
      } else {
        const response = await coursesAPI.create(data);
        course = response.data;
        toast.success('Course created successfully');
      }

      if (onSuccess) {
        onSuccess(course);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save course';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues: Partial<CourseFormData> = {
    code: initialData?.code || '',
    name: initialData?.name || '',
    branch: initialData?.branch || '',
    semester: initialData?.semester || 1,
    credits: initialData?.credits || 3,
    examType: initialData?.exam_type || 'END_SEM',
    isActive: initialData?.is_active ?? true,
  };

  return (
    <Form<CourseFormData>
      schema={courseSchema}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      submitText={isEditing ? 'Update Course' : 'Create Course'}
      title={isEditing ? 'Edit Course' : 'Add New Course'}
      description={isEditing ? 'Update course information' : 'Create a new course in the system'}
      showCard={true}
      className={className}
      defaultValues={defaultValues}
      secondaryAction={onCancel ? {
        text: 'Cancel',
        onClick: onCancel,
        variant: 'outline'
      } : undefined}
    >
      <FieldGroup 
        title="Course Information"
        description="Basic details about the course"
      >
        <FieldRow columns={2}>
          <TextField
            register={form => form.register('code')}
            label="Course Code"
            placeholder="e.g., CSE101, MAT201A"
            help="Format: 2-4 letters followed by 3 digits (optional letter)"
            required
          />
          
          <TextField
            register={form => form.register('name')}
            label="Course Name"
            placeholder="e.g., Data Structures and Algorithms"
            required
          />
        </FieldRow>

        <FieldRow columns={3}>
          <SelectField
            value={form => form.watch('branch')}
            onValueChange={(value) => form.setValue('branch', value)}
            options={branchOptions}
            label="Branch"
            placeholder="Select branch"
            required
          />
          
          <SelectField
            value={form => form.watch('semester')?.toString()}
            onValueChange={(value) => form.setValue('semester', parseInt(value))}
            options={semesterOptions}
            label="Semester"
            placeholder="Select semester"
            required
          />
          
          <NumberField
            register={form => form.register('credits', { valueAsNumber: true })}
            label="Credits"
            min={1}
            max={6}
            placeholder="3"
            help="Academic credits (1-6)"
            required
          />
        </FieldRow>
      </FieldGroup>

      <FieldGroup 
        title="Examination Settings"
        description="Configure examination type and preferences"
      >
        <FieldRow columns={1}>
          <SelectField
            value={form => form.watch('examType')}
            onValueChange={(value) => form.setValue('examType', value as any)}
            options={examTypeOptions}
            label="Default Exam Type"
            placeholder="Select exam type"
            help="This can be overridden when scheduling specific exams"
          />
          
          <CheckboxField
            checked={form => form.watch('isActive')}
            onCheckedChange={(checked) => form.setValue('isActive', checked)}
            help="Inactive courses won't appear in scheduling and registration"
          >
            Course is active
          </CheckboxField>
        </FieldRow>
      </FieldGroup>
    </Form>
  );
}