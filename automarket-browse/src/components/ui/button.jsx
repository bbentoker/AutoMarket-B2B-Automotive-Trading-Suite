import React from 'react';

export function Button({ children, type = "button", size = "default", rounded = "md", className = "", ...props }) {
  const sizeClasses = {
    'default': 'px-4 py-2',
    'icon-sm': 'p-1',
  };

  const roundedClasses = {
    'md': 'rounded-md',
    'lg': 'rounded-xl',
    'full': 'rounded-full',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center text-white ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 