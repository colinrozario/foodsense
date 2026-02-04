import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Scanner from './components/Scanner';
import VerdictCard from './components/VerdictCard';

// Configure Axios
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBarcodeScan = async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/scan/barcode', { barcode });
      setResult(res.data);
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
  };

  return (
    <div className="bg-brand-black min-h-screen text-white font-sans overflow-hidden relative">

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-4 right-4 z-50 bg-danger-red/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-lg border border-red-500/50 text-center font-bold tracking-wide"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View */}
      <AnimatePresence mode="wait">
        {!result ? (
          <Scanner
            key="scanner"
            onBarcodeScanned={handleBarcodeScan}
            onImageCaptured={handleImageCapture}
            loading={loading}
          />
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen w-full flex items-center justify-center bg-brand-black"
          >
            {/* Background Product Image if available (dimmed) */}
            {result.image_url && (
              <div className="absolute inset-0 opacity-30">
                <img src={result.image_url} alt="Product Background" className="w-full h-full object-cover grayscale" />
                <div className="absolute inset-0 bg-brand-black/80" />
              </div>
            )}

            {/* Result Card */}
            <VerdictCard result={result} onScanAgain={handleScanAgain} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
