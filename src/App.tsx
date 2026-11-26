import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import BuildDetailPage from './pages/BuildDetailPage';
import HomePage from './pages/HomePage';
import { generateAll3DPreviews } from './utils/previewRenderer';

export default function App() {
  const [loadProgress, setLoadProgress] = useState(12);
  const [previewsReady, setPreviewsReady] = useState(false);

  useEffect(() => {
    let active = true;
    generateAll3DPreviews((pct) => {
      if (active) setLoadProgress(pct);
    })
      .then(() => {
        if (active) {
          setLoadProgress(100);
          setPreviewsReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setLoadProgress(100);
          setPreviewsReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <BrowserRouter>
      <LoadingScreen progress={loadProgress} ready={previewsReady} />
      <CustomCursor />
      <Navbar />
      <main className="min-h-screen bg-[#07090D]">
        <Routes>
          <Route path="/" element={<HomePage previewsReady={previewsReady} />} />
          <Route
            path="/builds/:slug"
            element={<BuildDetailPage previewsReady={previewsReady} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
