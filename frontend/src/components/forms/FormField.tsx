/**
 * Reusable form field components with validation and accessibility
 */
import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

// ============================================================================
// Base Form Field Component with Accessibility
// ============================================================================

interface BaseFieldProps {
  label?: string;
  error?: FieldError | string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  help?: string;
}

function FieldWrapper({ 
  label, 
  error, 
  required, 
  children, 
  className,
  help,
  fieldId 
}: BaseFieldProps & { 
  children: React.ReactNode;
  fieldId: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const helpId = help ? `${fieldId}-help` : undefined;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label 
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium text-gray-700',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
          {required && <span className="sr-only"> (required)</span>}
        </Label>
      )}
      {React.cloneElement(children as React.ReactElement, {
        id: fieldId,
        'aria-required': required ? 'true' : undefined,
        'aria-invalid': errorMessage ? 'true' : 'false',
        'aria-describedby': describedBy,
      })}
      {help && !errorMessage && (
        <p id={helpId} className="text-xs text-gray-500">{help}</p>
      )}
      {errorMessage && (
        <div id={errorId} className="flex items-center gap-1 text-xs text-red-600" role="alert">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Text Input Field with Accessibility
// ============================================================================

interface TextFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
  placeholder?: string;
  autoComplete?: string;
  id?: string;
}

export function TextField({ 
  register, 
  label, 
  error, 
  required, 
  disabled, 
  type = 'text',
  placeholder,
  autoComplete,
  className,
  help,
  id
}: TextFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
      fieldId={fieldId}
    >
      <Input
        {...register}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={cn(
          errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
      />
    </FieldWrapper>
  );
}

// ============================================================================
// Password Input Field with Accessibility
// ============================================================================

interface PasswordFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  autoComplete?: string;
  showToggle?: boolean;
  id?: string;
}

export function PasswordField({ 
  register, 
  label, 
  error, 
  required, 
  disabled, 
  placeholder = 'Enter password',
  autoComplete = 'current-password',
  showToggle = true,
  className,
  help,
  id 
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const toggleId = `${fieldId}-toggle`;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
      fieldId={fieldId}
    >
      <div className="relative">
        <Input
          {...register}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={cn(
            showToggle && 'pr-10',
            errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          )}
        />
        {showToggle && (
          <button
            id={toggleId}
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            aria-controls={fieldId}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}

// ============================================================================
// Number Input Field with Accessibility
// ============================================================================

interface NumberFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  id?: string;
}

export function NumberField({ 
  register, 
  label, 
  error, 
  required, 
  disabled, 
  min,
  max,
  step,
  placeholder,
  className,
  help,
  id 
}: NumberFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
      fieldId={fieldId}
    >
      <Input
        {...register}
        type="number"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
      />
    </FieldWrapper>
  );
}

// ============================================================================
// Textarea Field with Accessibility
// ============================================================================

interface TextareaFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  rows?: number;
  id?: string;
}

export function TextareaField({ 
  register, 
  label, 
  error, 
  required, 
  disabled, 
  placeholder,
  rows = 3,
  className,
  help,
  id 
}: TextareaFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
      fieldId={fieldId}
    >
      <Textarea
        {...register}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
      />
    </FieldWrapper>
  );
}

// ============================================================================
// Select Field with Accessibility
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type { SelectOption };

interface SelectFieldProps extends BaseFieldProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
}

export function SelectField({ 
  value,
  onValueChange,
  options,
  label, 
  error, 
  required, 
  disabled, 
  placeholder = 'Select an option',
  className,
  help,
  id 
}: SelectFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
      fieldId={fieldId}
    >
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        disabled={disabled}
      >
        <SelectTrigger 
          className={cn(
            errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          )}
          aria-label={label || placeholder}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

// ============================================================================
// Checkbox Field with Accessibility
// ============================================================================

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  id?: string;
}

export function CheckboxField({ 
  checked,
  onCheckedChange,
  children,
  error, 
  disabled, 
  className,
  help,
  id 
}: CheckboxFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const helpId = help ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={fieldId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={errorMessage ? 'true' : 'false'}
          className={cn(
            errorMessage && 'border-red-500 focus:ring-red-500'
          )}
        />
        <label 
          id={labelId}
          htmlFor={fieldId}
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          {children}
        </label>
      </div>
      {help && !errorMessage && (
        <p id={helpId} className="text-xs text-gray-500 ml-6">{help}</p>
      )}
      {errorMessage && (
        <div id={errorId} className="flex items-center gap-1 text-xs text-red-600 ml-6" role="alert">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Date Field with Accessibility
// ============================================================================

interface DateFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  min?: string;
  max?: string;
  id?: string;
}

export function DateField({ 
  register, 
  label, 
  error, 
  required, 
  disabled, 
  min,
  max,
  className,
  help,
  id 
}: DateFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
      fieldId={fieldId}
    >
      <Input
        {...register}
        type="date"
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
      />
    </FieldWrapper>
  );
}

// ============================================================================
// File Upload Field with Accessibility
// ============================================================================

interface FileFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  accept?: string;
  multiple?: boolean;
  id?: string;
}

export function FileField({ 
  register, 
  label, 
  error, 
  required, 
  disabled, 
  accept,
  multiple,
  className,
  help,
  id 
}: FileFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || `field-${generatedId}`;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
      fieldId={fieldId}
    >
      <Input
        {...register}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className={cn(
          'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100',
          errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
      />
    </FieldWrapper>
  );
}

// ============================================================================
// Form Group with Fieldset/Legend for Grouped Controls
// ============================================================================

interface FormGroupProps {
  legend: string;
  children: React.ReactNode;
  error?: FieldError | string;
  required?: boolean;
  className?: string;
  help?: string;
}

export function FormGroup({ 
  legend, 
  children, 
  error, 
  required, 
  className,
  help 
}: FormGroupProps) {
  const groupId = React.useId();
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const helpId = help ? `${groupId}-help` : undefined;
  const errorId = errorMessage ? `${groupId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  
  return (
    <fieldset 
      className={cn('space-y-4 border border-gray-200 rounded-lg p-4', className)}
      aria-describedby={describedBy}
      aria-invalid={errorMessage ? 'true' : 'false'}
    >
      <legend className={cn(
        'text-sm font-medium text-gray-900 px-2 -ml-2',
        required && "after:content-['*'] after:ml-0.5 after:text-red-500"
      )}>
        {legend}
        {required && <span className="sr-only"> (required)</span>}
      </legend>
      {help && !errorMessage && (
        <p id={helpId} className="text-xs text-gray-500">{help}</p>
      )}
      {errorMessage && (
        <div id={errorId} className="flex items-center gap-1 text-xs text-red-600" role="alert">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </fieldset>
  );
}
