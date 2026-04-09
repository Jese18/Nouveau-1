import { motion } from 'framer-motion';
import { Users, UserCheck, AlertTriangle, Pill } from 'lucide-react';
import { StatCard, StatCards } from '@/components/StatCards';
import { PresenceChart, RoleDistributionChart } from '@/components/Charts';
import { EvacuationButton } from '@/components/EvacuationButton';
import { useMembers } from '@/hooks/useMembers';
import { usePointages } from '@/hooks/usePointages';
import { usePharmacie } from '@/hooks/usePharmacie';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StatistiquePointage, StatistiqueRole, Membre } from '@/lib/index';

export default function Dashboard() {
  const { membres, isLoading: isLoadingMembres } = useMembers();
  const { statistiques, isLoadingStatistiques, pointages, getPointagesParJour, refetch } = usePointages();
  const { getAlertesPharmacie, getStatistiquesPharmacie } = usePharmacie();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const alertesPharmacie = getAlertesPharmacie();
  const statsPharmacie = getStatistiquesPharmacie();

  const statsCards = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Total Membres',
      value: statistiques?.total_membres || 0,
      color: 'text-primary',
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: 'Présents Aujourd\'hui',
      value: statistiques?.presents_aujourdhui || 0,
      variation: statistiques?.taux_presence,
      color: 'text-chart-2',
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Absents 3+ Jours',
      value: (statistiques?.absents_3_jours || 0) + (statistiques?.absents_longue_duree || 0),
      color: 'text-destructive',
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: 'Alertes Pharmacie',
      value: statsPharmacie.medicaments_en_alerte,
      color: 'text-chart-4',
    },
  ];

  // Calculer les membres présents aujourd'hui
  const aujourdhui = new Date().toISOString().split('T')[0];
  const pointagesAujourdhui = pointages.filter((p) => p.date_heure.startsWith(aujourdhui));
  const presentIds = new Set(
    pointagesAujourdhui.filter((p) => p.type === 'Entrée').map((p) => p.membre_id)
  );
  const presentsAujourdhui = membres.filter((m) => presentIds.has(m.id));

  const roleDistribution: StatistiqueRole[] = [
    {
      role: 'Personnel',
      total: membres.filter((m: Membre) => m.role === 'Personnel').length,
      presents: presentsAujourdhui.filter((m: Membre) => m.role === 'Personnel').length,
      absents: membres.filter((m: Membre) => m.role === 'Personnel').length - presentsAujourdhui.filter((m: Membre) => m.role === 'Personnel').length,
    },
    {
      role: 'Mère',
      total: membres.filter((m: Membre) => m.role === 'Mère').length,
      presents: presentsAujourdhui.filter((m: Membre) => m.role === 'Mère').length,
      absents: membres.filter((m: Membre) => m.role === 'Mère').length - presentsAujourdhui.filter((m: Membre) => m.role === 'Mère').length,
    },
    {
      role: 'Enfant',
      total: membres.filter((m: Membre) => m.role === 'Enfant').length,
      presents: presentsAujourdhui.filter((m: Membre) => m.role === 'Enfant').length,
      absents: membres.filter((m: Membre) => m.role === 'Enfant').length - presentsAujourdhui.filter((m: Membre) => m.role === 'Enfant').length,
    },
    {
      role: 'Bénéficiaire',
      total: membres.filter((m: Membre) => m.role === 'Bénéficiaire').length,
      presents: presentsAujourdhui.filter((m: Membre) => m.role === 'Bénéficiaire').length,
      absents: membres.filter((m: Membre) => m.role === 'Bénéficiaire').length - presentsAujourdhui.filter((m: Membre) => m.role === 'Bénéficiaire').length,
    },
  ];

  const derniersPointages = pointages.slice(0, 10);

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble en temps réel</p>
        </div>
        <EvacuationButton />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat, index) => (
          <motion.div key={index} variants={staggerItem}>
            <StatCard
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              variation={stat.variation}
              color={stat.color}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Présences (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <PresenceChart data={[]} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Répartition par Rôle</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleDistributionChart data={roleDistribution} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Derniers Pointages</CardTitle>
          </CardHeader>
          <CardContent>
            {derniersPointages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Aucun pointage récent</p>
            ) : (
              <div className="space-y-3">
                {derniersPointages.map((pointage) => (
                  <div
                    key={pointage.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {pointage.membre?.photo && (
                        <img
                          src={pointage.membre.photo}
                          alt={`${pointage.membre.nom} ${pointage.membre.prenom}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {pointage.membre?.nom} {pointage.membre?.prenom}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(pointage.date_heure).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={pointage.type === 'Entrée' ? 'default' : 'secondary'}
                        className={pointage.type === 'Entrée' ? 'bg-chart-2 text-white' : 'bg-primary text-primary-foreground'}
                      >
                        {pointage.type}
                      </Badge>
                      <Badge variant="outline" className="text-muted-foreground">
                        {pointage.methode}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}