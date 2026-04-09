import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { ScannerInterface } from '@/components/ScannerInterface';
import { PasswordDialog } from '@/components/PasswordDialog';
import { ROUTE_PATHS } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';

export default function ModeKiosque() {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleExitConfirm = () => {
    setShowExitDialog(false);
    navigate(ROUTE_PATHS.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full px-8 py-6 flex items-center justify-between border-b border-border/50"
      >
        <div className="flex items-center gap-4">
          <img
            src={IMAGES.MADE_LOGO_20260408_011427_37}
            alt="MADE Logo"
            className="h-16 w-auto object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">ONG MADE</h1>
            <p className="text-sm text-muted-foreground">Mode Kiosque - Pointage Automatique</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExitDialog(true)}
          className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sortir
        </Button>
      </motion.header>

      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-4xl"
        >
          <ScannerInterface />
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full px-8 py-4 border-t border-border/50 text-center"
      >
        <p className="text-sm text-muted-foreground">
          © 2026 ONG MADE - Antananarivo, Madagascar
        </p>
      </motion.footer>

      <PasswordDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={handleExitConfirm}
        title="Sortir du Mode Kiosque"
        description="Veuillez entrer le mot de passe administrateur pour quitter le mode kiosque et retourner au tableau de bord."
      />
    </div>
  );
}
