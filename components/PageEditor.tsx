import React, { useState, useEffect } from 'react';
import { AppContentPage, ToastMessage } from '../types';
import { useFooterPages } from '../services/apiService';
import { Button } from './Button';
import { Modal } from './Modal';
import { MarkdownRenderer } from './MarkdownRenderer'; // Assuming this exists

interface PageEditorProps {
  showToast: (message: string, type: ToastMessage['type']) => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({ showToast }) => {
  const { pages, loading, error, addPage, updatePage, deletePage, fetchPages } = useFooterPages();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<AppContentPage | null>(null);
  const [formState, setFormState] = useState<{ title: string; slug: string; content: string }>({
    title: '',
    slug: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentPage) {
      setFormState({
        title: currentPage.title,
        slug: currentPage.slug,
        content: currentPage.content,
      });
    } else {
      setFormState({ title: '', slug: '', content: '' });
    }
  }, [currentPage]);

  const openAddModal = () => {
    setCurrentPage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (page: AppContentPage) => {
    setCurrentPage(page);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPage(null);
    setFormState({ title: '', slug: '', content: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: name === 'title' ? value : (name === 'slug' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g, '') : value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success = false;
    const { title, slug, content } = formState;

    if (!title || !slug || !content) {
      showToast('All fields are required.', 'error');
      setIsSubmitting(false);
      return;
    }

    if (currentPage) {
      // Update
      success = await updatePage({ ...currentPage, title, slug, content });
      if (success) showToast('Page updated successfully!', 'success');
      else showToast('Failed to update page.', 'error');
    } else {
      // Add
      success = await addPage({ title, slug, content });
      if (success) showToast('Page added successfully!', 'success');
      else showToast('Failed to add page.', 'error');
    }

    setIsSubmitting(false);
    if (success) {
      closeModal();
      fetchPages(); // Re-fetch to update state in App.tsx
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      const success = await deletePage(id);
      if (success) showToast('Page deleted successfully!', 'success');
      else showToast('Failed to delete page.', 'error');
      if (success) fetchPages(); // Re-fetch to update state in App.tsx
    }
  };

  if (loading) return <div className="text-center text-gray-300">Loading pages...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Pages</h2>
        <Button onClick={openAddModal} variant="primary">
          Add New Page
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-600">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Title</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Slug</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {pages.map(page => (
              <tr key={page.id} className="hover:bg-gray-600">
                <td className="py-3 px-4 text-white text-base">{page.title}</td>
                <td className="py-3 px-4 text-gray-300 text-base">{page.slug}</td>
                <td className="py-3 px-4 flex space-x-2">
                  <Button onClick={() => openEditModal(page)} variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(page.id)} variant="danger" size="sm">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentPage ? 'Edit Page' : 'Add New Page'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 text-sm font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="slug" className="block text-gray-300 text-sm font-semibold mb-2">
              Slug (URL path)
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formState.slug}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-300 text-sm font-semibold mb-2">
              Content (Markdown)
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              value={formState.content}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              required
            ></textarea>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {currentPage ? 'Update Page' : 'Add Page'}
            </Button>
          </div>
        </form>
        {/* Optional: Preview the markdown content */}
        {formState.content && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Content Preview:</h3>
            <div className="bg-gray-900 p-4 rounded-md border border-gray-700 markdown-preview">
              <MarkdownRenderer content={formState.content} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};