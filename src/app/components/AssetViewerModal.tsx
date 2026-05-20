import React, { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// pdfjs-dist imports – we load the worker dynamically
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// officeparser import – removed as it causes browser crashes due to Node.js dependencies
// import { parseOfficeAsync } from 'officeparser';

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
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [officeText, setOfficeText] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Configure pdfjs worker using Vite's ?url syntax
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  useEffect(() => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    setPdfDoc(null);
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

        if (asset.fileMime === 'application/pdf') {
          const arrayBuffer = await blob.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          const num = pdf.numPages;
          const pageArr = [];
          for (let i = 1; i <= num; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            pageArr.push(canvas.toDataURL());
          }
          setPages(pageArr);
        } else {
          // For DOCX, PPTX, XLSX, ODT, etc., officeparser was removed due to browser incompatibility
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
    // Cleanup on unmount – pdfjs doesn't hold heavy resources after render
    return () => {
      setPdfDoc(null);
      setPages([]);
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [asset]);

  if (!asset) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
      >
        <motion.div
          className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-[95vw] max-w-none h-[95vh] max-h-none overflow-y-auto p-6 sm:p-8 relative"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0a2617] dark:text-white">{asset.title}</h2>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 text-[#4a7c5d]">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Loading preview…
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded">{error}</div>
          )}

          {/* PDF rendering */}
          {asset.fileMime === 'application/pdf' && !loading && !error && (
            <div className="space-y-4">
              {pages.map((src, idx) => (
                <img key={idx} src={src} alt={`Page ${idx + 1}`} className="w-full border rounded" />
              ))}
            </div>
          )}

          {/* Office document preview (text only) */}
          {asset.fileMime !== 'application/pdf' && !loading && !error && (
            <pre className="whitespace-pre-wrap text-sm text-[#0a2617] dark:text-gray-200 bg-gray-50 dark:bg-[#222] p-4 rounded border">
              {officeText || 'No preview available for this file type.'}
            </pre>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3 justify-end">
            {(asset.price === 0 || asset.owned) && blobUrl ? (
              <a href={blobUrl} download={asset.fileName || `${asset.title}.pdf`} className="px-4 py-2 bg-[#0d5d3a] text-white rounded hover:bg-[#0a4a2e] transition">
                Download File
              </a>
            ) : (
              <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled title="Premium asset – download disabled">
                Purchase to Download
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
