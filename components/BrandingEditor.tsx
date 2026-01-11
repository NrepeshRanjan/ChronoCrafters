import React, { useState, useEffect } from 'react';
import { Branding, ToastMessage } from '../types';
import { useBranding } from '../services/apiService';
import { Button } from './Button';

interface BrandingEditorProps {
  showToast: (message: string, type: ToastMessage['type']) => void;
}

export const BrandingEditor: React.FC<BrandingEditorProps> = ({ showToast }) => {
  const { branding, loading, error, updateBranding, fetchBranding } = useBranding();
  const [formState, setFormState] = useState<Branding>({
    appName: '',
    logoUrl: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (branding) {
      setFormState(branding);
    }
  }, [branding]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.appName || !formState.logoUrl || !formState.primaryColor || !formState.secondaryColor) {
      showToast('All branding fields are required.', 'error');
      setIsSubmitting(false);
      return;
    }

    const success = await updateBranding(formState);
    if (success) {
      showToast('Branding updated successfully!', 'success');
      fetchBranding(); // Re-fetch to ensure App.tsx gets updated branding
    } else {
      showToast('Failed to update branding.', 'error');
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="text-center text-gray-300">Loading branding settings...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!branding) return <div className="text-center text-gray-300">No branding data found.</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Manage Branding</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="appName" className="block text-gray-300 text-sm font-semibold mb-2">
            App Name
          </label>
          <input
            type="text"
            id="appName"
            name="appName"
            value={formState.appName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="logoUrl" className="block text-gray-300 text-sm font-semibold mb-2">
            Logo URL
          </label>
          <input
            type="text"
            id="logoUrl"
            name="logoUrl"
            value={formState.logoUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isSubmitting}
            required
          />
          {formState.logoUrl && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Preview:</span>
              <img src={formState.logoUrl} alt="Logo Preview" className="w-10 h-10 rounded-full border border-gray-600" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="primaryColor" className="block text-gray-300 text-sm font-semibold mb-2">
              Primary Color
            </label>
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              value={formState.primaryColor}
              onChange={handleChange}
              className="w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              required
            />
            <span className="text-gray-400 text-xs block mt-1">{formState.primaryColor}</span>
          </div>
          <div>
            <label htmlFor="secondaryColor" className="block text-gray-300 text-sm font-semibold mb-2">
              Secondary Color
            </label>
            <input
              type="color"
              id="secondaryColor"
              name="secondaryColor"
              value={formState.secondaryColor}
              onChange={handleChange}
              className="w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              required
            />
            <span className="text-gray-400 text-xs block mt-1">{formState.secondaryColor}</span>
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" fullWidth variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            Update Branding
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
        <div className="p-4 rounded-lg" style={{ backgroundColor: formState.primaryColor, color: '#ffffff' }}>
          <div className="flex items-center space-x-3">
            <img src={formState.logoUrl} alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="text-lg font-bold">{formState.appName}</span>
          </div>
          <p className="mt-2 text-sm" style={{ color: formState.secondaryColor }}>
            This is how your primary and secondary colors might look.
          </p>
        </div>
      </div>
    </div>
  );
};