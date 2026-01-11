import { useState, useEffect, useCallback } from 'react';
import { Branding, AppContentPage, Ad } from '../types';
import { DEFAULT_BRANDING, DEFAULT_PAGES, DEFAULT_ADS } from '../constants';

const LOCAL_STORAGE_KEY_BRANDING = 'chronocrafters_branding';
const LOCAL_STORAGE_KEY_PAGES = 'chronocrafters_pages';
const LOCAL_STORAGE_KEY_ADS = 'chronocrafters_ads';

// Helper to simulate API delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- Branding API ---
export const useBranding = () => {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await simulateDelay(); // Simulate network request
      const storedBranding = localStorage.getItem(LOCAL_STORAGE_KEY_BRANDING);
      if (storedBranding) {
        setBranding(JSON.parse(storedBranding));
      } else {
        setBranding(DEFAULT_BRANDING);
        localStorage.setItem(LOCAL_STORAGE_KEY_BRANDING, JSON.stringify(DEFAULT_BRANDING));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch branding');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateBranding = useCallback(async (newBranding: Branding) => {
    try {
      setLoading(true);
      setError(null);
      await simulateDelay();
      localStorage.setItem(LOCAL_STORAGE_KEY_BRANDING, JSON.stringify(newBranding));
      setBranding(newBranding);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update branding');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { branding, loading, error, updateBranding, fetchBranding };
};

// --- Pages API ---
export const useFooterPages = () => {
  const [pages, setPages] = useState<AppContentPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await simulateDelay();
      const storedPages = localStorage.getItem(LOCAL_STORAGE_KEY_PAGES);
      if (storedPages) {
        setPages(JSON.parse(storedPages));
      } else {
        setPages(DEFAULT_PAGES);
        localStorage.setItem(LOCAL_STORAGE_KEY_PAGES, JSON.stringify(DEFAULT_PAGES));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPage = useCallback(async (newPage: Omit<AppContentPage, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      await simulateDelay();
      const pageWithId: AppContentPage = { ...newPage, id: Date.now().toString() };
      setPages(prev => {
        const updatedPages = [...prev, pageWithId];
        localStorage.setItem(LOCAL_STORAGE_KEY_PAGES, JSON.stringify(updatedPages));
        return updatedPages;
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to add page');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePage = useCallback(async (updatedPage: AppContentPage) => {
    try {
      setLoading(true);
      setError(null);
      await simulateDelay();
      setPages(prev => {
        const updated = prev.map(p => (p.id === updatedPage.id ? updatedPage : p));
        localStorage.setItem(LOCAL_STORAGE_KEY_PAGES, JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update page');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePage = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await simulateDelay();
      setPages(prev => {
        const filtered = prev.filter(p => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_PAGES, JSON.stringify(filtered));
        return filtered;
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete page');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { pages, loading, error, addPage, updatePage, deletePage, fetchPages };
};

// --- Ads API ---
export const useAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await simulateDelay();
      const storedAds = localStorage.getItem(LOCAL_STORAGE_KEY_ADS);
      if (storedAds) {
        setAds(JSON.parse(storedAds));
      } else {
        setAds(DEFAULT_ADS);
        localStorage.setItem(LOCAL_STORAGE_KEY_ADS, JSON.stringify(DEFAULT_ADS));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAd = useCallback(async (newAd: Omit<Ad, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      await simulateDelay();
      const adWithId: Ad = { ...newAd, id: Date.now().toString() };
      setAds(prev => {
        const updatedAds = [...prev, adWithId];
        localStorage.setItem(LOCAL_STORAGE_KEY_ADS, JSON.stringify(updatedAds));
        return updatedAds;
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to add ad');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAd = useCallback(async (updatedAd: Ad) => {
    try {
      setLoading(true);
      setError(null);
      await simulateDelay();
      setAds(prev => {
        const updated = prev.map(a => (a.id === updatedAd.id ? updatedAd : a));
        localStorage.setItem(LOCAL_STORAGE_KEY_ADS, JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update ad');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAd = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await simulateDelay();
      setAds(prev => {
        const filtered = prev.filter(a => a.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_ADS, JSON.stringify(filtered));
        return filtered;
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete ad');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { ads, loading, error, addAd, updateAd, deleteAd, fetchAds };
};