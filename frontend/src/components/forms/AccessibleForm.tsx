/**
 * Accessible Form Wrapper with Live Regions and Enhanced Feedback
 */
import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormSubmissionFeedback, useFormLiveRegion } from './LiveRegion';
import { cn } from '@/lib/utils';

interface AccessibleFormProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: React.ReactNode;
  submitText?: string;
  className?: string;
  disabled?: boolean;
  autoComplete?: 'on' | 'off';
  noValidate?: boolean;
}

export function AccessibleForm<T extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  submitText = 'Submit',
  className,
  disabled = false,
  autoComplete = 'on',
  noValidate = true
}: AccessibleFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>('');
  
  const { announceError, announceSuccess, LiveRegion } = useFormLiveRegion();

  // Watch for form errors to announce them
  React.useEffect(() => {
    const errors = form.formState.errors;
    const errorMessages = Object.values(errors)
      .map(error => error?.message)
      .filter(Boolean) as string[];
    
    if (errorMessages.length > 0) {
      const message = errorMessages.length === 1 
        ? `Form error: ${errorMessages[0]}`
        : `Form has ${errorMessages.length} errors: ${errorMessages.join(', ')}`;
      announceError(message);
    }
  }, [form.formState.errors, announceError]);

  const handleSubmit = form.handleSubmit(async (data: T) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      await onSubmit(data);
      setSubmitSuccess(true);
      announceSuccess('Form submitted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during submission';
      setSubmitError(errorMessage);
      announceError(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleClearFeedback = React.useCallback(() => {
    setSubmitSuccess(false);
    setSubmitError('');
  }, []);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        autoComplete={autoComplete}
        noValidate={noValidate}
        aria-label="Form"
      >
        {children}
        
        <div className="flex justify-end space-x-3">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={disabled || isSubmitting}
            aria-describedby={submitError ? 'submit-error' : undefined}
          >
            {submitText}
          </Button>
        </div>

        {/* Visual feedback for submission state */}
        {submitSuccess && (
          <div className="rounded-md bg-green-50 p-4" role="status">
            <div className="text-sm font-medium text-green-800">
              Form submitted successfully!
            </div>
          </div>
        )}
        
        {submitError && (
          <div id="submit-error" className="rounded-md bg-red-50 p-4" role="alert">
            <div className="text-sm font-medium text-red-800">
              {submitError}
            </div>
          </div>
        )}
      </form>

      {/* Live region for screen reader announcements */}
      <LiveRegion />
      
      {/* Form submission feedback for screen readers */}
      <FormSubmissionFeedback
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        submitError={submitError}
        onClearFeedback={handleClearFeedback}
      />
    </>
  );
}

/**
 * Accessible Form Section for Multi-step Forms
 */
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className,
  required = false 
}: FormSectionProps) {
  const sectionId = React.useId();
  const titleId = `${sectionId}-title`;
  const descId = description ? `${sectionId}-description` : undefined;

  return (
    <section 
      className={cn('space-y-4', className)}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="space-y-1">
        <h3 
          id={titleId}
          className={cn(
            'text-lg font-medium text-gray-900',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {title}
          {required && <span className="sr-only"> (required section)</span>}
        </h3>
        {description && (
          <p id={descId} className="text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
