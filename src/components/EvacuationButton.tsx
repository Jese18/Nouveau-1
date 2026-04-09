import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PasswordDialog } from "./PasswordDialog";
import { generateEvacuationPDF } from "@/lib/pdf-generator";
import { usePointages } from "@/hooks/usePointages";
import { useAuth } from "@/hooks/useAuth";
import type { Membre } from "@/lib/index";

export function EvacuationButton() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { pointages, isLoading } = usePointages();
  const { requirePassword } = useAuth();

  const handleEvacuation = () => {
    setShowPasswordDialog(true);
  };

  const handleConfirm = async () => {
    try {
      setIsGenerating(true);
      setShowPasswordDialog(false);

      const membresPresentsMap = new Map<string, Membre>();

      pointages.forEach((pointage) => {
        if (pointage.type === "Entrée" && pointage.membre) {
          const datePointage = new Date(pointage.date_heure);
          const aujourdhui = new Date();
          if (datePointage.toDateString() === aujourdhui.toDateString()) {
            const sortieTrouvee = pointages.find(
              (p) =>
                p.membre_id === pointage.membre_id &&
                p.type === "Sortie" &&
                new Date(p.date_heure) > datePointage &&
                new Date(p.date_heure).toDateString() === datePointage.toDateString()
            );

            if (!sortieTrouvee) {
              membresPresentsMap.set(pointage.membre_id, pointage.membre);
            }
          }
        }
      });

      const membresPresents = Array.from(membresPresentsMap.values());

      if (membresPresents.length === 0) {
        toast({
          title: "Aucune personne présente",
          description: "Il n'y a actuellement aucune personne enregistrée comme présente.",
          variant: "default",
        });
        return;
      }

      generateEvacuationPDF(membresPresents);

      toast({
        title: "PDF d'évacuation généré",
        description: `Liste de ${membresPresents.length} personne(s) présente(s) téléchargée avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur génération PDF évacuation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF d'évacuation.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Button
          onClick={handleEvacuation}
          disabled={isLoading || isGenerating}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-lg px-8 py-6 shadow-lg"
        >
          <AlertTriangle className="mr-2 h-6 w-6" />
          {isGenerating ? "Génération..." : "ÉVACUATION RAPIDE"}
        </Button>
      </motion.div>

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onConfirm={handleConfirm}
        title="Confirmation d'évacuation d'urgence"
        description="Cette action va générer la liste de toutes les personnes actuellement présentes. Veuillez entrer le mot de passe administrateur pour continuer."
      />
    </>
  );
}