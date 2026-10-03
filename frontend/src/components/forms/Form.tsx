/**
 * Form wrapper component with submission handling, loading states, and error display
 */
import React from 'react';
import { useForm, SubmitHandler, FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// ============================================================================
// Form Context
// ============================================================================

interface FormContextValue<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  submitError: string | null;
}

const FormContext = React.createContext<FormContextValue | null>(null);

export function useFormContext<T extends FieldValues = FieldValues>(): FormContextValue<T> {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context as FormContextValue<T>;
}

// ============================================================================
// Form Component
// ============================================================================

interface FormProps<T extends FieldValues> {
  schema?: ZodSchema<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  className?: string;
  defaultValues?: UseFormProps<T>['defaultValues'];
  mode?: UseFormProps<T>['mode'];
  
  // Submission options
  submitText?: string;
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showSubmitButton?: boolean;
  
  // Loading and error states
  isSubmitting?: boolean;
  submitError?: string | null;
  successMessage?: string | null;
  
  // Layout options
  title?: string;
  description?: string;
  showCard?: boolean;
  
  // Reset form after successful submission
  resetOnSuccess?: boolean;
  
  // Additional actions
  secondaryAction?: {
    text: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  className,
  defaultValues,
  mode = 'onChange',
  submitText = 'Submit',
  submitVariant = 'default',
  showSubmitButton = true,
  isSubmitting: externalIsSubmitting,
  submitError: externalSubmitError,
  successMessage,
  title,
  description,
  showCard = false,
  resetOnSuccess = false,
  secondaryAction,
}: FormProps<T>) {
  const [internalIsSubmitting, setInternalIsSubmitting] = React.useState(false);
  const [internalSubmitError, setInternalSubmitError] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode,
  });

  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting;
  const submitError = externalSubmitError ?? internalSubmitError;

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      setInternalIsSubmitting(true);
      setInternalSubmitError(null);
      setShowSuccess(false);

      await onSubmit(data);

      // Show success message if provided
      if (successMessage) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }

      // Reset form if requested
      if (resetOnSuccess) {
        form.reset();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setInternalSubmitError(errorMessage);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  const contextValue: FormContextValue<T> = {
    form,
    isSubmitting,
    submitError,
  };

  const formContent = (
    <FormContext.Provider value={contextValue}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={cn('space-y-6', className)}
        noValidate
      >
        {/* Success Message */}
        {showSuccess && successMessage && (
          <Alert className="border-success-200 bg-success-50">
            <CheckCircle className="h-4 w-4 text-success-600" />
            <AlertDescription className="text-success-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {children}
        </div>

        {/* Action Buttons */}
        {(showSubmitButton || secondaryAction) && (
          <div className="flex items-center gap-4 pt-4">
            {showSubmitButton && (
              <Button
                type="submit"
                variant={submitVariant}
                disabled={isSubmitting || !form.formState.isValid}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            )}

            {secondaryAction && (
              <Button
                type="button"
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                disabled={isSubmitting}
              >
                {secondaryAction.text}
              </Button>
            )}
          </div>
        )}
      </form>
    </FormContext.Provider>
  );

  if (showCard) {
    return (
      <Card>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return formContent;
}

// ============================================================================
// Form Field Groups
// ============================================================================

interface FieldGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldGroup({ title, description, children, className }: FieldGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="pb-2 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FieldRowProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function FieldRow({ children, className, columns = 2 }: FieldRowProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Form Validation Hook
// ============================================================================

export function useFormValidation() {
  const { form } = useFormContext();
  
  return {
    // Check if field has error
    hasError: (fieldName: string) => !!form.formState.errors[fieldName],
    
    // Get field error message
    getError: (fieldName: string) => form.formState.errors[fieldName]?.message,
    
    // Check if field is dirty (modified)
    isDirty: (fieldName: string) => !!form.formState.dirtyFields[fieldName],
    
    // Check if field is touched
    isTouched: (fieldName: string) => !!form.formState.touchedFields[fieldName],
    
    // Check if form is valid
    isValid: form.formState.isValid,
    
    // Check if form has been submitted
    isSubmitted: form.formState.isSubmitted,
    
    // Get all errors
    errors: form.formState.errors,
    
    // Trigger validation for specific field
    validateField: (fieldName: string) => form.trigger(fieldName),
    
    // Clear errors for specific field
    clearError: (fieldName: string) => form.clearErrors(fieldName),
    
    // Set custom error for field
    setError: (fieldName: string, error: { message: string }) => 
      form.setError(fieldName, error),
  };
}

// ============================================================================
// Form Utilities
// ============================================================================

export function getFieldProps(form: UseFormReturn, fieldName: string) {
  return {
    register: form.register(fieldName),
    error: form.formState.errors[fieldName],
    required: true, // You might want to make this dynamic based on schema
  };
}