import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, CameraOff } from 'lucide-react';

const SCANNER_ID = 'barcode-scanner-region';

const BarcodeScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const detectedRef = useRef(false);

  // Keep ref in sync without re-triggering effect
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  useEffect(() => {
    let mounted = true;
    let scanner = null;

    const start = async () => {
      // Small delay to ensure DOM element is rendered
      await new Promise((r) => setTimeout(r, 100));
      if (!mounted) return;

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 120 },
            aspectRatio: 1.5,
            disableFlip: false,
          },
          (decodedText) => {
            if (detectedRef.current) return;
            detectedRef.current = true;
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            onScanRef.current(decodedText);
          },
          () => {} // ignore not-found (continuous scanning)
        );

        if (mounted) setScanning(true);
      } catch (e) {
        console.error('BarcodeScanner error:', e);
        if (!mounted) return;
        if (e?.toString?.().includes('NotAllowed')) {
          setError('Permiso de cámara denegado. Habilítalo en la configuración del navegador.');
        } else {
          setError('No se pudo acceder a la cámara. Verifica los permisos o usa el campo de texto.');
        }
      }
    };

    start();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []); // no dependencies — runs once on mount

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-primary-600" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Escanear Código</h3>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <CameraOff size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : (
            <>
              <div id={SCANNER_ID} className="w-full rounded-lg overflow-hidden" style={{ minHeight: '280px' }} />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                {scanning
                  ? 'Apunta el código de barras dentro del recuadro. Mantén buena iluminación.'
                  : 'Iniciando cámara...'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
