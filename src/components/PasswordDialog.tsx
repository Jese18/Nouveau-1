import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { springPresets } from '@/lib/motion';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function PasswordDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}: PasswordDialogProps) {
  const { requirePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setError('');
    setIsLoading(true);

    try {
      const isValid = requirePassword(password);

      if (!isValid) {
        setError('Mot de passe incorrect');
        setIsLoading(false);
        return;
      }

      onConfirm();
      handleClose();
    } catch (err) {
      setError('Erreur de vérification');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setError('');
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-primary/20 shadow-[0_8px_32px_-6px_rgba(255,102,0,0.15)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springPresets.bouncy}
              className="p-2 rounded-lg bg-primary/10 border border-primary/20"
            >
              <Lock className="w-5 h-5 text-primary" />
            </motion.div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Mot de passe administrateur
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Entrez le mot de passe"
                className="pr-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={springPresets.snappy}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-border/50 hover:bg-muted/50"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!password || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_12px_rgba(255,102,0,0.35)] hover:shadow-[0_6px_16px_rgba(255,102,0,0.45)] transition-all"
          >
            {isLoading ? 'Vérification...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
