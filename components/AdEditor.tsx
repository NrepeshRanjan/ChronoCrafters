import React, { useState, useEffect } from 'react';
import { Ad, ToastMessage } from '../types';
import { useAds } from '../services/apiService';
import { Button } from './Button';
import { Modal } from './Modal';

interface AdEditorProps {
  showToast: (message: string, type: ToastMessage['type']) => void;
}

export const AdEditor: React.FC<AdEditorProps> = ({ showToast }) => {
  const { ads, loading, error, addAd, updateAd, deleteAd, fetchAds } = useAds();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [formState, setFormState] = useState<Omit<Ad, 'id'>>({
    name: '',
    type: 'banner',
    placement: 'game',
    frequencyCap: 0,
    imageUrl: '',
    textContent: '',
    actionUrl: '',
    geminiPrompt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentAd) {
      setFormState({
        name: currentAd.name,
        type: currentAd.type,
        placement: currentAd.placement,
        frequencyCap: currentAd.frequencyCap,
        imageUrl: currentAd.imageUrl || '',
        textContent: currentAd.textContent || '',
        actionUrl: currentAd.actionUrl || '',
        geminiPrompt: currentAd.geminiPrompt || '',
      });
    } else {
      setFormState({
        name: '',
        type: 'banner',
        placement: 'game',
        frequencyCap: 0,
        imageUrl: '',
        textContent: '',
        actionUrl: '',
        geminiPrompt: '',
      });
    }
  }, [currentAd]);

  const openAddModal = () => {
    setCurrentAd(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: Ad) => {
    setCurrentAd(ad);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAd(null);
    setFormState({
      name: '',
      type: 'banner',
      placement: 'game',
      frequencyCap: 0,
      imageUrl: '',
      textContent: '',
      actionUrl: '',
      geminiPrompt: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success = false;

    if (!formState.name || !formState.type || !formState.placement) {
      showToast('Name, type, and placement are required.', 'error');
      setIsSubmitting(false);
      return;
    }

    if (currentAd) {
      // Update
      success = await updateAd({ ...currentAd, ...formState });
      if (success) showToast('Ad updated successfully!', 'success');
      else showToast('Failed to update ad.', 'error');
    } else {
      // Add
      success = await addAd(formState);
      if (success) showToast('Ad added successfully!', 'success');
      else showToast('Failed to add ad.', 'error');
    }

    setIsSubmitting(false);
    if (success) {
      closeModal();
      fetchAds(); // Re-fetch to update state in App.tsx
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      const success = await deleteAd(id);
      if (success) showToast('Ad deleted successfully!', 'success');
      else showToast('Failed to delete ad.', 'error');
      if (success) fetchAds(); // Re-fetch to update state in App.tsx
    }
  };

  if (loading) return <div className="text-center text-gray-300">Loading ads...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Ads</h2>
        <Button onClick={openAddModal} variant="primary">
          Add New Ad
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-600">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Type</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Placement</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Freq. Cap</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {ads.map(ad => (
              <tr key={ad.id} className="hover:bg-gray-600">
                <td className="py-3 px-4 text-white text-base">{ad.name}</td>
                <td className="py-3 px-4 text-gray-300 text-base capitalize">{ad.type}</td>
                <td className="py-3 px-4 text-gray-300 text-base capitalize">{ad.placement}</td>
                <td className="py-3 px-4 text-gray-300 text-base">{ad.frequencyCap === 0 ? 'Always' : ad.frequencyCap}</td>
                <td className="py-3 px-4 flex space-x-2">
                  <Button onClick={() => openEditModal(ad)} variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(ad.id)} variant="danger" size="sm">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentAd ? 'Edit Ad' : 'Add New Ad'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 text-sm font-semibold mb-2">
              Ad Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="type" className="block text-gray-300 text-sm font-semibold mb-2">
                Ad Type
              </label>
              <select
                id="type"
                name="type"
                value={formState.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
                required
              >
                <option value="banner">Banner</option>
                <option value="interstitial">Interstitial</option>
                <option value="rewarded">Rewarded</option>
              </select>
            </div>
            <div>
              <label htmlFor="placement" className="block text-gray-300 text-sm font-semibold mb-2">
                Placement
              </label>
              <select
                id="placement"
                name="placement"
                value={formState.placement}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
                required
              >
                <option value="game">Game</option>
                <option value="footer">Footer</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="frequencyCap" className="block text-gray-300 text-sm font-semibold mb-2">
              Frequency Cap (0 for always, e.g., 'every X levels' for game ads)
            </label>
            <input
              type="number"
              id="frequencyCap"
              name="frequencyCap"
              value={formState.frequencyCap}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              min="0"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-gray-300 text-sm font-semibold mb-2">
              Image URL (Optional, for banner/interstitial)
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formState.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="textContent" className="block text-gray-300 text-sm font-semibold mb-2">
              Text Content (Optional)
            </label>
            <textarea
              id="textContent"
              name="textContent"
              rows={3}
              value={formState.textContent}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="actionUrl" className="block text-gray-300 text-sm font-semibold mb-2">
              Action URL (Optional, click-through)
            </label>
            <input
              type="text"
              id="actionUrl"
              name="actionUrl"
              value={formState.actionUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="geminiPrompt" className="block text-gray-300 text-sm font-semibold mb-2">
              Gemini Prompt (Optional, for dynamic ad content)
            </label>
            <textarea
              id="geminiPrompt"
              name="geminiPrompt"
              rows={3}
              value={formState.geminiPrompt}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Generate a catchy slogan for a puzzle game about time."
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {currentAd ? 'Update Ad' : 'Add Ad'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};