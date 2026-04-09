import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle, Printer } from 'lucide-react';
import { MembreForm } from '@/components/MembreForm';
import { BadgeGenerator } from '@/components/BadgeGenerator';
import { useMembers } from '@/hooks/useMembers';
import type { Membre } from '@/lib/index';
import { springPresets, fadeInUp } from '@/lib/motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Enregistrer() {
  const [showBadgeGenerator, setShowBadgeGenerator] = useState(false);
  const [registeredMembre, setRegisteredMembre] = useState<Membre | null>(null);
  const { addMembreAsync } = useMembers();
  const { toast } = useToast();

  const handleSuccess = async (membre: Membre) => {
    setRegisteredMembre(membre);
    setShowBadgeGenerator(true);
    
    toast({
      title: 'Membre enregistré avec succès',
      description: `${membre.prenom} ${membre.nom} a été ajouté au système.`,
      variant: 'default',
    });
  };

  const handlePrintBadge = () => {
    toast({
      title: 'Badge en cours d\'impression',
      description: 'Le badge sera téléchargé automatiquement.',
      variant: 'default',
    });
  };

  const handleNewRegistration = () => {
    setShowBadgeGenerator(false);
    setRegisteredMembre(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Enregistrement Rapide</h1>
              <p className="text-muted-foreground mt-1">
                Ajoutez un nouveau membre et générez son badge instantanément
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showBadgeGenerator ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springPresets.gentle}
            >
              <Card className="p-8 bg-card border-border shadow-lg">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Informations du membre
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Remplissez les champs ci-dessous pour créer un nouveau membre
                  </p>
                </div>
              <MembreForm
                onSuccess={() => {}}
                onCancel={() => setShowBadgeGenerator(false)}
              />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="badge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springPresets.gentle}
              className="space-y-6"
            >
              <Card className="p-8 bg-card border-border shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Enregistrement réussi !
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Le membre a été ajouté avec succès. Vous pouvez maintenant imprimer son badge.
                    </p>
                  </div>
                </div>

                {registeredMembre && (
                  <div className="space-y-6">
                    <div className="bg-muted/30 rounded-lg p-6 border border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Aperçu du badge
                      </h3>
                      <BadgeGenerator membre={registeredMembre} />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handlePrintBadge}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="lg"
                      >
                        <Printer className="w-5 h-5 mr-2" />
                        Imprimer le badge
                      </Button>
                      <Button
                        onClick={handleNewRegistration}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Nouveau membre
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-accent/5 border-accent/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Prochaines étapes
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Le code-barres a été généré automatiquement</li>
                      <li>• Le badge est prêt à être imprimé au format 85x55mm</li>
                      <li>• Le membre peut maintenant utiliser son badge pour pointer</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
