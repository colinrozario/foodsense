import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Scanner from './components/Scanner';
import VerdictCard from './components/VerdictCard';
import ThemeToggle from './components/ThemeToggle';
import Hero from './components/Hero';

// Configure Axios
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

function App() {
  const [view, setView] = useState('home'); // 'home', 'scanner', 'result'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBarcodeScan = async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/scan/barcode', { barcode });
      setResult(res.data);
      setView('result');
    } catch (err) {
      console.error(err);
      setError("Failed to scan product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageCapture = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/scan/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
      setView('result');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setError(null);
    setView('scanner');
  };

  const handleGoHome = () => {
    setResult(null);
    setError(null);
    setView('home');
  }

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary font-sans overflow-hidden transition-colors duration-300">

      {/* Theme Toggle - Fixed Top Right */}
      <ThemeToggle />

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-4 right-4 z-50 bg-status-error/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-lg border border-red-500/50 text-center font-bold tracking-wide"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <AnimatePresence mode="wait">

        {/* HERO VIEW */}
        {view === 'home' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-screen w-full overflow-y-auto"
          >
            <Hero
              onStartScan={() => setView('scanner')}
              onImageUpload={handleImageCapture}
            />
          </motion.div>
        )}

        {/* SCANNER VIEW */}
        {view === 'scanner' && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-screen w-full"
          >
            <Scanner
              onBarcodeScanned={handleBarcodeScan}
              onImageCaptured={handleImageCapture}
              loading={loading}
            />
            {/* Back Button for Scanner */}
            {!loading && (
              <button
                onClick={handleGoHome}
                className="fixed top-6 left-6 z-50 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
              </button>
            )}
          </motion.div>
        )}

        {/* RESULT VIEW */}
        {view === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen w-full flex items-center justify-center bg-bg-primary"
          >
            {/* Background Product Image if available (dimmed) */}
            {result.image_url && (
              <div className="absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none">
                <img src={result.image_url} alt="Product Background" className="w-full h-full object-cover grayscale" />
                <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/80 to-bg-primary" />
              </div>
            )}

            {/* Back Button from Result */}
            <button
              onClick={handleGoHome}
              className="fixed top-6 left-6 z-50 p-2 rounded-full bg-bg-secondary text-text-primary hover:bg-bg-primary shadow-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </button>

            {/* Result Card Overlay */}
            <VerdictCard result={result} onScanAgain={handleScanAgain} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
