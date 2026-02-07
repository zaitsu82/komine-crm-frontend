'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormRegisterReturn } from 'react-hook-form';

interface ViewModeFieldProps {
  label: string;
  value?: string | number | null;
  viewMode?: boolean;
  required?: boolean;
  placeholder?: string;
  type?: string;
  register?: UseFormRegisterReturn;
  error?: string;
  className?: string;
}

export function ViewModeField({
  label,
  value,
  viewMode,
  required,
  placeholder,
  type = 'text',
  register,
  error,
  className = '',
}: ViewModeFieldProps) {
  const displayValue = value?.toString() || '';

  return (
    <div className={className}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {viewMode ? (
        <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[38px] text-sm">
          {displayValue || '-'}
        </div>
      ) : (
        <>
          <Input
            type={type}
            placeholder={placeholder}
            className="mt-1"
            {...register}
            required={required}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </>
      )}
    </div>
  );
}

interface ViewModeSelectProps {
  label: string;
  value?: string;
  displayValue?: string;
  viewMode?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function ViewModeSelect({
  label,
  value,
  displayValue,
  viewMode,
  required,
  placeholder,
  disabled,
  onValueChange,
  children,
}: ViewModeSelectProps) {
  return (
    <div>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {viewMode ? (
        <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[38px] text-sm">
          {displayValue || value || '-'}
        </div>
      ) : (
        <Select value={value || ''} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

interface ViewModeTextareaProps {
  label: string;
  value?: string;
  viewMode?: boolean;
  required?: boolean;
  placeholder?: string;
  register?: UseFormRegisterReturn;
  rows?: number;
}

export function ViewModeTextarea({
  label,
  value,
  viewMode,
  required,
  placeholder,
  register,
  rows = 3,
}: ViewModeTextareaProps) {
  return (
    <div>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {viewMode ? (
        <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[60px] text-sm whitespace-pre-wrap">
          {value || '-'}
        </div>
      ) : (
        <textarea
          placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 border rounded-md resize-none"
          rows={rows}
          {...register}
        />
      )}
    </div>
  );
}
