import React from 'react';

export function IconContainer({ children, variant = "default", size = "default", rounded = "md", className = "" }) {
  const variantClasses = {
    'default': 'bg-white',
    'subtle': 'bg-gray-100',
  };

  const sizeClasses = {
    'default': 'p-3',
    'sm': 'p-2',
  };

  const roundedClasses = {
    'md': 'rounded-md',
    'lg': 'rounded-xl',
    'full': 'rounded-full',
  };

  return (
    <div className={`${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`}>
      {children}
    </div>
  );
} 