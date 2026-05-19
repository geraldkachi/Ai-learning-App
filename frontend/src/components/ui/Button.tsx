import React from 'react'

const Button = ({
    children,
    onClick,
    type = 'button',
    className = '',
    variant = 'primary',
    size = 'md',
    disabled = false
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    className?: string
    variant?: 'primary' | 'secondary' | 'danger' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
}) => {
    const baseStyles = `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:active:scale-100 disabled:pointer-events-none whitespace-nowrap`

    const variantStyles: Record<string, string> = {
        primary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        outline: 'bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-400',
    }

    const sizeStyles: Record<string, string> = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-5 py-3 text-lg',
    }

    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`   

  return (
    <button className={combinedStyles} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  )
}

export default Button