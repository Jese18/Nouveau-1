import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Calendar, Filter, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useMembers } from '@/hooks/useMembers';
import { usePointages } from '@/hooks/usePointages';
import { usePharmacie } from '@/hooks/usePharmacie';
import {
  exportPresenceToExcel,
  exportPointageToExcel,
  exportPharmacieToExcel,
  exportStatistiquesRoleToExcel,
  exportConsultationsToExcel,
} from '@/lib/excel-generator';
import {
  generatePresenceListPDF,
  generateRapportPointagePDF,
  generateInventairePharmaciePDF,
} from '@/lib/pdf-generator';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

interface ExportHistoryItem {
  id: string;
  type: string;
  format: string;
  date: string;
  status: 'success' | 'error';
}

function getExportHistory(): ExportHistoryItem[] {
  try {
    const data = localStorage.getItem('made_export_history');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function addToExportHistory(item: Omit<ExportHistoryItem, 'id' | 'date'>): void {
  try {
    const history = getExportHistory();
    const newItem: ExportHistoryItem = {
      id: crypto.randomUUID(),
      ...item,
      date: new Date().toISOString(),
    };
    history.unshift(newItem);
    localStorage.setItem('made_export_history', JSON.stringify(history.slice(0, 50)));
  } catch (error) {
    console.error('Erreur sauvegarde historique:', error);
  }
}

export default function Exportation() {
  const { membres } = useMembers();
  const { pointages } = usePointages();
  const { medicaments, consultations } = usePharmacie();

  const [datePresence, setDatePresence] = useState(new Date().toISOString().split('T')[0]);
  const [dateDebutPointage, setDateDebutPointage] = useState('');
  const [dateFinPointage, setDateFinPointage] = useState('');
  const [dateDebutConsultation, setDateDebutConsultation] = useState('');
  const [dateFinConsultation, setDateFinConsultation] = useState('');
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>(getExportHistory());

  const handleExportPresencePDF = () => {
    try {
      const membresPresents = membres.filter((m) => {
        const pointagesMembre = pointages.filter(
          (p) => p.membre_id === m.id && p.date_heure.startsWith(datePresence)
        );
        const entree = pointagesMembre.find((p) => p.type === 'Entrée');
        const sortie = pointagesMembre.find((p) => p.type === 'Sortie');
        return entree && !sortie;
      });

      generatePresenceListPDF(membresPresents, datePresence);
      addToExportHistory({ type: 'Liste de présence', format: 'PDF', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Liste de présence PDF téléchargée',
      });
    } catch (error) {
      addToExportHistory({ type: 'Liste de présence', format: 'PDF', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export PDF',
      });
    }
  };

  const handleExportPresenceExcel = () => {
    try {
      exportPresenceToExcel(membres, pointages, datePresence);
      addToExportHistory({ type: 'Liste de présence', format: 'Excel', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Liste de présence Excel téléchargée',
      });
    } catch (error) {
      addToExportHistory({ type: 'Liste de présence', format: 'Excel', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export Excel',
      });
    }
  };

  const handleExportPointagePDF = () => {
    if (!dateDebutPointage || !dateFinPointage) {
      toast.error('Dates requises', {
        description: 'Veuillez sélectionner une période',
      });
      return;
    }

    try {
      const pointagesFiltres = pointages.filter(
        (p) => p.date_heure >= dateDebutPointage && p.date_heure <= dateFinPointage
      );
      generateRapportPointagePDF(pointagesFiltres, dateDebutPointage, dateFinPointage);
      addToExportHistory({ type: 'Rapport pointage', format: 'PDF', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Rapport pointage PDF téléchargé',
      });
    } catch (error) {
      addToExportHistory({ type: 'Rapport pointage', format: 'PDF', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export PDF',
      });
    }
  };

  const handleExportPointageExcel = () => {
    if (!dateDebutPointage || !dateFinPointage) {
      toast.error('Dates requises', {
        description: 'Veuillez sélectionner une période',
      });
      return;
    }

    try {
      exportPointageToExcel(pointages, dateDebutPointage, dateFinPointage);
      addToExportHistory({ type: 'Rapport pointage', format: 'Excel', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Rapport pointage Excel téléchargé',
      });
    } catch (error) {
      addToExportHistory({ type: 'Rapport pointage', format: 'Excel', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export Excel',
      });
    }
  };

  const handleExportPharmaciePDF = () => {
    try {
      generateInventairePharmaciePDF(medicaments);
      addToExportHistory({ type: 'Inventaire pharmacie', format: 'PDF', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Inventaire pharmacie PDF téléchargé',
      });
    } catch (error) {
      addToExportHistory({ type: 'Inventaire pharmacie', format: 'PDF', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export PDF',
      });
    }
  };

  const handleExportPharmacieExcel = () => {
    try {
      exportPharmacieToExcel(medicaments);
      addToExportHistory({ type: 'Inventaire pharmacie', format: 'Excel', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Inventaire pharmacie Excel téléchargé',
      });
    } catch (error) {
      addToExportHistory({ type: 'Inventaire pharmacie', format: 'Excel', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export Excel',
      });
    }
  };

  const handleExportStatistiquesExcel = () => {
    try {
      exportStatistiquesRoleToExcel(membres, pointages, datePresence);
      addToExportHistory({ type: 'Statistiques', format: 'Excel', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Statistiques Excel téléchargées',
      });
    } catch (error) {
      addToExportHistory({ type: 'Statistiques', format: 'Excel', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export Excel',
      });
    }
  };

  const handleExportConsultationsExcel = () => {
    try {
      exportConsultationsToExcel(consultations, dateDebutConsultation, dateFinConsultation);
      addToExportHistory({ type: 'Consultations', format: 'Excel', status: 'success' });
      setExportHistory(getExportHistory());
      toast.success('Export réussi', {
        description: 'Consultations Excel téléchargées',
      });
    } catch (error) {
      addToExportHistory({ type: 'Consultations', format: 'Excel', status: 'error' });
      toast.error('Erreur export', {
        description: error instanceof Error ? error.message : 'Échec export Excel',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        <motion.div variants={staggerItem}>
          <h1 className="text-4xl font-bold text-foreground mb-2">Exportation</h1>
          <p className="text-muted-foreground">Centre d'exportation centralisé pour tous les rapports</p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Tabs defaultValue="presence" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-card">
              <TabsTrigger value="presence">Liste de Présence</TabsTrigger>
              <TabsTrigger value="pointage">Rapports Pointage</TabsTrigger>
              <TabsTrigger value="pharmacie">Inventaire Pharmacie</TabsTrigger>
              <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
            </TabsList>

            <TabsContent value="presence" className="space-y-6 mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Liste de Présence
                  </CardTitle>
                  <CardDescription>Exportez la liste des membres présents pour une date donnée</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="date-presence">Date</Label>
                    <Input
                      id="date-presence"
                      type="date"
                      value={datePresence}
                      onChange={(e) => setDatePresence(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleExportPresencePDF} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button onClick={handleExportPresenceExcel} variant="outline" className="gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pointage" className="space-y-6 mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Rapports de Pointage
                  </CardTitle>
                  <CardDescription>Exportez les pointages pour une période donnée</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-debut-pointage">Date de début</Label>
                      <Input
                        id="date-debut-pointage"
                        type="date"
                        value={dateDebutPointage}
                        onChange={(e) => setDateDebutPointage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-fin-pointage">Date de fin</Label>
                      <Input
                        id="date-fin-pointage"
                        type="date"
                        value={dateFinPointage}
                        onChange={(e) => setDateFinPointage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleExportPointagePDF} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button onClick={handleExportPointageExcel} variant="outline" className="gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pharmacie" className="space-y-6 mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Inventaire Pharmacie
                  </CardTitle>
                  <CardDescription>Exportez l'inventaire complet de la pharmacie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total médicaments: <span className="font-semibold text-foreground">{medicaments.length}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      En alerte: <span className="font-semibold text-destructive">{medicaments.filter((m) => m.en_alerte).length}</span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleExportPharmaciePDF} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button onClick={handleExportPharmacieExcel} variant="outline" className="gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistiques" className="space-y-6 mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Statistiques par Rôle
                  </CardTitle>
                  <CardDescription>Exportez les statistiques de présence par rôle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="date-stats">Date</Label>
                    <Input
                      id="date-stats"
                      type="date"
                      value={datePresence}
                      onChange={(e) => setDatePresence(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleExportStatistiquesExcel} className="gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6 mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Consultations Médicales
                  </CardTitle>
                  <CardDescription>Exportez l'historique des consultations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-debut-consultation">Date de début</Label>
                      <Input
                        id="date-debut-consultation"
                        type="date"
                        value={dateDebutConsultation}
                        onChange={(e) => setDateDebutConsultation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-fin-consultation">Date de fin</Label>
                      <Input
                        id="date-fin-consultation"
                        type="date"
                        value={dateFinConsultation}
                        onChange={(e) => setDateFinConsultation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total consultations: <span className="font-semibold text-foreground">{consultations.length}</span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleExportConsultationsExcel} className="gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Historique des Exports
              </CardTitle>
              <CardDescription>Derniers exports effectués</CardDescription>
            </CardHeader>
            <CardContent>
              {exportHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun export effectué</p>
              ) : (
                <div className="space-y-3">
                  {exportHistory.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.status === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.date).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                        {item.format}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card border-border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Rapports Automatiques
              </CardTitle>
              <CardDescription>Configuration des rapports quotidiens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Rapport quotidien activé</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Génération automatique tous les jours à 18h00
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Inclut: Liste de présence, Rapport pointage, Inventaire pharmacie
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Format des rapports automatiques</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF uniquement</SelectItem>
                    <SelectItem value="excel">Excel uniquement</SelectItem>
                    <SelectItem value="both">PDF et Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
