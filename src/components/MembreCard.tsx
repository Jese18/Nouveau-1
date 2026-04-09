import { motion } from "framer-motion";
import { User, Edit, Trash2, CreditCard, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { hoverLift } from "@/lib/motion";
import type { Membre } from "@/lib/index";

interface MembreCardProps {
  membre: Membre;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateBadge: () => void;
  statutPresence?: "Présent" | "Absent" | "Absent longue durée";
}

export function MembreCard({
  membre,
  onEdit,
  onDelete,
  onGenerateBadge,
  statutPresence = "Absent",
}: MembreCardProps) {
  const [imageError, setImageError] = useState(false);

  const getStatutColor = () => {
    switch (statutPresence) {
      case "Présent":
        return "bg-chart-2";
      case "Absent":
        return "bg-chart-4";
      case "Absent longue durée":
        return "bg-destructive animate-pulse";
      default:
        return "bg-muted";
    }
  };

  const getStatutIcon = () => {
    switch (statutPresence) {
      case "Présent":
        return <CheckCircle className="w-4 h-4" />;
      case "Absent":
        return <AlertCircle className="w-4 h-4" />;
      case "Absent longue durée":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = () => {
    switch (membre.role) {
      case "Personnel":
        return "bg-primary/20 text-primary border-primary/30";
      case "Mère":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "Enfant":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      case "Bénéficiaire":
        return "bg-chart-4/20 text-chart-4 border-chart-4/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = () => {
    return `${membre.prenom.charAt(0)}${membre.nom.charAt(0)}`.toUpperCase();
  };

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="relative"
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"
          style={{
            boxShadow: "0 0 40px rgba(255, 102, 0, 0.1)",
          }}
        />

        <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  {membre.photo && !imageError ? (
                    <AvatarImage
                      src={membre.photo}
                      alt={`${membre.prenom} ${membre.nom}`}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center ${getStatutColor()}`}
                >
                  <div className="text-white text-[10px]">{getStatutIcon()}</div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-foreground">
                  {membre.prenom} {membre.nom}
                </h3>
                <Badge
                  variant="outline"
                  className={`${getRoleBadgeColor()} font-medium`}
                >
                  {membre.role}
                </Badge>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`${getStatutColor()} text-white border-0 font-medium flex items-center gap-1`}
            >
              {getStatutIcon()}
              {statutPresence}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Code: {membre.code_barre}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Inscrit le:{" "}
              {new Date(membre.date_inscription).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
            {membre.status_sante_sociale && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {membre.status_sante_sociale}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateBadge}
              className="flex-1 hover:bg-chart-2/10 hover:text-chart-2 hover:border-chart-2/30 transition-all"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Badge
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.1)",
          }}
        />
      </Card>
    </motion.div>
  );
}
