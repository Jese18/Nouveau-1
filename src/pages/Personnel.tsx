import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Users, UserCheck, UserX } from "lucide-react";
import { MembreCard } from "@/components/MembreCard";
import { MembreForm } from "@/components/MembreForm";
import { BadgeGenerator } from "@/components/BadgeGenerator";
import { useMembers } from "@/hooks/useMembers";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import type { Membre } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Personnel() {
  const { membres, isLoading, deleteMembre } = useMembers("Personnel");
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("tous");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMembre, setEditingMembre] = useState<Membre | undefined>();
  const [badgeMembre, setBadgeMembre] = useState<Membre | undefined>();

  const getStatutPresence = (membre: Membre): "Présent" | "Absent" | "Absent longue durée" => {
    return "Présent";
  };

  const filteredMembres = membres.filter((membre) => {
    const matchesSearch =
      membre.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membre.prenom.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statutFilter === "tous") return matchesSearch;
    
    const statut = getStatutPresence(membre);
    return matchesSearch && statut === statutFilter;
  });

  const stats = {
    total: membres.length,
    presents: membres.filter((m) => getStatutPresence(m) === "Présent").length,
    absents: membres.filter((m) => getStatutPresence(m) !== "Présent").length,
  };

  const handleEdit = (membre: Membre) => {
    setEditingMembre(membre);
    setShowAddDialog(true);
  };

  const handleDelete = (membre: Membre) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${membre.prenom} ${membre.nom} ?`)) {
      deleteMembre(membre.id);
      toast.success("Membre supprimé avec succès");
    }
  };

  const handleGenerateBadge = (membre: Membre) => {
    setBadgeMembre(membre);
  };

  const handleFormSuccess = () => {
    setShowAddDialog(false);
    setEditingMembre(undefined);
    toast.success(editingMembre ? "Membre modifié avec succès" : "Membre ajouté avec succès");
  };

  const handleFormCancel = () => {
    setShowAddDialog(false);
    setEditingMembre(undefined);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background p-6 space-y-6"
    >
      <motion.div variants={fadeInUp} className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Gestion du Personnel</h1>
        <p className="text-muted-foreground">Gérez les membres du personnel de l'ONG MADE</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div variants={staggerItem}>
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Personnel</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-chart-2/10">
                <UserCheck className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Présents</p>
                <p className="text-3xl font-bold text-chart-2">{stats.presents}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <UserX className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absents</p>
                <p className="text-3xl font-bold text-destructive">{stats.absents}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou prénom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border focus:border-primary"
          />
        </div>
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-border">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="Présent">Présent</SelectItem>
            <SelectItem value="Absent">Absent</SelectItem>
            <SelectItem value="Absent longue durée">Absent longue durée</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditingMembre(undefined);
            setShowAddDialog(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter Personnel
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse bg-card">
              <div className="h-32 bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredMembres.length === 0 ? (
        <motion.div variants={fadeInUp} className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Aucun personnel trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statutFilter !== "tous"
              ? "Aucun résultat ne correspond à vos critères de recherche"
              : "Commencez par ajouter un membre du personnel"}
          </p>
          {!searchQuery && statutFilter === "tous" && (
            <Button
              onClick={() => {
                setEditingMembre(undefined);
                setShowAddDialog(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter Personnel
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMembres.map((membre) => (
            <motion.div key={membre.id} variants={staggerItem}>
              <MembreCard
                membre={membre}
                onEdit={() => handleEdit(membre)}
                onDelete={() => handleDelete(membre)}
                onGenerateBadge={() => handleGenerateBadge(membre)}
                statutPresence={getStatutPresence(membre)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {editingMembre ? "Modifier le Personnel" : "Ajouter un Personnel"}
            </DialogTitle>
          </DialogHeader>
          <MembreForm
            membre={editingMembre}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {badgeMembre && (
          <Dialog open={Boolean(badgeMembre)} onOpenChange={() => setBadgeMembre(undefined)}>
            <DialogContent className="max-w-4xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Générer le Badge
                </DialogTitle>
              </DialogHeader>
              <BadgeGenerator membre={badgeMembre} />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}