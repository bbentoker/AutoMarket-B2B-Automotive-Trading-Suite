import React from 'react';
import { useToast } from './ui/toast';
import { Button } from './ui/button';
import { Heart, Star, Zap, Gift } from 'lucide-react';

export function ToastDemo() {
  const { toast } = useToast();

  const handleBasicToast = () => {
    toast({
      title: "Welcome to AutoMarket!",
      description: "Your trusted partner in cross-border vehicle trade."
    });
  };

  const handleSuccessToast = () => {
    toast.success({
      title: "Subscription Successful!",
      description: "Thank you for subscribing to our newsletter.",
      duration: 4000
    });
  };

  const handleErrorToast = () => {
    toast.error({
      title: "Upload Failed",
      description: "Failed to upload vehicle documents. Please try again.",
      duration: 6000
    });
  };

  const handleWarningToast = () => {
    toast.warning({
      title: "Auction Ending Soon",
      description: "This vehicle auction ends in 2 hours. Don't miss out!",
      duration: 7000
    });
  };

  const handleDestructiveToast = () => {
    toast.destructive({
      title: "Account Suspended",
      description: "Your account has been temporarily suspended. Contact support.",
      duration: 8000
    });
  };

  const handleCustomIconToast = () => {
    toast({
      title: "Special Offer!",
      description: "Get 20% off your first vehicle purchase.",
      variant: "default",
      icon: <Gift className="h-5 w-5 text-c-red" />,
      duration: 5000
    });
  };

  const handleQuickToast = () => {
    toast.success("Vehicle added to watchlist!");
  };

  const handleLongDurationToast = () => {
    toast({
      title: "Important Notice",
      description: "New EU regulations for vehicle imports will take effect next month. This toast will stay longer to give you time to read.",
      variant: "warning",
      duration: 10000 // 10 seconds
    });
  };

  const handlePersistentToast = () => {
    toast({
      title: "Action Required",
      description: "Please verify your email address to continue using all features. This notification will stay until dismissed.",
      variant: "error",
      duration: Infinity // Won't auto-dismiss
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Custom Toast System Demo</h1>
        <p className="text-gray-600 mb-6">
          This demo showcases the custom toast system that matches your design system with 
          your brand colors (`c-red: #20BFB6`), `rounded-xl` corners, and proper typography.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Button 
          onClick={handleBasicToast}
          className="bg-c-red hover:bg-c-red-dark"
        >
          Basic Toast
        </Button>

        <Button 
          onClick={handleSuccessToast}
          className="bg-green-600 hover:bg-green-700"
        >
          Success Toast
        </Button>

        <Button 
          onClick={handleErrorToast}
          className="bg-red-600 hover:bg-red-700"
        >
          Error Toast
        </Button>

        <Button 
          onClick={handleWarningToast}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Warning Toast
        </Button>

        <Button 
          onClick={handleDestructiveToast}
          className="bg-red-800 hover:bg-red-900"
        >
          Destructive Toast
        </Button>

        <Button 
          onClick={handleCustomIconToast}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Custom Icon Toast
        </Button>

        <Button 
          onClick={handleQuickToast}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Quick Toast
        </Button>

        <Button 
          onClick={handleLongDurationToast}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Long Duration
        </Button>

        <Button 
          onClick={handlePersistentToast}
          className="bg-gray-600 hover:bg-gray-700"
        >
          Persistent Toast
        </Button>
      </div>

      <div className="bg-c-grey rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Examples</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Usage:</h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded-lg overflow-x-auto">
{`const { toast } = useToast();

// Simple message
toast("Vehicle added to favorites!");

// With title and description
toast({
  title: "Success!",
  description: "Your offer has been submitted.",
  variant: "success"
});`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Convenience Methods:</h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded-lg overflow-x-auto">
{`// Quick success/error/warning toasts
toast.success("Profile updated successfully!");
toast.error("Failed to load vehicle data");
toast.warning("Auction ends in 1 hour");
toast.destructive("Account access restricted");`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Advanced Options:</h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded-lg overflow-x-auto">
{`toast({
  title: "Custom Toast",
  description: "With custom settings",
  variant: "default",
  icon: <CustomIcon />,
  duration: 8000, // 8 seconds
  // duration: Infinity // Never auto-dismiss
});`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Available Variants:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><code className="bg-gray-200 px-1 rounded">default</code> - Uses your brand color (c-red)</li>
              <li><code className="bg-gray-200 px-1 rounded">success</code> - Green theme for positive actions</li>
              <li><code className="bg-gray-200 px-1 rounded">error</code> - Red theme for errors</li>
              <li><code className="bg-gray-200 px-1 rounded">warning</code> - Yellow theme for warnings</li>
              <li><code className="bg-gray-200 px-1 rounded">destructive</code> - High-contrast red for critical actions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 