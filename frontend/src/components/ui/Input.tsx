// components/ui/Input.tsx
import React, { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  helperText?: string;
  isLoading?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = 'left',
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      errorClassName = '',
      required = false,
      showPasswordToggle = false,
      helperText,
      isLoading = false,
      leftElement,
      rightElement,
      type = 'text',
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    // Determine input type based on password toggle
    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    // Handle input change to track if field has value
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    // Base input styles
    const baseInputStyles = `
      block w-full px-3 py-3 
      text-gray-900 
      bg-white 
      border 
      rounded-xl 
      transition-all duration-200 
      focus:outline-none focus:ring-2 
      sm:text-sm
      ${icon && iconPosition === 'left' ? 'pl-10' : ''}
      ${(showPasswordToggle || (icon && iconPosition === 'right')) ? 'pr-10' : ''}
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}
      ${isFocused ? 'transform scale-[1.02]qqqq border-indigo-500' : ''}
      ${disabled || isLoading ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
      ${inputClassName}
    `;

    return (
      <div className={`w-full ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id || props.name}
            className={`
              block text-sm font-medium 
              text-gray-700 
              mb-1.5 
              transition-all duration-200
              ${isFocused ? 'text-indigo-600' : ''}
              ${error ? 'text-red-600' : ''}
              ${labelClassName}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Element (Icon or Custom) */}
          {leftElement && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              {leftElement}
            </div>
          )}
          
          {icon && iconPosition === 'left' && !leftElement && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div
                className={`
                  transition-colors duration-200
                  ${isFocused ? 'text-indigo-500' : 'text-gray-400aaa'}
                  ${error ? 'text-red-500' : ''}
                `}
              >
                {icon}
              </div>
            </div>
          )}

          {/* Main Input */}
          <input
            ref={ref}
            type={inputType}
            className={`${baseInputStyles} ${className || ''}`}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            disabled={disabled || isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            required={required}
            {...props}
          />

          {/* Right Element (Icon, Toggle, or Custom) */}
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}

          {/* Password Visibility Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              )}
            </button>
          )}

          {/* Right Icon (without toggle) */}
          {icon && iconPosition === 'right' && !showPasswordToggle && !rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div
                className={`
                  transition-colors duration-200
                  ${isFocused ? 'text-indigo-500' : 'text-gray-400'}
                  ${error ? 'text-red-500' : ''}
                `}
              >
                {icon}
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="mt-1.5 text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            <p
              id={`${props.id}-error`}
              className={`text-xs text-red-600 ${errorClassName}`}
            >
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;