import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, RefreshCw, Filter } from 'lucide-react';
import { MembreCard } from '@/components/MembreCard';
import { useMembers } from '@/hooks/useMembers';
import { usePointages } from '@/hooks/usePointages';
import { exportPresenceToExcel } from '@/lib/excel-generator';
import { generatePresenceListPDF } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Role, StatutPresence } from '@/lib/index';
import { staggerContainer, staggerItem, springPresets } from '@/lib/motion';

export default function ListePresence() {
  const { membres, isLoading, refetch } = useMembers();
  const { pointages, statistiques, isLoadingStatistiques, getMembreStatus } = usePointages();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statutFilter, setStatutFilter] = useState<StatutPresence | 'all'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const membresWithStatus = membres.map((membre) => {
    const { data: statusData } = getMembreStatus(membre.id);
    return {
      ...membre,
      statutPresence: statusData?.status || 'Absent',
      joursAbsence: statusData?.joursAbsence || 0,
    };
  });

  const filteredMembres = membresWithStatus.filter((membre) => {
    const matchesSearch =
      membre.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membre.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membre.code_barre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || membre.role === roleFilter;
    const matchesStatut = statutFilter === 'all' || membre.statutPresence === statutFilter;

    return matchesSearch && matchesRole && matchesStatut;
  });

  const handleExportExcel = () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      exportPresenceToExcel(membres, pointages, date);
      toast.success('Export Excel réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      generatePresenceListPDF(filteredMembres, date);
      toast.success('Export PDF réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF');
      console.error(error);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Liste actualisée');
  };

  const getStatutColor = (statut: StatutPresence) => {
    switch (statut) {
      case 'Présent':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Absent':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Absent longue durée':
        return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const statsCards = [
    {
      title: 'Total Membres',
      value: statistiques?.total_membres || 0,
      color: 'text-primary',
    },
    {
      title: 'Présents Aujourd\'hui',
      value: statistiques?.presents_aujourdhui || 0,
      color: 'text-green-400',
    },
    {
      title: 'Absents 3+ Jours',
      value: statistiques?.absents_3_jours || 0,
      color: 'text-orange-400',
    },
    {
      title: 'Absents Longue Durée',
      value: statistiques?.absents_longue_duree || 0,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Liste de Présence</h1>
            <p className="text-muted-foreground mt-2">
              Suivi en temps réel - Actualisation automatique toutes les 10 secondes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statsCards.map((stat, index) => (
            <motion.div key={index} variants={staggerItem}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {isLoadingStatistiques ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-xl">Filtres et Recherche</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom ou code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as Role | 'all')}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="Personnel">Personnel</SelectItem>
                  <SelectItem value="Mère">Mère</SelectItem>
                  <SelectItem value="Enfant">Enfant</SelectItem>
                  <SelectItem value="Bénéficiaire">Bénéficiaire</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statutFilter}
                onValueChange={(value) => setStatutFilter(value as StatutPresence | 'all')}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Présent">Présent</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Absent longue durée">Absent longue durée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                Présent
              </Badge>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                Absent 3+ jours
              </Badge>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 animate-pulse">
                Absent longue durée
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredMembres.length} membre{filteredMembres.length > 1 ? 's' : ''} affiché{filteredMembres.length > 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMembres.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Aucun membre trouvé</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMembres.map((membre) => (
              <motion.div key={membre.id} variants={staggerItem}>
                <div className="relative">
                  <MembreCard
                    membre={membre}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onGenerateBadge={() => {}}
                    statutPresence={membre.statutPresence}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={getStatutColor(membre.statutPresence)}
                    >
                      {membre.statutPresence}
                      {membre.joursAbsence > 0 && ` (${membre.joursAbsence}j)`}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
