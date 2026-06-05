import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, [removeToast]);

  const contextValue = {
    addToast,
    removeToast,
    removeAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Custom Toast Container
function ToastContainer({ toasts, onRemove }) {
  return (
    <ToastPrimitive.Provider>
      <div className="fixed top-4 left-4 right-4 md:top-6 md:right-6 md:left-auto z-[9999] w-auto max-w-[calc(100vw-2rem)] md:max-w-sm pointer-events-none">
        <div className="flex flex-col space-y-3">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onRemove={() => onRemove(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <ToastPrimitive.Viewport className="fixed top-4 left-4 right-4 md:top-6 md:right-6 md:left-auto z-[9999] max-w-[calc(100vw-2rem)] md:max-w-sm w-auto" />
    </ToastPrimitive.Provider>
  );
}

// Individual Toast Item Component
function ToastItem({ toast, onRemove }) {
  const { title, description, variant = "default", icon } = toast;

  // Define variants with your color system
  const variants = {
    default: {
      container: "bg-white border-gray-200 text-gray-900 mt-2",
      icon: <Info className="h-5 w-5 text-c-red" />,
      iconBg: "bg-c-red/10"
    },
    success: {
      container: "bg-white border-green-200 text-gray-900 mt-2"  ,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      iconBg: "bg-green-50"
    },
    error: {
      container: "bg-white border-red-200 text-gray-900 mt-2",
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      iconBg: "bg-red-50"
    },
    warning: {
      container: "bg-white border-yellow-200 text-gray-900 mt-2",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      iconBg: "bg-yellow-50"
    },
    destructive: {
      container: "bg-c-red text-white border-c-red mt-2",
      icon: <AlertCircle className="h-5 w-5 text-white" />,
      iconBg: "bg-white/20"
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <Motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-auto"
    >
      <ToastPrimitive.Root
        className={`
          ${currentVariant.container}
          rounded-xl border shadow-lg backdrop-blur-sm
          p-3 md:p-4 w-full max-w-full md:max-w-sm
          font-inter
          group
          transition-all duration-300
          hover:shadow-xl hover:scale-[1.02]
        `}
      >
        <div className="flex items-center gap-2 md:gap-3">
          {/* Icon */}
          <div className={`${currentVariant.iconBg} rounded-full p-1.5 md:p-2 flex-shrink-0 flex items-center justify-center`}>
            {icon || currentVariant.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {title && (
              <ToastPrimitive.Title className="font-semibold text-xs md:text-sm leading-tight mb-1">
                {title}
              </ToastPrimitive.Title>
            )}
            {description && (
              <ToastPrimitive.Description 
                className={`text-xs md:text-sm leading-relaxed ${
                  variant === 'destructive' ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                {description}
              </ToastPrimitive.Description>
            )}
          </div>

          {/* Close Button */}
          <ToastPrimitive.Close
            onClick={onRemove}
            className={`
              flex-shrink-0 rounded-lg p-1 md:p-1.5 transition-colors duration-200 flex items-center justify-center
              ${variant === 'destructive' 
                ? 'hover:bg-white/20 text-white/80 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }
            `}
          >
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </ToastPrimitive.Close>
        </div>
             </ToastPrimitive.Root>
     </Motion.div>
   );
}

// Enhanced useToast Hook
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, removeAllToasts } = context;

  const toast = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ description: options });
    }
    return addToast(options);
  }, [addToast]);

  // Convenience methods
  toast.success = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ description: options, variant: 'success' });
    }
    return addToast({ ...options, variant: 'success' });
  }, [addToast]);

  toast.error = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ description: options, variant: 'error' });
    }
    return addToast({ ...options, variant: 'error' });
  }, [addToast]);

  toast.warning = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ description: options, variant: 'warning' });
    }
    return addToast({ ...options, variant: 'warning' });
  }, [addToast]);

  toast.destructive = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ description: options, variant: 'destructive' });
    }
    return addToast({ ...options, variant: 'destructive' });
  }, [addToast]);

  return {
    toast,
    dismiss: removeToast,
    dismissAll: removeAllToasts
  };
}

// Legacy Toaster component for backward compatibility
export function Toaster() {
  // This is now handled by ToastProvider, but keeping for compatibility
  return null;
} 