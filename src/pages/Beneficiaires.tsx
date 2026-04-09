import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, UserCheck, AlertCircle, Filter } from 'lucide-react';
import { MembreCard } from '@/components/MembreCard';
import { MembreForm } from '@/components/MembreForm';
import { useMembers } from '@/hooks/useMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';
import type { Membre } from '@/lib/index';
import { useToast } from '@/hooks/use-toast';

export default function Beneficiaires() {
  const { membres, isLoading, addMembre, updateMembre, deleteMembre, refetch } = useMembers('Bénéficiaire');
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState<Membre | undefined>(undefined);

  const filteredBeneficiaires = membres.filter((membre) => {
    const matchesSearch =
      membre.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membre.prenom.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && membre.status_sante_sociale?.includes('actif');
    if (filterStatus === 'inactive') return matchesSearch && !membre.status_sante_sociale?.includes('actif');
    
    return matchesSearch;
  });

  const stats = {
    total: membres.length,
    actifs: membres.filter((m) => m.status_sante_sociale?.includes('actif')).length,
    inactifs: membres.filter((m) => !m.status_sante_sociale?.includes('actif')).length,
  };

  const handleEdit = (membre: Membre) => {
    setSelectedMembre(membre);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMembre(id);
      toast({
        title: 'Bénéficiaire supprimé',
        description: 'Le bénéficiaire a été supprimé avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le bénéficiaire.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedMembre(undefined);
    refetch();
    toast({
      title: selectedMembre ? 'Bénéficiaire modifié' : 'Bénéficiaire ajouté',
      description: selectedMembre
        ? 'Les informations ont été mises à jour.'
        : 'Le nouveau bénéficiaire a été enregistré.',
    });
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedMembre(undefined);
  };

  const handleAddNew = () => {
    setSelectedMembre(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Bénéficiaires</h1>
            <p className="text-muted-foreground">Gestion des bénéficiaires de l'ONG MADE</p>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un bénéficiaire
          </Button>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={staggerItem}>
            <Card className="p-6 bg-card border-border shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Bénéficiaires</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="p-6 bg-card border-border shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Actifs</p>
                  <p className="text-3xl font-bold text-chart-2">{stats.actifs}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="p-6 bg-card border-border shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inactifs</p>
                  <p className="text-3xl font-bold text-muted-foreground">{stats.inactifs}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <Card className="p-6 bg-card border-border shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou prénom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-background border-border">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredBeneficiaires.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'Aucun bénéficiaire trouvé avec ces critères'
                  : 'Aucun bénéficiaire enregistré'}
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredBeneficiaires.map((membre) => (
                  <motion.div
                    key={membre.id}
                    variants={staggerItem}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={springPresets.snappy}
                  >
                    <MembreCard
                      membre={membre}
                      onEdit={() => handleEdit(membre)}
                      onDelete={() => handleDelete(membre.id)}
                      onGenerateBadge={() => {
                        toast({
                          title: 'Badge généré',
                          description: 'Le badge a été généré avec succès.',
                        });
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Card>
      </motion.div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {selectedMembre ? 'Modifier le bénéficiaire' : 'Ajouter un bénéficiaire'}
            </DialogTitle>
          </DialogHeader>
          <MembreForm
            membre={selectedMembre}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
