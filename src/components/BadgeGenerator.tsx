import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IMAGES } from "@/assets/images";
import { Membre, BADGE_WIDTH_MM, BADGE_HEIGHT_MM } from "@/lib/index";
import { generateBadgePDF, generateBadgePlanchePDF } from "@/lib/pdf-generator";
import { generateBarcode } from "@/lib/barcode";
import { springPresets } from "@/lib/motion";
import { useToast } from "@/hooks/use-toast";

interface BadgeGeneratorProps {
  membre: Membre;
}

export function BadgeGenerator({ membre }: BadgeGeneratorProps) {
  const [barcodeImage, setBarcodeImage] = useState<string>("");
  const { toast } = useToast();

  // Mise à jour automatique du code-barres quand le membre change
  useEffect(() => {
    if (membre.code_barre) {
      const barcode = generateBarcode(membre.code_barre);
      setBarcodeImage(barcode);
    }
  }, [membre.code_barre]);

  const handleDownloadPNG = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 4;
    canvas.width = BADGE_WIDTH_MM * scale;
    canvas.height = BADGE_HEIGHT_MM * scale;

    // Fond noir
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bordure orange
    ctx.strokeStyle = "#FF6600";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    const drawText = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 56px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${membre.prenom} ${membre.nom}`, canvas.width / 2, 112);

      ctx.fillStyle = "#FF6600";
      ctx.font = "40px Arial";
      ctx.fillText(membre.role, canvas.width / 2, 132);

      if (barcodeImage) {
        const barcode = new Image();
        barcode.src = barcodeImage;
        barcode.onload = () => {
          ctx.drawImage(barcode, 40, 148, 260, 60);
          downloadCanvas();
        };
        barcode.onerror = downloadCanvas;
      } else {
        downloadCanvas();
      }
    };

    const downloadCanvas = () => {
      const link = document.createElement("a");
      link.download = `badge_${membre.nom}_${membre.prenom}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({
        title: "Badge téléchargé",
        description: "Le format PNG est prêt.",
      });
    };

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = IMAGES.MADE_LOGO_20260408_011427_37;
    logo.onload = () => {
      ctx.drawImage(logo, 20, 20, 60, 60);
      if (membre.photo) {
        const photo = new Image();
        photo.crossOrigin = "anonymous";
        photo.src = membre.photo;
        photo.onload = () => {
          ctx.drawImage(photo, canvas.width - 88, 20, 68, 68);
          drawText();
        };
        photo.onerror = drawText;
      } else {
        drawText();
      }
    };
    logo.onerror = drawText;
  };

  const handleDownloadPDF = () => {
    try {
      generateBadgePDF(membre);
      toast({ title: "Badge PDF généré" });
    } catch (error) {
      toast({ title: "Erreur PDF", variant: "destructive" });
    }
  };

  const handlePrintPlanche = () => {
    try {
      generateBadgePlanchePDF([membre]);
      toast({ title: "Planche A4 prête" });
    } catch (error) {
      toast({ title: "Erreur Planche", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
      >
        <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50">
          <div className="flex flex-col items-center space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Aperçu du Badge</h3>
            <motion.div
              className="relative"
              style={{
                width: `${BADGE_WIDTH_MM * 3}px`,
                height: `${BADGE_HEIGHT_MM * 3}px`,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute inset-0 bg-black rounded-lg overflow-hidden border-2 border-primary">
                <img src={IMAGES.MADE_LOGO_20260408_011427_37} className="absolute top-3 left-3 w-12 h-12" alt="Logo" />
                {membre.photo && <img src={membre.photo} className="absolute top-3 right-3 w-14 h-14 rounded border border-primary" alt="Photo" />}
                <div className="absolute top-20 left-0 right-0 text-center">
                  <p className="text-white font-bold">{membre.prenom} {membre.nom}</p>
                  <p className="text-primary text-xs">{membre.role}</p>
                </div>
                {barcodeImage && <img src={barcodeImage} className="absolute bottom-2 left-4 right-4 h-10" alt="Barcode" />}
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={handleDownloadPNG} className="bg-primary text-white">
                <Download className="w-4 h-4 mr-2" /> PNG
              </Button>
              <Button onClick={handleDownloadPDF} variant="secondary">
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button onClick={handlePrintPlanche} variant="outline" className="border-primary text-primary">
                <Printer className="w-4 h-4 mr-2" /> Planche A4
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}