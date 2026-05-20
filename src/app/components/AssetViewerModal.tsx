import React, { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Asset = {
  _id: string;
  title: string;
  description: string;
  fileMime: string;
  fileName?: string;
  price: number;
  owned?: boolean;
};

type Props = {
  asset: Asset | null;
  onClose: () => void;
};

export default function AssetViewerModal({ asset, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeText, setOfficeText] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    setOfficeText('');
    let activeUrl: string | null = null;
    
    const fetchAndRender = async () => {
      try {
        const token = document.cookie.match(/token=([^;]+)/)?.[1] ?? '';
        const res = await fetch(`/api/store/${asset._id}/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Failed to fetch document' }));
          throw new Error(err.error || 'Failed to fetch document');
        }
        
        const blob = await res.blob();
        activeUrl = URL.createObjectURL(blob);
        setBlobUrl(activeUrl);

        if (asset.fileMime !== 'application/pdf') {
          // For non-PDF types
          setOfficeText('Preview is not available for this file type. Please download the file to view it.');
        }
        
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? 'Failed to load document');
        setLoading(false);
      }
    };
    
    fetchAndRender();
    
    return () => {
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [asset]);

  if (!asset) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
      >
        <motion.div
          className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-6xl h-full flex flex-col relative"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 shrink-0">
            <h2 className="text-lg font-bold text-[#0a2617] dark:text-white truncate pr-4">{asset.title}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-[#1a1a1a]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-[#4a7c5d]">
                <RefreshCw className="w-6 h-6 mr-3 animate-spin" /> 
                <span className="font-medium">Loading document…</span>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-red-50 text-red-800 px-6 py-4 rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              </div>
            )}

            {/* Native PDF iframe rendering */}
            {asset.fileMime === 'application/pdf' && !loading && !error && blobUrl && (
              <iframe 
                src={blobUrl} 
                className="w-full h-full border-0" 
                title={asset.title}
              />
            )}

            {/* Office document preview fallback */}
            {asset.fileMime !== 'application/pdf' && !loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-white dark:bg-[#222] px-6 py-4 rounded-xl border border-gray-200 dark:border-white/10 text-center">
                  <p className="text-[#0a2617] dark:text-gray-200 font-medium mb-2">{officeText}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-gray-100 dark:border-white/10 shrink-0 flex gap-3 justify-end bg-white dark:bg-[#111] rounded-b-2xl">
            {(asset.price === 0 || asset.owned) && blobUrl ? (
              <a href={blobUrl} download={asset.fileName || `${asset.title}.pdf`} className="px-5 py-2.5 bg-[#0d5d3a] text-white rounded-xl hover:bg-[#0a4a2e] font-bold text-sm transition">
                Download File
              </a>
            ) : (
              <button className="px-5 py-2.5 bg-gray-400 text-white rounded-xl cursor-not-allowed font-bold text-sm" disabled title="Premium asset – download disabled">
                Purchase to Download
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
