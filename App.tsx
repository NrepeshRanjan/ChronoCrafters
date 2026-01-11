import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/AdminLayout';
import { Auth } from './components/Auth';
import { PageEditor } from './components/PageEditor';
import { AdEditor } from './components/AdEditor';
import { BrandingEditor } from './components/BrandingEditor';
import { HomePage } from './pages/HomePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { AboutUsPage } from './pages/AboutUsPage';
import { FAQPage } from './pages/FAQPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Toast } from './components/Toast';
import { MarkdownRenderer } from './components/MarkdownRenderer'; // Added import for MarkdownRenderer
import { useBranding, useFooterPages, useAds } from './services/apiService';
import { Branding, FooterLink, Ad, ToastMessage } from './types';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from './constants';

const App: React.FC = () => {
  const { branding, loading: brandingLoading, error: brandingError } = useBranding();
  const { pages, loading: pagesLoading, error: pagesError } = useFooterPages();
  const { ads, loading: adsLoading, error: adsError } = useAds();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('isAdminAuthenticated', String(isAdminAuthenticated));
    if (!isAdminAuthenticated && location.pathname.startsWith('/admin')) {
      navigate('/admin/login', { replace: true });
    } else if (isAdminAuthenticated && location.pathname === '/admin/login') {
      navigate('/admin', { replace: true });
    }
  }, [isAdminAuthenticated, location.pathname, navigate]);

  const handleAdminLogin = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setToast({ message: 'Admin login successful!', type: 'success' });
      navigate('/admin');
      return true;
    }
    setToast({ message: 'Invalid admin credentials.', type: 'error' });
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setToast({ message: 'Admin logged out.', type: 'info' });
    navigate('/admin/login');
  };

  const appBranding: Branding = branding || {
    appName: 'ChronoCrafters: Temporal Tangle',
    logoUrl: 'https://picsum.photos/50/50', // Default placeholder
    primaryColor: '#6366f1', // Default indigo-500
    secondaryColor: '#a78bfa', // Default violet-400
  };

  const footerLinks: FooterLink[] = pages.map(p => ({
    title: p.title,
    path: `/page/${p.slug}`,
  }));

  const gameAds: Ad[] = ads.filter(ad => ad.placement === 'game');
  const footerAds: Ad[] = ads.filter(ad => ad.placement === 'footer');

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type });
  };

  if (brandingLoading || pagesLoading || adsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-indigo-500"></div>
        <p className="ml-3 text-lg text-gray-300">Loading app data...</p>
      </div>
    );
  }

  if (brandingError || pagesError || adsError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-900 text-red-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Application</h1>
        <p className="text-center">There was an issue fetching essential app data. Please try again later.</p>
        {brandingError && <p className="text-sm">Branding Error: {brandingError}</p>}
        {pagesError && <p className="text-sm">Pages Error: {pagesError}</p>}
        {adsError && <p className="text-sm">Ads Error: {adsError}</p>}
      </div>
    );
  }

  const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col min-h-screen">
      <Header branding={appBranding} />
      <main className="flex-grow p-4 md:p-8 container mx-auto bg-gray-800 bg-opacity-70 rounded-lg shadow-xl my-4 md:my-8">
        {children}
      </main>
      <Footer branding={appBranding} links={footerLinks} ads={footerAds} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );

  return (
    <>
      <Routes>
        {/* Public Routes (Game and Static Pages) */}
        <Route path="/" element={<PageWrapper><HomePage branding={appBranding} ads={gameAds} showToast={showToast} /></PageWrapper>} />
        <Route path="/page/privacy-policy" element={<PageWrapper><PrivacyPolicyPage branding={appBranding} /></PageWrapper>} />
        <Route path="/page/terms-of-service" element={<PageWrapper><TermsOfServicePage branding={appBranding} /></PageWrapper>} />
        <Route path="/page/about-us" element={<PageWrapper><AboutUsPage branding={appBranding} /></PageWrapper>} />
        <Route path="/page/faq" element={<PageWrapper><FAQPage branding={appBranding} /></PageWrapper>} />
        {/* Dynamic pages from admin */}
        {pages.map(p => (
          <Route key={p.id} path={`/page/${p.slug}`} element={<PageWrapper><MarkdownRenderer content={p.content} title={p.title} /></PageWrapper>} />
        ))}

        {/* Admin Login Route */}
        <Route path="/admin/login" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <Auth onLogin={handleAdminLogin} appName={appBranding.appName} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          </div>
        } />

        {/* Admin Protected Routes */}
        <Route path="/admin/*" element={
          isAdminAuthenticated ? (
            <AdminLayout branding={appBranding} onLogout={handleAdminLogout}>
              <Routes>
                <Route index element={<AdminDashboardPage />} />
                <Route path="pages" element={<PageEditor showToast={showToast} />} />
                <Route path="ads" element={<AdEditor showToast={showToast} />} />
                <Route path="branding" element={<BrandingEditor showToast={showToast} />} />
                <Route path="*" element={<NotFoundPage />} /> {/* Admin 404 */}
              </Routes>
            </AdminLayout>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
              <p className="text-xl mb-4">You need to log in to access the admin panel.</p>
              <button
                onClick={() => navigate('/admin/login')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
              >
                Go to Admin Login
              </button>
              {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
          )
        } />

        {/* Catch-all for undefined public routes */}
        <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
      </Routes>
    </>
  );
};

export default App;