import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Package, Calendar, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { usePharmacie } from '@/hooks/usePharmacie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Alerte, NiveauPriorite } from '@/lib/index';
import { SEUIL_ABSENCE_ALERTE, SEUIL_ABSENCE_CRITIQUE } from '@/lib/index';

const STORAGE_KEY_ALERTES = 'made_alertes';

function getAlertesFromStorage(): Alerte[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ALERTES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAlertesToStorage(alertes: Alerte[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTES, JSON.stringify(alertes));
  } catch (error) {
    console.error('Erreur sauvegarde alertes:', error);
  }
}

function getPrioriteColor(priorite: NiveauPriorite): string {
  switch (priorite) {
    case 'Critique':
      return 'bg-destructive text-destructive-foreground';
    case 'Élevé':
      return 'bg-chart-4 text-background';
    case 'Moyen':
      return 'bg-chart-1 text-background';
    case 'Faible':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getPrioriteIcon(priorite: NiveauPriorite) {
  switch (priorite) {
    case 'Critique':
      return <AlertTriangle className="h-5 w-5 animate-pulse" />;
    case 'Élevé':
      return <AlertTriangle className="h-5 w-5" />;
    case 'Moyen':
      return <Clock className="h-5 w-5" />;
    case 'Faible':
      return <Clock className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
}

function getTypeIcon(type: Alerte['type']) {
  switch (type) {
    case 'Absence':
      return <XCircle className="h-5 w-5" />;
    case 'Pharmacie':
      return <Package className="h-5 w-5" />;
    case 'Badge':
      return <AlertTriangle className="h-5 w-5" />;
    case 'Événement':
      return <Calendar className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
}

export default function Alertes() {
  const { membres } = useMembers();
  const { getAlertesPharmacie } = usePharmacie();
  const [alertes, setAlertes] = useState<Alerte[]>(getAlertesFromStorage());
  const [filtreType, setFiltreType] = useState<string>('tous');
  const [filtrePriorite, setFiltrePriorite] = useState<string>('tous');
  const [filtreStatut, setFiltreStatut] = useState<string>('actives');

  const alertesGenerees = useMemo(() => {
    const now = new Date();
    const alertesActuelles: Alerte[] = [];

    membres.forEach((membre) => {
      const dernierePresence = new Date(membre.updated_at || membre.created_at);
      const joursAbsence = Math.floor((now.getTime() - dernierePresence.getTime()) / (1000 * 60 * 60 * 24));

      if (joursAbsence >= SEUIL_ABSENCE_CRITIQUE) {
        alertesActuelles.push({
          id: `absence-critique-${membre.id}`,
          type: 'Absence',
          titre: `Absence longue durée: ${membre.prenom} ${membre.nom}`,
          description: `${membre.prenom} ${membre.nom} (${membre.role}) est absent depuis ${joursAbsence} jours. Action immédiate requise.`,
          priorite: 'Critique',
          membre_id: membre.id,
          resolu: false,
          created_at: dernierePresence.toISOString(),
        });
      } else if (joursAbsence >= SEUIL_ABSENCE_ALERTE) {
        alertesActuelles.push({
          id: `absence-alerte-${membre.id}`,
          type: 'Absence',
          titre: `Absence prolongée: ${membre.prenom} ${membre.nom}`,
          description: `${membre.prenom} ${membre.nom} (${membre.role}) est absent depuis ${joursAbsence} jours.`,
          priorite: 'Élevé',
          membre_id: membre.id,
          resolu: false,
          created_at: dernierePresence.toISOString(),
        });
      }
    });

    const medicamentsAlertes = getAlertesPharmacie();
    medicamentsAlertes.forEach((med) => {
      const pourcentage = (med.stock_actuel / med.seuil_alerte) * 100;
      const priorite: NiveauPriorite = pourcentage < 25 ? 'Critique' : pourcentage < 50 ? 'Élevé' : 'Moyen';

      alertesActuelles.push({
        id: `pharmacie-${med.id}`,
        type: 'Pharmacie',
        titre: `Stock critique: ${med.nom}`,
        description: `Le stock de ${med.nom} est à ${med.stock_actuel} ${med.unite} (seuil: ${med.seuil_alerte} ${med.unite}). Réapprovisionnement nécessaire.`,
        priorite,
        medicament_id: med.id,
        resolu: false,
        created_at: med.updated_at,
      });
    });

    const alertesStockees = getAlertesFromStorage();
    const alertesNonResolues = alertesStockees.filter((a) => !a.resolu);
    const alertesResolues = alertesStockees.filter((a) => a.resolu);

    const toutesAlertes = [...alertesActuelles, ...alertesNonResolues, ...alertesResolues];
    const alertesUniques = Array.from(
      new Map(toutesAlertes.map((a) => [a.id, a])).values()
    );

    return alertesUniques.sort((a, b) => {
      if (a.resolu !== b.resolu) return a.resolu ? 1 : -1;

      const prioriteOrder: Record<NiveauPriorite, number> = {
        Critique: 0,
        Élevé: 1,
        Moyen: 2,
        Faible: 3,
      };
      return prioriteOrder[a.priorite] - prioriteOrder[b.priorite];
    });
  }, [membres, getAlertesPharmacie]);

  const alertesFiltrees = useMemo(() => {
    return alertesGenerees.filter((alerte) => {
      if (filtreType !== 'tous' && alerte.type !== filtreType) return false;
      if (filtrePriorite !== 'tous' && alerte.priorite !== filtrePriorite) return false;
      if (filtreStatut === 'actives' && alerte.resolu) return false;
      if (filtreStatut === 'resolues' && !alerte.resolu) return false;
      return true;
    });
  }, [alertesGenerees, filtreType, filtrePriorite, filtreStatut]);

  const statistiques = useMemo(() => {
    const actives = alertesGenerees.filter((a) => !a.resolu);
    return {
      total: alertesGenerees.length,
      actives: actives.length,
      critiques: actives.filter((a) => a.priorite === 'Critique').length,
      elevees: actives.filter((a) => a.priorite === 'Élevé').length,
      moyennes: actives.filter((a) => a.priorite === 'Moyen').length,
      resolues: alertesGenerees.filter((a) => a.resolu).length,
    };
  }, [alertesGenerees]);

  const resoudreAlerte = (alerteId: string) => {
    const alertesMAJ = alertesGenerees.map((a) =>
      a.id === alerteId
        ? { ...a, resolu: true, resolved_at: new Date().toISOString() }
        : a
    );
    setAlertes(alertesMAJ);
    saveAlertesToStorage(alertesMAJ);
    toast.success('Alerte résolue', {
      description: 'L\'alerte a été marquée comme résolue',
    });
  };

  const supprimerAlerte = (alerteId: string) => {
    const alertesMAJ = alertesGenerees.filter((a) => a.id !== alerteId);
    setAlertes(alertesMAJ);
    saveAlertesToStorage(alertesMAJ);
    toast.success('Alerte supprimée', {
      description: 'L\'alerte a été supprimée définitivement',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Alertes</h1>
        <p className="text-muted-foreground mt-2">
          Gestion des alertes critiques et notifications importantes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-destructive/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertes Critiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {statistiques.critiques}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-chart-4/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Priorité Élevée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4">
                {statistiques.elevees}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertes Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistiques.actives}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertes Résolues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2">
                {statistiques.resolues}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>Filtrer les alertes par type, priorité et statut</CardDescription>
            </div>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filtreType} onValueChange={setFiltreType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les types</SelectItem>
                  <SelectItem value="Absence">Absence</SelectItem>
                  <SelectItem value="Pharmacie">Pharmacie</SelectItem>
                  <SelectItem value="Badge">Badge</SelectItem>
                  <SelectItem value="Événement">Événement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priorité</label>
              <Select value={filtrePriorite} onValueChange={setFiltrePriorite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes les priorités</SelectItem>
                  <SelectItem value="Critique">Critique</SelectItem>
                  <SelectItem value="Élevé">Élevé</SelectItem>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Faible">Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={filtreStatut} onValueChange={setFiltreStatut}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes</SelectItem>
                  <SelectItem value="actives">Actives</SelectItem>
                  <SelectItem value="resolues">Résolues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {alertesFiltrees.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-chart-2 mb-4" />
              <p className="text-lg font-medium">Aucune alerte</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filtreStatut === 'actives'
                  ? 'Aucune alerte active pour le moment'
                  : 'Aucune alerte ne correspond aux filtres sélectionnés'}
              </p>
            </CardContent>
          </Card>
        ) : (
          alertesFiltrees.map((alerte, index) => (
            <motion.div
              key={alerte.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`${
                  alerte.priorite === 'Critique' && !alerte.resolu
                    ? 'border-destructive/50 animate-pulse'
                    : ''
                } ${alerte.resolu ? 'opacity-60' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-lg ${
                          alerte.resolu ? 'bg-muted' : getPrioriteColor(alerte.priorite)
                        }`}
                      >
                        {getTypeIcon(alerte.type)}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{alerte.titre}</h3>
                          <Badge variant="outline" className="text-xs">
                            {alerte.type}
                          </Badge>
                          <Badge className={getPrioriteColor(alerte.priorite)}>
                            <span className="flex items-center gap-1">
                              {getPrioriteIcon(alerte.priorite)}
                              {alerte.priorite}
                            </span>
                          </Badge>
                          {alerte.resolu && (
                            <Badge variant="outline" className="bg-chart-2/10 text-chart-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Résolue
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {alerte.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(alerte.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {alerte.resolved_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Résolue le{' '}
                              {new Date(alerte.resolved_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        {!alerte.resolu && (
                          <div className="pt-2">
                            <p className="text-sm font-medium mb-2">Actions recommandées:</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                              {alerte.type === 'Absence' && (
                                <>
                                  <li>Contacter le membre ou sa famille</li>
                                  <li>Vérifier les raisons de l'absence</li>
                                  <li>Mettre à jour le statut si nécessaire</li>
                                </>
                              )}
                              {alerte.type === 'Pharmacie' && (
                                <>
                                  <li>Commander le réapprovisionnement</li>
                                  <li>Vérifier les fournisseurs disponibles</li>
                                  <li>Mettre à jour le stock après réception</li>
                                </>
                              )}
                              {alerte.type === 'Badge' && (
                                <>
                                  <li>Générer un nouveau badge</li>
                                  <li>Informer le membre concerné</li>
                                  <li>Mettre à jour les informations</li>
                                </>
                              )}
                              {alerte.type === 'Événement' && (
                                <>
                                  <li>Reprogrammer l'événement si nécessaire</li>
                                  <li>Informer les participants</li>
                                  <li>Mettre à jour le calendrier</li>
                                </>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!alerte.resolu && (
                        <Button
                          size="sm"
                          onClick={() => resoudreAlerte(alerte.id)}
                          className="whitespace-nowrap"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Résoudre
                        </Button>
                      )}
                      {alerte.resolu && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => supprimerAlerte(alerte.id)}
                          className="whitespace-nowrap"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
