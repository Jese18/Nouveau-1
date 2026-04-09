import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useBarcodeScanner } from '@/lib/scanner';
import { useMembers } from '@/hooks/useMembers';
import { usePointages } from '@/hooks/usePointages';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fadeInUp, scaleIn } from '@/lib/motion';
import type { Membre } from '@/lib/index';

interface ScannerInterfaceProps {
  onScanComplete?: (membre: Membre) => void;
}

export function ScannerInterface({ onScanComplete }: ScannerInterfaceProps) {
  const { scannedCode, reset } = useBarcodeScanner();
  const { getMemberByBarcodeAsync } = useMembers();
  const { addPointage, isAddingPointage } = usePointages();
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scannedMembre, setScannedMembre] = useState<Membre | null>(null);

  useEffect(() => {
    if (scannedCode) {
      handleScan(scannedCode);
    }
  }, [scannedCode]);

  const handleScan = async (code: string) => {
    try {
      const membre = await getMemberByBarcodeAsync(code);

      if (!membre) {
        setScanStatus('error');
        setTimeout(() => {
          setScanStatus('idle');
          reset();
        }, 3000);
        return;
      }

      setScannedMembre(membre);
      addPointage(
        { membre_id: membre.id, methode: 'Laser' },
        {
          onSuccess: () => {
            setScanStatus('success');
            onScanComplete?.(membre);
            setTimeout(() => {
              setScanStatus('idle');
              setScannedMembre(null);
              reset();
            }, 3000);
          },
          onError: () => {
            setScanStatus('error');
            setTimeout(() => {
              setScanStatus('idle');
              setScannedMembre(null);
              reset();
            }, 3000);
          },
        }
      );
    } catch (error) {
      console.error('Erreur scan:', error);
      setScanStatus('error');
      setTimeout(() => {
        setScanStatus('idle');
        reset();
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      <AnimatePresence mode="wait">
        {scanStatus === 'idle' && (
          <motion.div
            key="idle"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-center space-y-6"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Scan className="w-24 h-24 mx-auto text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Scanner un badge
              </h3>
              <p className="text-muted-foreground">
                Placez le code-barres devant le scanner laser
              </p>
            </div>
          </motion.div>
        )}

        {isAddingPointage && (
          <motion.div
            key="loading"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-center space-y-6"
          >
            <Loader2 className="w-24 h-24 mx-auto text-primary animate-spin" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Enregistrement en cours...
              </h3>
              <p className="text-muted-foreground">
                Veuillez patienter
              </p>
            </div>
          </motion.div>
        )}

        {scanStatus === 'success' && scannedMembre && (
          <motion.div
            key="success"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-center space-y-6"
          >
            <CheckCircle2 className="w-24 h-24 mx-auto text-success" />
            <Card className="p-6 max-w-md mx-auto">
              {scannedMembre.photo && (
                <img
                  src={scannedMembre.photo}
                  alt={`${scannedMembre.prenom} ${scannedMembre.nom}`}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
              )}
              <h3 className="text-2xl font-bold text-success mb-2">
                Pointage réussi !
              </h3>
              <p className="text-xl font-semibold text-foreground">
                {scannedMembre.prenom} {scannedMembre.nom}
              </p>
              <p className="text-muted-foreground">
                {scannedMembre.role}
              </p>
            </Card>
          </motion.div>
        )}

        {scanStatus === 'error' && (
          <motion.div
            key="error"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-center space-y-6"
          >
            <XCircle className="w-24 h-24 mx-auto text-destructive" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-destructive">
                Erreur de scan
              </h3>
              <p className="text-muted-foreground">
                Badge non reconnu ou erreur système
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scanStatus === 'idle' && (
        <Button
          variant="outline"
          onClick={() => reset()}
          className="mt-4"
        >
          Réinitialiser le scanner
        </Button>
      )}
    </div>
  );
}
