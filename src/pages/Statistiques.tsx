import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PresenceChart, RoleDistributionChart, PointageTimelineChart } from '@/components/Charts';
import { usePointages } from '@/hooks/usePointages';
import { useMembers } from '@/hooks/useMembers';
import { exportPointageToExcel, exportStatistiquesRoleToExcel } from '@/lib/excel-generator';
import { generateRapportPointagePDF } from '@/lib/pdf-generator';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';
import type { StatistiquePointage, StatistiqueRole, Role } from '@/lib/index';

type PeriodeFilter = 'jour' | 'semaine' | 'mois' | 'annee';

export default function Statistiques() {
  const { toast } = useToast();
  const { pointages, getPointagesParJour, isLoading: isLoadingPointages } = usePointages();
  const { membres, isLoading: isLoadingMembres } = useMembers();
  const [periode, setPeriode] = useState<PeriodeFilter>('semaine');
  const [presenceData, setPresenceData] = useState<StatistiquePointage[]>([]);
  const [roleData, setRoleData] = useState<StatistiqueRole[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const periodeJours: Record<PeriodeFilter, number> = {
    jour: 1,
    semaine: 7,
    mois: 30,
    annee: 365,
  };

  useEffect(() => {
    loadStatistiques();
  }, [periode, pointages, membres]);

  const loadStatistiques = async () => {
    if (isLoadingPointages || isLoadingMembres) return;
    setIsLoadingStats(true);

    try {
      const jours = periodeJours[periode];
      const presenceStats = await getPointagesParJour(jours);
      setPresenceData(presenceStats);

      const roles: Role[] = ['Personnel', 'Mère', 'Enfant', 'Bénéficiaire'];
      const roleStats: StatistiqueRole[] = roles.map((role) => {
        const membresRole = membres.filter((m) => m.role === role);
        const aujourdhui = new Date().toISOString().split('T')[0];
        const pointagesAujourdhui = pointages.filter((p) =>
          p.date_heure.startsWith(aujourdhui)
        );
        const presentIds = new Set(
          pointagesAujourdhui.filter((p) => p.type === 'Entrée').map((p) => p.membre_id)
        );
        const sortieIds = new Set(
          pointagesAujourdhui.filter((p) => p.type === 'Sortie').map((p) => p.membre_id)
        );
        const presents = membresRole.filter(
          (m) => presentIds.has(m.id) && !sortieIds.has(m.id)
        ).length;
        const tauxPresence =
          membresRole.length > 0 ? (presents / membresRole.length) * 100 : 0;

        return {
          role,
          total: membresRole.length,
          presents,
          absents: membresRole.length - presents,
          taux_presence: Math.round(tauxPresence * 10) / 10,
        };
      });
      setRoleData(roleStats);

      const heures = Array.from({ length: 24 }, (_, i) => i);
      const timelineStats: any[] = heures.map((heure) => {
        const pointagesHeure = pointages.filter((p) => {
          const datePointage = new Date(p.date_heure);
          return datePointage.getHours() === heure;
        });
        const entrees = pointagesHeure.filter((p) => p.type === 'Entrée').length;
        const sorties = pointagesHeure.filter((p) => p.type === 'Sortie').length;

        return {
          heure: `${heure.toString().padStart(2, '0')}:00`,
          entrees,
          sorties,
        };
      });
      setTimelineData(timelineStats);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const aujourdhui = new Date();
      const debut = new Date(aujourdhui);
      debut.setDate(debut.getDate() - periodeJours[periode]);

      exportPointageToExcel(
        pointages,
        debut.toISOString().split('T')[0],
        aujourdhui.toISOString().split('T')[0]
      );

      toast({
        title: 'Export réussi',
        description: 'Statistiques exportées en Excel',
      });
    } catch (error) {
      console.error('Erreur export Excel:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'exporter en Excel",
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = () => {
    try {
      const aujourdhui = new Date();
      const debut = new Date(aujourdhui);
      debut.setDate(debut.getDate() - periodeJours[periode]);

      generateRapportPointagePDF(
        pointages,
        debut.toISOString().split('T')[0],
        aujourdhui.toISOString().split('T')[0]
      );

      toast({
        title: 'Export réussi',
        description: 'Rapport PDF généré',
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le PDF',
        variant: 'destructive',
      });
    }
  };

  const handleExportRoleExcel = () => {
    try {
      const aujourdhui = new Date().toISOString().split('T')[0];
      exportStatistiquesRoleToExcel(membres, pointages, aujourdhui);

      toast({
        title: 'Export réussi',
        description: 'Statistiques par rôle exportées',
      });
    } catch (error) {
      console.error('Erreur export rôle Excel:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'exporter les statistiques par rôle",
        variant: 'destructive',
      });
    }
  };

  const isLoading = isLoadingPointages || isLoadingMembres || isLoadingStats;

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Statistiques Détaillées</h1>
            <p className="text-muted-foreground">Analyse approfondie des présences et pointages</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springPresets.snappy}
          >
            <TrendingUp className="w-12 h-12 text-primary" />
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <motion.div variants={staggerItem}>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Membres</p>
                    <p className="text-3xl font-bold text-foreground">{membres.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pointages</p>
                    <p className="text-3xl font-bold text-foreground">{pointages.length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-chart-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Période</p>
                    <Select value={periode} onValueChange={(v) => setPeriode(v as PeriodeFilter)}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jour">Aujourd'hui</SelectItem>
                        <SelectItem value="semaine">7 derniers jours</SelectItem>
                        <SelectItem value="mois">30 derniers jours</SelectItem>
                        <SelectItem value="annee">Année</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Calendar className="w-10 h-10 text-chart-4" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleExportExcel}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={staggerItem}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Évolution des Présences
                </CardTitle>
                <CardDescription>
                  Nombre de présents sur les {periodeJours[periode]} derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                  </div>
                ) : (
                  <PresenceChart data={presenceData} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-chart-2" />
                  Répartition par Rôle
                </CardTitle>
                <CardDescription>
                  Distribution des membres et taux de présence par rôle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <RoleDistributionChart data={roleData} />
                    <div className="mt-4">
                      <Button
                        onClick={handleExportRoleExcel}
                        disabled={isLoading}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter Statistiques Rôle
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springPresets.gentle, delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-chart-4" />
                Pointages par Heure
              </CardTitle>
              <CardDescription>
                Distribution des entrées et sorties sur 24 heures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : (
                <PointageTimelineChart data={timelineData} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springPresets.gentle, delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Taux de Présence par Membre</CardTitle>
              <CardDescription>
                Analyse individuelle des présences sur la période sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {membres.slice(0, 10).map((membre) => {
                  const pointagesMembre = pointages.filter((p) => p.membre_id === membre.id);
                  const entreesCount = pointagesMembre.filter((p) => p.type === 'Entrée').length;
                  const joursTotal = periodeJours[periode];
                  const tauxPresence = joursTotal > 0 ? (entreesCount / joursTotal) * 100 : 0;

                  return (
                    <motion.div
                      key={membre.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={springPresets.snappy}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-4">
                        {membre.photo ? (
                          <img
                            src={membre.photo}
                            alt={`${membre.prenom} ${membre.nom}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">
                            {membre.prenom} {membre.nom}
                          </p>
                          <p className="text-sm text-muted-foreground">{membre.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {Math.round(tauxPresence)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entreesCount}/{joursTotal} jours
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}