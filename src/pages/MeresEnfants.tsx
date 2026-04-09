import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Baby, Search, Filter } from "lucide-react";
import { MembreCard } from "@/components/MembreCard";
import { MembreForm } from "@/components/MembreForm";
import { useMembers } from "@/hooks/useMembers";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import type { Membre } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function MeresEnfants() {
  const { toast } = useToast();
  const { membres: meres, isLoading: isLoadingMeres } = useMembers("Mère");
  const { membres: enfants, isLoading: isLoadingEnfants } = useMembers("Enfant");
  const { deleteMembre, updateMembre } = useMembers();

  const [searchMeres, setSearchMeres] = useState("");
  const [searchEnfants, setSearchEnfants] = useState("");
  const [isAddingMere, setIsAddingMere] = useState(false);
  const [isAddingEnfant, setIsAddingEnfant] = useState(false);
  const [editingMembre, setEditingMembre] = useState<Membre | null>(null);
  const [selectedTab, setSelectedTab] = useState("meres");

  const filteredMeres = meres.filter(
    (m) =>
      m.nom.toLowerCase().includes(searchMeres.toLowerCase()) ||
      m.prenom.toLowerCase().includes(searchMeres.toLowerCase())
  );

  const filteredEnfants = enfants.filter(
    (e) =>
      e.nom.toLowerCase().includes(searchEnfants.toLowerCase()) ||
      e.prenom.toLowerCase().includes(searchEnfants.toLowerCase())
  );

  const handleEdit = (membre: Membre) => {
    setEditingMembre(membre);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMembre(id);
      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le membre.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateBadge = (membre: Membre) => {
    toast({
      title: "Badge généré",
      description: `Badge pour ${membre.prenom} ${membre.nom} prêt à imprimer.`,
    });
  };

  const handleFormSuccess = () => {
    setIsAddingMere(false);
    setIsAddingEnfant(false);
    setEditingMembre(null);
    toast({
      title: "Succès",
      description: "Les modifications ont été enregistrées.",
    });
  };

  const handleFormCancel = () => {
    setIsAddingMere(false);
    setIsAddingEnfant(false);
    setEditingMembre(null);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <motion.div variants={staggerItem}>
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${color}`}
            style={{
              boxShadow: "0 4px 12px rgba(255, 102, 0, 0.2)",
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mères et Enfants</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des familles et liens mère-enfant
          </p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <StatCard
          title="Total Mères"
          value={meres.length}
          icon={Users}
          color="from-primary to-primary/80"
        />
        <StatCard
          title="Total Enfants"
          value={enfants.length}
          icon={Baby}
          color="from-chart-2 to-chart-2/80"
        />
      </motion.div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="meres" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Mères ({meres.length})
          </TabsTrigger>
          <TabsTrigger value="enfants" className="flex items-center gap-2">
            <Baby className="w-4 h-4" />
            Enfants ({enfants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meres" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une mère..."
                value={searchMeres}
                onChange={(e) => setSearchMeres(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setIsAddingMere(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une mère
            </Button>
          </div>

          {isLoadingMeres ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Chargement...</p>
            </div>
          ) : filteredMeres.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchMeres
                  ? "Aucune mère trouvée"
                  : "Aucune mère enregistrée"}
              </p>
            </Card>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredMeres.map((mere) => (
                <motion.div key={mere.id} variants={staggerItem}>
                  <MembreCard
                    membre={mere}
                    onEdit={() => handleEdit(mere)}
                    onDelete={() => handleDelete(mere.id)}
                    onGenerateBadge={() => handleGenerateBadge(mere)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="enfants" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un enfant..."
                value={searchEnfants}
                onChange={(e) => setSearchEnfants(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setIsAddingEnfant(true)}
              className="bg-chart-2 hover:bg-chart-2/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un enfant
            </Button>
          </div>

          {isLoadingEnfants ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-chart-2"></div>
              <p className="text-muted-foreground mt-4">Chargement...</p>
            </div>
          ) : filteredEnfants.length === 0 ? (
            <Card className="p-12 text-center">
              <Baby className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchEnfants
                  ? "Aucun enfant trouvé"
                  : "Aucun enfant enregistré"}
              </p>
            </Card>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEnfants.map((enfant) => {
                const mere = meres.find(
                  (m) => m.id === enfant.famille_id
                );
                return (
                  <motion.div key={enfant.id} variants={staggerItem}>
                    <div className="space-y-2">
                      <MembreCard
                        membre={enfant}
                        onEdit={() => handleEdit(enfant)}
                        onDelete={() => handleDelete(enfant.id)}
                        onGenerateBadge={() => handleGenerateBadge(enfant)}
                      />
                      {mere && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Mère: {mere.prenom} {mere.nom}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {(isAddingMere || isAddingEnfant || editingMembre) && (
          <Dialog
            open={true}
            onOpenChange={(open) => {
              if (!open) handleFormCancel();
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMembre
                    ? `Modifier ${editingMembre.role.toLowerCase()}`
                    : isAddingMere
                    ? "Ajouter une mère"
                    : "Ajouter un enfant"}
                </DialogTitle>
              </DialogHeader>
              <MembreForm
                membre={
                  editingMembre
                    ? editingMembre
                    : {
                        role: isAddingMere ? "Mère" : "Enfant",
                      } as any
                }
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
