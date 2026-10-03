/**
 * Reusable form field components with validation
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
// Base Form Field Component
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
  help 
}: BaseFieldProps & { children: React.ReactNode }) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(
          'text-sm font-medium text-gray-700',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}>
          {label}
        </Label>
      )}
      {children}
      {help && !errorMessage && (
        <p className="text-xs text-gray-500">{help}</p>
      )}
      {errorMessage && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Text Input Field
// ============================================================================

interface TextFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
  placeholder?: string;
  autoComplete?: string;
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
  help 
}: TextFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
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
// Password Input Field
// ============================================================================

interface PasswordFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  autoComplete?: string;
  showToggle?: boolean;
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
  help 
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
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
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}

// ============================================================================
// Number Input Field
// ============================================================================

interface NumberFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
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
  help 
}: NumberFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
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
// Textarea Field
// ============================================================================

interface TextareaFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  rows?: number;
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
  help 
}: TextareaFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
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
// Select Field
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
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
  help 
}: SelectFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(
          errorMessage && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}>
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
// Checkbox Field
// ============================================================================

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
}

export function CheckboxField({ 
  checked,
  onCheckedChange,
  children,
  error, 
  disabled, 
  className,
  help 
}: CheckboxFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            errorMessage && 'border-red-500 focus:ring-red-500'
          )}
        />
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          {children}
        </label>
      </div>
      {help && !errorMessage && (
        <p className="text-xs text-gray-500 ml-6">{help}</p>
      )}
      {errorMessage && (
        <div className="flex items-center gap-1 text-xs text-red-600 ml-6">
          <AlertCircle className="h-3 w-3" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Date Field
// ============================================================================

interface DateFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  min?: string;
  max?: string;
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
  help 
}: DateFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
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
// File Upload Field
// ============================================================================

interface FileFieldProps extends BaseFieldProps {
  register: UseFormRegisterReturn;
  accept?: string;
  multiple?: boolean;
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
  help 
}: FileFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <FieldWrapper 
      label={label} 
      error={error} 
      required={required} 
      className={className}
      help={help}
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