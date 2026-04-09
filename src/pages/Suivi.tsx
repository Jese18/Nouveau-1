import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Filter, Plus, RefreshCw } from 'lucide-react';
import { PointageTable } from '@/components/PointageTable';
import { PointageTimelineChart } from '@/components/Charts';
import { usePointages } from '@/hooks/usePointages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { exportPointageToExcel } from '@/lib/excel-generator';
import { generateRapportPointagePDF } from '@/lib/pdf-generator';
import type { MethodePointage } from '@/lib/index';

export default function Suivi() {
  const { toast } = useToast();
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [membreId, setMembreId] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [methodeFilter, setMethodeFilter] = useState<string>('all');
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [manualMembreId, setManualMembreId] = useState('');
  const [timelineData, setTimelineData] = useState<any[]>([]);

  const filters = {
    ...(membreId && { membre_id: membreId }),
    ...(dateDebut && { date_debut: new Date(dateDebut).toISOString() }),
    ...(dateFin && { date_fin: new Date(dateFin).toISOString() }),
  };

  const { pointages, isLoading, statistiques, addPointage, isAddingPointage, getPointagesParJour, refetch } = usePointages(filters);

  useEffect(() => {
    const loadTimelineData = async () => {
      const stats = await getPointagesParJour(7);
      const timeline: any[] = stats.map(stat => ({
        heure: stat.date,
        entrees: stat.entrees,
        sorties: stat.sorties,
      }));
      setTimelineData(timeline);
    };
    loadTimelineData();
  }, [getPointagesParJour]);

  const handleExportExcel = () => {
    try {
      exportPointageToExcel(pointages);
      toast({
        title: 'Export réussi',
        description: 'Le fichier Excel a été téléchargé avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de l\'export Excel.',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = () => {
    try {
      const debut = dateDebut || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fin = dateFin || new Date().toISOString().split('T')[0];
      generateRapportPointagePDF(pointages, debut, fin);
      toast({
        title: 'Export réussi',
        description: 'Le rapport PDF a été généré avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de la génération du PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleManualPointage = () => {
    if (!manualMembreId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un membre.',
        variant: 'destructive',
      });
      return;
    }

    addPointage(
      { membre_id: manualMembreId, methode: 'Manuel' as MethodePointage },
      {
        onSuccess: () => {
          toast({
            title: 'Pointage enregistré',
            description: 'Le pointage manuel a été enregistré avec succès.',
          });
          setIsManualDialogOpen(false);
          setManualMembreId('');
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Échec de l\'enregistrement du pointage.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleResetFilters = () => {
    setDateDebut('');
    setDateFin('');
    setMembreId('');
    setTypeFilter('all');
    setMethodeFilter('all');
  };

  const filteredPointages = pointages.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (methodeFilter !== 'all' && p.methode !== methodeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Suivi des Présences</h1>
            <p className="text-muted-foreground mt-2">Gestion et analyse des pointages</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Pointage Manuel
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Pointage Manuel</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Enregistrer un pointage manuel pour un membre
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-membre" className="text-foreground">ID Membre</Label>
                    <Input
                      id="manual-membre"
                      value={manualMembreId}
                      onChange={(e) => setManualMembreId(e.target.value)}
                      placeholder="Entrez l'ID du membre"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleManualPointage}
                    disabled={isAddingPointage}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isAddingPointage ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Filtres Avancés
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Affinez votre recherche de pointages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-debut" className="text-foreground">Date Début</Label>
                  <Input
                    id="date-debut"
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-fin" className="text-foreground">Date Fin</Label>
                  <Input
                    id="date-fin"
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type-filter" className="text-foreground">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="Entrée">Entrée</SelectItem>
                      <SelectItem value="Sortie">Sortie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methode-filter" className="text-foreground">Méthode</Label>
                  <Select value={methodeFilter} onValueChange={setMethodeFilter}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="Laser">Laser</SelectItem>
                      <SelectItem value="Manuel">Manuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleResetFilters} className="w-full">
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Membres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {statistiques?.total_membres || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Présents Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {statistiques?.presents_aujourdhui || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absents 3+ Jours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {statistiques?.absents_3_jours || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taux de Présence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {statistiques?.taux_presence || 0}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Timeline des Pointages</CardTitle>
                  <CardDescription className="text-muted-foreground">7 derniers jours</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timelineData.length > 0 ? (
                <PointageTimelineChart data={timelineData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Liste des Pointages</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {filteredPointages.length} pointage(s) trouvé(s)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportExcel}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chargement...
                </div>
              ) : (
                <PointageTable />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
