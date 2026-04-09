import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPointages,
  addPointage,
  getMemberById,
  syncOfflineData,
} from '@/lib/supabase';
import type {
  Pointage,
  PointageRecord,
  Membre,
  TypePointage,
  MethodePointage,
  StatistiquePresence,
  StatistiquePointage,
  StatutPresence,
  SEUIL_ABSENCE_ALERTE,
  SEUIL_ABSENCE_CRITIQUE,
} from '@/lib/index';

interface PointageFilters {
  membre_id?: string;
  date_debut?: string;
  date_fin?: string;
}

interface AddPointageParams {
  membre_id: string;
  methode: MethodePointage;
}

interface MembreStatusResult {
  status: StatutPresence;
  dernierPointage?: Pointage;
  joursAbsence: number;
}

const QUERY_KEYS = {
  pointages: (filters?: PointageFilters) => ['pointages', filters],
  membreStatus: (membreId: string) => ['membre-status', membreId],
  statistiques: () => ['pointages-statistiques'],
};

export function usePointages(filters?: PointageFilters) {
  const queryClient = useQueryClient();

  const pointagesQuery = useQuery({
    queryKey: QUERY_KEYS.pointages(filters),
    queryFn: async () => {
      const pointages = await getPointages(filters);
      const pointagesWithMembre: PointageRecord[] = await Promise.all(
        pointages.map(async (pointage) => {
          const membre = await getMemberById(pointage.membre_id);
          return { ...pointage, membre: membre || undefined };
        })
      );
      return pointagesWithMembre;
    },
    staleTime: 10000,
  });

  const addPointageMutation = useMutation({
    mutationFn: async ({ membre_id, methode }: AddPointageParams) => {
      const dernierType = await getDernierTypePointage(membre_id);
      const nouveauType: TypePointage = dernierType === 'Entrée' ? 'Sortie' : 'Entrée';
      const pointage = await addPointage(membre_id, nouveauType, methode);
      if (!pointage) throw new Error('Échec ajout pointage');
      return { pointage, type: nouveauType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointages'] });
      queryClient.invalidateQueries({ queryKey: ['membre-status'] });
      queryClient.invalidateQueries({ queryKey: ['pointages-statistiques'] });
      syncOfflineData();
    },
  });

  const getMembreStatusQuery = (membreId: string) =>
    useQuery({
      queryKey: QUERY_KEYS.membreStatus(membreId),
      queryFn: async (): Promise<MembreStatusResult> => {
        const pointages = await getPointages({ membre_id: membreId });
        if (pointages.length === 0) {
          return { status: 'Absent', joursAbsence: 0 };
        }

        const dernierPointage = pointages[0];
        const maintenant = new Date();
        const datePointage = new Date(dernierPointage.date_heure);
        const joursDepuis = Math.floor(
          (maintenant.getTime() - datePointage.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dernierPointage.type === 'Entrée') {
          const sortieTrouvee = pointages.find(
            (p) =>
              p.type === 'Sortie' &&
              new Date(p.date_heure) > datePointage &&
              new Date(p.date_heure).toDateString() === datePointage.toDateString()
          );
          if (!sortieTrouvee) {
            return { status: 'Présent', dernierPointage, joursAbsence: 0 };
          }
        }

        if (joursDepuis >= 7) {
          return { status: 'Absent longue durée', dernierPointage, joursAbsence: joursDepuis };
        } else if (joursDepuis >= 3) {
          return { status: 'Absent', dernierPointage, joursAbsence: joursDepuis };
        }

        return { status: 'Absent', dernierPointage, joursAbsence: joursDepuis };
      },
      staleTime: 5000,
    });

  const statistiquesQuery = useQuery({
    queryKey: QUERY_KEYS.statistiques(),
    queryFn: async (): Promise<StatistiquePresence> => {
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      const demain = new Date(aujourdhui);
      demain.setDate(demain.getDate() + 1);

      const pointagesAujourdhui = await getPointages({
        date_debut: aujourdhui.toISOString(),
        date_fin: demain.toISOString(),
      });

      const membresPresents = new Set<string>();
      pointagesAujourdhui.forEach((p) => {
        if (p.type === 'Entrée') {
          membresPresents.add(p.membre_id);
        }
      });

      const tousPointages = await getPointages();
      const tousMembreIds = new Set(tousPointages.map((p) => p.membre_id));

      let absents3Jours = 0;
      let absentsLongueDuree = 0;

      for (const membreId of tousMembreIds) {
        if (membresPresents.has(membreId)) continue;

        const pointagesMembre = tousPointages.filter((p) => p.membre_id === membreId);
        if (pointagesMembre.length === 0) continue;

        const dernierPointage = pointagesMembre[0];
        const joursDepuis = Math.floor(
          (Date.now() - new Date(dernierPointage.date_heure).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (joursDepuis >= 7) {
          absentsLongueDuree++;
        } else if (joursDepuis >= 3) {
          absents3Jours++;
        }
      }

      const totalMembres = tousMembreIds.size;
      const presentsAujourdhui = membresPresents.size;
      const tauxPresence = totalMembres > 0 ? (presentsAujourdhui / totalMembres) * 100 : 0;

      return {
        total_membres: totalMembres,
        presents_aujourdhui: presentsAujourdhui,
        absents_3_jours: absents3Jours,
        absents_longue_duree: absentsLongueDuree,
        taux_presence: Math.round(tauxPresence * 10) / 10,
      };
    },
    staleTime: 30000,
  });

  const getPointagesParJour = async (jours: number = 7): Promise<StatistiquePointage[]> => {
    const stats: StatistiquePointage[] = [];
    const aujourdhui = new Date();

    for (let i = jours - 1; i >= 0; i--) {
      const date = new Date(aujourdhui);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateFin = new Date(date);
      dateFin.setDate(dateFin.getDate() + 1);

      const pointagesJour = await getPointages({
        date_debut: date.toISOString(),
        date_fin: dateFin.toISOString(),
      });

      const entrees = pointagesJour.filter((p) => p.type === 'Entrée').length;
      const sorties = pointagesJour.filter((p) => p.type === 'Sortie').length;
      const membresPresents = new Set(
        pointagesJour.filter((p) => p.type === 'Entrée').map((p) => p.membre_id)
      ).size;

      stats.push({
        date: date.toISOString().split('T')[0],
        entrees,
        sorties,
        presents: membresPresents,
      });
    }

    return stats;
  };

  return {
    pointages: pointagesQuery.data || [],
    isLoading: pointagesQuery.isLoading,
    isError: pointagesQuery.isError,
    error: pointagesQuery.error,
    addPointage: addPointageMutation.mutate,
    isAddingPointage: addPointageMutation.isPending,
    getMembreStatus: getMembreStatusQuery,
    statistiques: statistiquesQuery.data,
    isLoadingStatistiques: statistiquesQuery.isLoading,
    getPointagesParJour,
    refetch: pointagesQuery.refetch,
  };
}

async function getDernierTypePointage(membreId: string): Promise<TypePointage | null> {
  const pointages = await getPointages({ membre_id: membreId });
  if (pointages.length === 0) return null;
  return pointages[0].type;
}

export function getMembreStatus(pointages: Pointage[]): MembreStatusResult {
  if (pointages.length === 0) {
    return { status: 'Absent', joursAbsence: 0 };
  }

  const dernierPointage = pointages[0];
  const maintenant = new Date();
  const datePointage = new Date(dernierPointage.date_heure);
  const joursDepuis = Math.floor(
    (maintenant.getTime() - datePointage.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dernierPointage.type === 'Entrée') {
    const sortieTrouvee = pointages.find(
      (p) =>
        p.type === 'Sortie' &&
        new Date(p.date_heure) > datePointage &&
        new Date(p.date_heure).toDateString() === datePointage.toDateString()
    );
    if (!sortieTrouvee) {
      return { status: 'Présent', dernierPointage, joursAbsence: 0 };
    }
  }

  if (joursDepuis >= 7) {
    return { status: 'Absent longue durée', dernierPointage, joursAbsence: joursDepuis };
  } else if (joursDepuis >= 3) {
    return { status: 'Absent', dernierPointage, joursAbsence: joursDepuis };
  }

  return { status: 'Absent', dernierPointage, joursAbsence: joursDepuis };
}
